# UtkarshAI 🚀 
**Your Premium AI Study Companion**

UtkarshAI is an advanced, AI-powered study assistant built to transform any academic material into interactive, personalized learning modules in seconds. Powered by the ultra-fast **Groq LLaMA 3.3 engine**, UtkarshAI allows you to upload lecture slides, PDF readings, or raw text and automatically generates executive summaries, key takeaways, vocabulary flashcards, and interactive quizzes.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Python-818CF8?style=for-the-badge)

## ✨ Core Features
- 📄 **Universal Document Processing**: Supports PDF, DOCX, PPTX, and TXT files natively (up to 50MB!). A custom recursive Python algorithm accurately extracts text even from densely embedded grouped shapes and nested slide tables.
- ✍️ **Raw Text Processing**: Instantly paste massive amounts of raw notes, lecture transcripts, or articles directly into the dashboard.
- 🧠 **Smart Summaries**: Instantly extract the core concepts and an executive summary from your documents.
- ⚡ **Automated Flashcards**: Identifies and extracts 5 highly relevant vocabulary terms and clear definitions from your text.
- 🎯 **Interactive Quizzes**: Dynamically tests your understanding with custom multiple-choice questions, complete with a 45-second timer per question and instant correctness validation.
- 📈 **Real-Time Analytics**: Tracks your historical test scores locally inside SQLite to help you monitor your learning progress over time.

---

## 🛠️ Tech Stack
- **Frontend**: React.js, Vite, Vanilla CSS (Premium Dark Mode & Glassmorphism Aesthetics)
- **Backend**: Node.js, Express.js, SQLite3
- **AI Processing**: Groq SDK (`llama-3.3-70b-versatile`)
- **Document Extractors (Python)**: `PyMuPDF` (fitz), `pdfplumber`, `python-docx`, `python-pptx`, `pytesseract`

---

## 💻 Running Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v16+)
- **Python** (v3.9+)

### 2. Install Backend & Environment Setup
Open a terminal and navigate to the `backend` folder:
```bash
cd backend
npm install

# Install the Python extraction tools
pip install PyMuPDF pdfplumber python-docx python-pptx pdf2image pytesseract
```

Create a `.env` file inside the `backend` folder and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

### 3. Install Frontend Setup
Open a second terminal and navigate to the `frontend` folder:
```bash
cd frontend
npm install
```
*(No environment variables are strictly necessary for local dev since it defaults to `http://localhost:3000/api`)*

### 4. Start the Application
Start both servers simultaneously in their respective terminals:

**Backend:**
```bash
cd backend
node server.js
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to experience UtkarshAI!

---

