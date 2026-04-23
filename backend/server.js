const express = require('express');
const cors = require('cors');
const multer = require('multer');

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up SQLite DB
const db = new sqlite3.Database('./study_assistant.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      text_content TEXT,
      summary TEXT,
      summary TEXT,
      key_points TEXT,
      flashcards TEXT
    )
  `);
  
  // Try to alter table to add flashcards safely if it exists from before
  db.run(`ALTER TABLE documents ADD COLUMN flashcards TEXT`, (err) => {
    // Note: This will error if the column already exists, which is fine
  });
  
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER,
      question TEXT,
      options TEXT,
      correctIndex INTEGER,
      FOREIGN KEY(document_id) REFERENCES documents(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER,
      score INTEGER,
      total_questions INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(document_id) REFERENCES documents(id)
    )
  `);
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 }});

const Groq = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY // Ensure you create a .env file containing this!
});

// --- Actual AI Integration (Groq) ---
// Using Groq for fast inference. We enforce JSON formatting via prompt and response_format.
async function processWithAI(text) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not defined in the environment variables.');
  }

  // Pre-process: truncation to prevent going vastly over token limits on initial iterations
  const cleanText = text.substring(0, 30000); 

  const prompt = `You are an academic content analyzer.
The input text is extracted from a document (PDF, PPT, DOCX, etc.), and may contain noise such as:
- watermarks (e.g., "Studocu")
- download metadata (e.g., "Downloaded by...")
- repeated headers/footers
- irrelevant boilerplate text
- platform names, email addresses, page numbers

Your task:
Ignore all irrelevant content. Focus only on meaningful academic/study content.
Identify the actual subject/topic of the document.
If the first part of the text has no real content, look deeper into the text before concluding.
Do NOT say "no content" unless the entire document truly has no academic material.
Prioritize conceptual and educational content over metadata. Assume useful content may appear later in the document.
The document may contain handwritten notes or scanned content. Interpret it as study material and extract meaning even if formatting is imperfect.

Analyze the text deeply and return a JSON object containing EXACTLY:
1. "summary": A combination of the Subject and a concise Executive Summary (3-5 lines) of the document.
2. "keyPoints": A list of 3-6 Key Topics Covered and Important Concepts extracted from the text as an array of strings.
3. "flashcards": A list of 5 important terms and definitions from the text. Each object must have:
   - "term": the concept name as a string
   - "definition": a clear, 1-2 sentence definition as a string
4. "quiz": A list of exactly 5 multiple choice questions testing knowledge from the text. Each question must have:
   - "question": The question text as a string.
   - "options": Exactly 4 options as an array of strings.
   - "correctIndex": The index of the correct option (0-3) as an integer.

This JSON response should represent the expected schema for frontend components. You must reply with valid JSON only. Return only the JSON object.

Text to analyze:
"""
${cleanText}
"""
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile", // Updated to current supported model
      response_format: { type: "json_object" }, // Enforcing JSON output
    });
    
    // Parse the JSON string from the response
    const jsonString = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(jsonString);
    return result;
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Specific error handling for rate limits
    if (error.status === 429) {
      throw new Error("Groq API rate limit exceeded. Please try again later.");
    }
    throw new Error("Failed to generate AI data.");
  }
}


// --- API Endpoints ---

// 1. Process document or raw text
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    let extractedText = '';
    let originalname = 'Raw_Text_Input.txt';

    if (req.body.rawText) {
      extractedText = req.body.rawText;
      originalname = req.body.fileName || 'Pasted_Notes.txt';
    } else if (req.file) {
      originalname = req.file.originalname;
      
      const ext = path.extname(req.file.originalname) || '';
      const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}${ext}`);
      fs.writeFileSync(tempFilePath, req.file.buffer);

      try {
        // Execute the python script with a larger maxBuffer (50MB) for 125+ page documents
        const { stdout, stderr } = await execFileAsync('python', [
          path.join(__dirname, 'extractor.py'),
          tempFilePath
        ], { maxBuffer: 50 * 1024 * 1024 });
        
        if (stderr) {
          console.warn('Python extractor stderr:', stderr);
        }
        extractedText = stdout;
      } catch (err) {
        console.error('Extraction script error:', err);
        // Fallback only if plain text, otherwise avoid binary gibberish
        if (ext === '.txt' || ext === '.md' || ext === '.csv') {
          extractedText = req.file.buffer.toString('utf-8');
        } else {
          return res.status(400).json({ error: 'Failed to extract text from the document. The file might be corrupted or too large.' });
        }
      } finally {
        // Clean up the temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    if (!extractedText.trim()) return res.status(400).json({ error: 'Document appears to be empty or extraction failed.' });

    // AI Processing
    const result = await processWithAI(extractedText);

    // Save to DB
    db.run(
      `INSERT INTO documents (filename, text_content, summary, key_points, flashcards) VALUES (?, ?, ?, ?, ?)`,
      [originalname, extractedText, result.summary, JSON.stringify(result.keyPoints), JSON.stringify(result.flashcards || [])],
      function(err) {
        if (err) {
          console.error('DB Error saving doc:', err);
          return res.status(500).json({ error: 'DB Error saving doc' });
        }
        
        const docId = this.lastID;
        
        // Save questions
        const stmt = db.prepare(`INSERT INTO questions (document_id, question, options, correctIndex) VALUES (?, ?, ?, ?)`);
        result.quiz.forEach(q => {
          stmt.run([docId, q.question, JSON.stringify(q.options), q.correctIndex]);
        });
        stmt.finalize();

        res.json({
          documentId: docId,
          filename: originalname,
          summary: result.summary,
          keyPoints: result.keyPoints,
          flashcards: result.flashcards || [],
          quiz: result.quiz
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

app.post('/api/submit', (req, res) => {
  const { documentId, score, totalQuestions } = req.body;
  if (!documentId) return res.status(400).json({ error: 'Missing documentId' });

  db.run(
    `INSERT INTO attempts (document_id, score, total_questions) VALUES (?, ?, ?)`,
    [documentId, score, totalQuestions],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to save attempt' });
      res.json({ success: true, attemptId: this.lastID });
    }
  );
});

app.get('/api/analytics', (req, res) => {
  db.all(
    `SELECT d.filename, a.score, a.total_questions, a.created_at
     FROM attempts a
     JOIN documents d ON a.document_id = d.id
     ORDER BY a.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch analytics' });
      res.json(rows);
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
