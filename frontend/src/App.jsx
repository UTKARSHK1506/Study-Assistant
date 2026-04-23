import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// Base URL for backend APIs (Supports production via Vercel/Render)
const API_URL = import.meta.env.VITE_API_URL || 'https://study-assistant-production-3b09.up.railway.app/api';

export default function App() {
  const [appState, setAppState] = useState('home'); // home, login, dashboard, processing, results, analytics
  const [documentName, setDocumentName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [rawTextInput, setRawTextInput] = useState('');
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startProcessing(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      startProcessing(e.target.files[0]);
    }
  };

  const startProcessing = async (file) => {
    setDocumentName(file.name);
    setAppState('processing');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      setResults(data);
      setAppState('results');
    } catch (err) {
      setErrorMsg(err.message);
      setAppState('dashboard');
    }
  };

  const startProcessingText = async () => {
    if (!rawTextInput.trim()) return;
    setDocumentName('Pasted Notes');
    setAppState('processing');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('rawText', rawTextInput);
    formData.append('fileName', 'Pasted_Notes.txt');

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      setResults(data);
      setAppState('results');
    } catch (err) {
      setErrorMsg(err.message);
      setAppState('dashboard');
    }
  };

  if (appState === 'home') {
    return (
      <div className="home-container fade-in">
        <nav className="home-nav">
          <div className="login-logo" style={{ flexDirection: 'row', marginBottom: 0 }}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad-home)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <defs>
                 <linearGradient id="logo-grad-home" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#818CF8" />
                   <stop offset="100%" stopColor="#C084FC" />
                 </linearGradient>
               </defs>
               <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
             </svg>
             <h1 style={{margin: 0, fontSize: '1.5rem', background: 'linear-gradient(to right, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>UtkarshAI</h1>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={() => setAppState('login')} style={{ marginRight: '16px' }}>Log In</button>
            <button className="btn" onClick={() => setAppState('login')}>Sign Up</button>
          </div>
        </nav>
        
        <main className="hero-section">
          <div className="badge">✨ The Future of Learning</div>
          <h1 className="hero-title">Unlock Your Academic Potential</h1>
          <p className="hero-subtitle">Transform any lecture, reading, or research paper into an interactive study guide. UtkarshAI extracts key insights and generates personalized quizzes in seconds.</p>
          
          <div className="hero-cta">
            <button className="btn btn-large" onClick={() => setAppState('login')}>
              Start Learning for Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">📚</div>
              <h3>Smart Summaries</h3>
              <p>Instantly extract the core concepts and executive summaries from lengthy PDFs and text documents.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🎯</div>
              <h3>Interactive Quizzes</h3>
              <p>AI automatically generates customized multiple-choice tests to validate your understanding dynamically.</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📈</div>
              <h3>Real-time Analytics</h3>
              <p>Track your scores, monitor your attempt history, and scientifically improve your study technique.</p>
            </div>
          </div>
        </main>
        
        <div className="home-background-elements">
           <div className="glow-orb orb-1"></div>
           <div className="glow-orb orb-2"></div>
        </div>
      </div>
    );
  }

  if (appState === 'login') {
    return (
      <div className="login-container fade-in">
        <div className="login-card card">
           <div className="login-logo">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <defs>
                 <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#818CF8" />
                   <stop offset="100%" stopColor="#C084FC" />
                 </linearGradient>
               </defs>
               <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
             </svg>
             <h1 style={{margin: 0, fontSize: '2.2rem', background: 'linear-gradient(to right, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>UtkarshAI</h1>
           </div>
           <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '8px 0 32px' }}>Welcome back to your premium study assistant.</p>
           
           <div className="input-group">
             <label>Email Address</label>
             <input type="email" placeholder="you@example.com" className="input-field" />
           </div>
           
           <div className="input-group">
             <label>Password</label>
             <input type="password" placeholder="••••••••" className="input-field" />
           </div>
           
           <button className="btn btn-full" onClick={() => setAppState('dashboard')}>
             Sign In
           </button>
           
           <div style={{ marginTop: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
             Don't have an account? <span className="highlight" style={{cursor: 'pointer'}}>Sign up</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-title">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          UtkarshAI
        </div>
        <nav>
          <div className={`nav-item ${appState === 'dashboard' ? 'active' : ''}`} onClick={() => setAppState('dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </div>
          {results && (
            <div className={`nav-item ${appState === 'results' ? 'active' : ''}`} onClick={() => setAppState('results')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              Current Document
            </div>
          )}
          <div className={`nav-item ${appState === 'analytics' ? 'active' : ''}`} onClick={() => setAppState('analytics')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            Analytics
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.9rem', borderColor: 'var(--error)', color: 'var(--error)' }} 
            onClick={() => {
              setResults(null);
              setDocumentName('');
              setRawTextInput('');
              setAppState('home');
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>

        {appState === 'dashboard' && (
          <div className="fade-in">
            <h1>Workspace</h1>
            <p className="subtitle">Upload a document to generate personalized study materials and quizzes.</p>
            
            {errorMsg && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                 <strong>Error:</strong> {errorMsg}
              </div>
            )}

            <div 
              className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <svg className="upload-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary-accent)" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <h2>Drag & drop your file here</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>Supported formats: PDF, DOCX, PPTX, TXT (Max 50MB)</p>
              <button className="btn">Browse Files</button>
              <input 
                id="file-upload" 
                type="file" 
                accept=".pdf,.txt,.docx,.pptx" 
                style={{ display: "none" }} 
                onChange={handleFileSelect}
              />
            </div>

            <div className="text-input-section" style={{ marginTop: '40px' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Or paste your text directly</h2>
              <textarea 
                className="input-field" 
                style={{ minHeight: '160px', resize: 'vertical', marginBottom: '16px' }} 
                placeholder="Paste lengthy notes, articles, or lecture transcripts here..."
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
              ></textarea>
              <button className="btn" onClick={startProcessingText} disabled={!rawTextInput.trim()}>
                Process Pasted Text
              </button>
            </div>
          </div>
        )}

        {appState === 'processing' && (
          <div className="fade-in">
             <div style={{ marginBottom: '40px' }}>
                <h1>Processing Document</h1>
                <p className="subtitle">{documentName}</p>
             </div>
             
             <div className="processing-container">
               <div className="stepper">
                 <div className="step completed">
                   <div className="step-circle"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                   <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Document Uploaded</div>
                 </div>
                 <div className="step active">
                   <div className="step-circle">2</div>
                   <div style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)' }}>AI Processing & Text Extraction</div>
                 </div>
                 <div className="step">
                   <div className="step-circle">3</div>
                   <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>Generating Interactive Quiz</div>
                 </div>
               </div>

               <div className="card" style={{ width: '100%', padding: '40px' }}>
                 <div className="skeleton skeleton-title"></div>
                 <div className="skeleton skeleton-line"></div>
                 <div className="skeleton skeleton-line"></div>
                 <div className="skeleton skeleton-line"></div>
                 <div className="skeleton skeleton-line short"></div>
                 <p style={{marginTop: '20px', color: 'var(--text-secondary)'}}>This may take a few seconds...</p>
               </div>
             </div>
          </div>
        )}

        {appState === 'results' && results && (
          <div className="fade-in results-grid">
            <div className="results-left">
              <h1>{documentName.replace('.pdf', '')}</h1>
              <p className="subtitle">AI-generated study guide and key insights based on real text.</p>
              
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-accent)" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  <h2 style={{ margin: 0 }}>Executive Summary</h2>
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                  {results.summary}
                </p>
              </div>

              <h2 style={{ marginTop: '40px', marginBottom: '24px' }}>Key Takeaways</h2>
              <div className="key-points-list">
                {results.keyPoints.map((point, i) => (
                  <div key={i} className="card key-point-item" style={{ marginBottom: '16px', padding: '20px' }}>
                    <div className="key-point-number">{i + 1}</div>
                    <div style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{point}</div>
                  </div>
                ))}
              </div>

              {results.flashcards && results.flashcards.length > 0 && (
                <>
                  <h2 style={{ marginTop: '40px', marginBottom: '24px' }}>Flashcards</h2>
                  <div className="key-points-list">
                    {results.flashcards.map((fc, i) => (
                      <div key={i} className="card" style={{ marginBottom: '16px', padding: '20px', borderLeft: '4px solid #C084FC' }}>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#C084FC', marginBottom: '8px' }}>{fc.term}</div>
                        <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{fc.definition}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="results-right">
              <QuizModule quizData={results.quiz} documentId={results.documentId} />
            </div>
          </div>
        )}

        {appState === 'analytics' && <AnalyticsModule />}
      </main>
    </div>
  );
}

function AnalyticsModule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/analytics`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => console.error(e));
  }, []);

  if (loading) return <div>Loading real-time analytics...</div>;

  return (
    <div className="fade-in">
      <h1>Your Analytics</h1>
      <p className="subtitle">Real-time performance tracking based on actual quiz attempts.</p>
      
      {data.length === 0 ? (
        <div className="card">No attempts recorded yet. Process a document and take a quiz!</div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {data.map((attempt, index) => {
             const percentage = Math.round((attempt.score / attempt.total_questions) * 100) || 0;
             return (
               <div key={index} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{attempt.filename}</h3>
                   <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                     Attempted: {new Date(attempt.created_at).toLocaleString()}
                   </p>
                 </div>
                 <div style={{ background: percentage >= 70 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)", color: percentage >= 70 ? "var(--success)" : "var(--warning)", padding: "8px 16px", borderRadius: "12px", fontWeight: "600" }}>
                   Score: {attempt.score} / {attempt.total_questions} ({percentage}%)
                 </div>
               </div>
             )
          })}
        </div>
      )}
    </div>
  )
}

function QuizModule({ quizData, documentId }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(45);

  useEffect(() => {
    if (!quizStarted || isAnswered || isComplete) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, currentQIndex, isAnswered, isComplete]);

  useEffect(() => {
    if (quizStarted && timeLeft === 0 && !isAnswered && !isComplete) {
      handleSelect(-1); 
    }
  }, [timeLeft, quizStarted]);

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    
    if (idx === quizData[currentQIndex].correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = async () => {
    if (currentQIndex < quizData.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(45);
    } else {
      setIsSubmitting(true);
      // Actual Backend Submit
      await fetch(`${API_URL}/submit`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            documentId: documentId,
            score: score + (selectedOption === quizData[currentQIndex].correctIndex ? 1 : 0),
            totalQuestions: quizData.length
         })
      });
      setIsSubmitting(false);
      setIsComplete(true);
    }
  };

  if (isComplete) {
    const finalScore = score; // Already contains the exact count
    const percentage = Math.round((finalScore / quizData.length) * 100);
    const scoreStyle = { '--score': `${percentage}%` };
    
    return (
      <div className="card quiz-card fade-in">
        <h2 style={{ textAlign: 'center' }}>Quiz Analytics</h2>
        <div className="score-display">
          <div className="score-circle" style={scoreStyle}>
            <span className="score-value">{percentage}%</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You answered {finalScore} of {quizData.length} correctly.</p>
        </div>
        
        <p style={{textAlign: 'center', marginTop: '10px', color: 'var(--success)'}}>Results successfully saved to your Analytics.</p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="card quiz-card fade-in" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin: '0 auto 16px'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        <h2 style={{ marginBottom: '12px' }}>Interactive Quiz Ready!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Test your knowledge on the document with AI-generated questions. You will have 45 seconds per question.</p>
        <button className="btn" onClick={() => setQuizStarted(true)}>
          Start Quiz Now
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
    );
  }

  const q = quizData[currentQIndex];

  return (
    <div className="card quiz-card fade-in" key={currentQIndex}>
      <div className="quiz-header">
         <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.2rem' }}>Knowledge Check</div>
         <div className="timer">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
           00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
         </div>
      </div>

      <div className="quiz-progress-dots">
        {quizData.map((_, i) => (
           <div key={i} className={`dot ${i < currentQIndex ? 'completed' : i === currentQIndex ? 'active' : ''}`}></div>
        ))}
      </div>
      
      <p style={{ fontSize: '1.15rem', fontWeight: '500', lineHeight: '1.5', marginTop: '16px' }}>{q.question}</p>
      
      <div className="quiz-options">
        {q.options.map((opt, idx) => {
          let className = "quiz-option";
          if (isAnswered) {
            if (idx === q.correctIndex) className += " correct";
            else if (idx === selectedOption) className += " incorrect";
          } else if (idx === selectedOption) {
             className += " selected";
          }

          const optionLabels = ['A', 'B', 'C', 'D'];

          return (
            <button key={idx} className={className} onClick={() => handleSelect(idx)} disabled={isAnswered}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {optionLabels[idx]}
                </div>
                {opt}
              </div>
              {isAnswered && idx === q.correctIndex && (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="fade-in">
          <div className={`status-banner ${selectedOption === q.correctIndex ? 'success' : 'error'}`} style={{ backgroundColor: selectedOption === q.correctIndex ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: selectedOption === q.correctIndex ? 'var(--success)' : 'var(--error)', border: `1px solid ${selectedOption === q.correctIndex ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
            {selectedOption === q.correctIndex ? "Excellent! That's the correct answer." : (selectedOption === -1 ? 'Time is up!' : 'Incorrect.')}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? 'Sumitting...' : (currentQIndex < quizData.length - 1 ? 'Next Question' : 'Submit Quiz')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
