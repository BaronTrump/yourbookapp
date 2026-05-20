import { useState, useEffect } from 'react';

export default function Home() {
  const [view, setView] = useState('ask');
  const [source, setSource] = useState('all');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);
  
  // Reading state
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loadingChapter, setLoadingChapter] = useState(false);

  useEffect(() => {
    fetch('/api/ask')
      .then(r => r.json())
      .then(data => setBooks(data.books || []));
  }, []);

  useEffect(() => {
    if (currentBook) {
      setLoadingChapter(true);
      fetch(`/api/ask?book=${currentBook}&chapter=${currentChapter}`)
        .then(r => r.json())
        .then(data => {
          setVerses(data.verses || []);
          setLoadingChapter(false);
        });
    }
  }, [currentBook, currentChapter]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    setSources([]);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, source })
      });
      const data = await res.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
    } catch (e) {
      setAnswer('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="book-container">
      <style>{`
        :root {
          --leather-dark: #2D1810;
          --leather-brown: #4A3728;
          --leather-medium: #6B4423;
          --gold-accent: #D4AF37;
          --gold-glow: #E8C86A;
          --parchment: #FDFCF0;
          --parchment-warm: #F5F0DC;
          --ink-sepia: #3D2914;
          --ink-faded: #5C4A3A;
          --ruled-line: #B8D4E8;
          --ruled-margin: #E8D4C8;
        }
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .book-container { min-height: 100vh; background: var(--leather-dark); padding: 40px 20px; display: flex; justify-content: center; }
        .book { display: flex; gap: 0; max-width: 1300px; width: 100%; }
        .page { flex: 1; max-width: 620px; min-height: 750px; background: var(--parchment); position: relative; padding: 35px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); border-radius: 2px 8px 8px 2px; overflow-y: auto; }
        .page::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: repeating-linear-gradient(transparent 0px, transparent 31px, var(--ruled-line) 31px, var(--ruled-line) 32px); pointer-events: none; opacity: 0.35; }
        .page-left::after { content: ''; position: absolute; top: 0; left: 45px; bottom: 0; width: 2px; background: var(--ruled-margin); opacity: 0.5; }
        .center-crease { width: 35px; min-height: 750px; background: linear-gradient(90deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 30%, transparent 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.15) 100%); flex-shrink: 0; }
        .page-title { font-family: 'Cinzel', serif; font-size: 26px; font-weight: 600; color: var(--leather-dark); margin: 0 0 15px 0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
        .page-subtitle { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-style: italic; color: var(--ink-faded); text-align: center; margin-bottom: 25px; }
        .nav-tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 2px solid var(--gold-accent); padding-bottom: 10px; }
        .nav-tab { font-family: 'Cinzel', serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 8px 16px; background: transparent; border: 2px solid transparent; color: var(--ink-faded); cursor: pointer; border-radius: 4px; transition: all 0.2s; }
        .nav-tab.active { background: var(--gold-accent); color: var(--parchment); border-color: var(--gold-accent); }
        .source-selector { font-family: 'Inter', sans-serif; padding: 8px 14px; font-size: 13px; border: 2px solid var(--gold-accent); background: var(--parchment); color: var(--leather-dark); border-radius: 4px; cursor: pointer; margin-bottom: 18px; width: 100%; }
        .ask-input { font-family: 'EB Garamond', serif; font-size: 17px; padding: 14px 18px; border: 2px solid var(--gold-accent); background: var(--parchment); color: var(--ink-sepia); border-radius: 4px; width: 100%; }
        .ask-input::placeholder { font-style: italic; color: var(--ink-faded); }
        .ancient-btn { font-family: 'Cinzel', serif; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; padding: 10px 24px; background: linear-gradient(180deg, var(--gold-accent) 0%, var(--leather-medium) 100%); border: 2px solid var(--gold-accent); color: var(--parchment); border-radius: 4px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.3); margin-top: 12px; }
        .answer-section { background: var(--parchment-warm); border: 1px solid var(--gold-accent); border-radius: 4px; padding: 18px; margin-top: 25px; }
        .answer-title { font-family: 'Cinzel', serif; font-size: 16px; color: var(--leather-medium); margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid var(--gold-accent); }
        .reference-card { background: var(--parchment); border-left: 3px solid var(--gold-accent); padding: 8px 12px; margin-bottom: 8px; }
        .reference-source { font-family: 'Cinzel', serif; font-size: 13px; color: var(--gold-accent); }
        .book-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 400px; overflow-y: auto; }
        .book-item { padding: 12px; background: var(--parchment-warm); border: 1px solid var(--gold-accent); border-radius: 4px; cursor: pointer; text-align: center; transition: all 0.2s; }
        .book-item:hover, .book-item.active { background: var(--gold-accent); color: var(--parchment); }
        .chapter-nav { display: flex; justify-content: space-between; align-items: center; margin: 18px 0; padding: 12px; background: var(--parchment-warm); border-radius: 4px; }
        .chapter-btn { padding: 8px 16px; font-family: 'Cinzel', serif; font-size: 12px; background: var(--leather-medium); border: none; color: var(--parchment); border-radius: 4px; cursor: pointer; }
        .chapter-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .verse-text { font-family: 'EB Garamond', serif; font-size: 16px; line-height: 30px; color: var(--ink-sepia); margin-bottom: 15px; text-align: justify; }
        .verse-number { color: var(--gold-accent); font-weight: 600; margin-right: 8px; }
        @media (max-width: 950px) { .book { flex-direction: column; } .center-crease { display: none; } .page { max-width: 100%; min-height: 500px; } .book-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="book">
        <div className="page page-left">
          <h1 className="page-title">✦ The Sacred Library ✦</h1>
          <p className="page-subtitle">" Wisdom begins in Wonder "</p>
          
          <div className="nav-tabs">
            <button className={`nav-tab ${view === 'ask' ? 'active' : ''}`} onClick={() => setView('ask')}>Consult</button>
            <button className={`nav-tab ${view === 'read' ? 'active' : ''}`} onClick={() => setView('read')}>Read</button>
          </div>

          <select className="source-selector" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="all">✦ All Sacred Texts</option>
            <option value="bible">☩ Bible (KJV)</option>
            <option value="quran">☪ Quran</option>
            <option value="gita">🪷 Bhagavad Gita</option>
            <option value="tao">☯ Tao Te Ching</option>
          </select>

          {view === 'ask' ? (
            <>
              <input className="ask-input" type="text" placeholder="Ask the ancient wisdom..." value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAsk()} />
              <button className="ancient-btn" onClick={handleAsk} disabled={loading}>
                {loading ? 'Consulting...' : '⌖ Ask'}
              </button>

              {answer && (
                <div className="answer-section">
                  <h3 className="answer-title">✦ Divine Response</h3>
                  <div className="verse-text">{answer}</div>
                </div>
              )}

              {sources.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <h4 style={{ fontFamily: 'Cinzel', fontSize: '14px', color: '#6b4a10' }}>📖 Sacred References</h4>
                  {sources.map((s, i) => (
                    <div key={i} className="reference-card">
                      <strong className="reference-source">{s.source} {s.ref}</strong>
                      <p style={{ fontFamily: 'EB Garamond', fontSize: '13px', margin: '6px 0 0' }}>{s.text?.substring(0, 120)}...</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3 style={{ fontFamily: 'Cinzel', fontSize: '16px', color: '#6b4a10', textAlign: 'center', marginBottom: '12px' }}>Select a Book</h3>
              <div className="book-grid">
                {books.filter(b => ['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy', 'psalms', 'proverbs', 'john', 'quran', 'gita', 'tao', 'upanishads'].includes(b.id)).map(book => (
                  <div key={book.id} className={`book-item ${currentBook === book.id ? 'active' : ''}`} onClick={() => { setCurrentBook(book.id); setCurrentChapter(1); }}>
                    <span style={{ fontFamily: 'Cinzel', fontSize: '12px' }}>{book.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="center-crease" />

        <div className="page page-right">
          {view === 'read' && currentBook ? (
            <>
              <h2 style={{ fontFamily: 'Cinzel', fontSize: '20px', color: '#6b4a10', textAlign: 'center', marginBottom: '10px' }}>
                {books.find(b => b.id === currentBook)?.name || currentBook}
              </h2>
              <div className="chapter-nav">
                <button className="chapter-btn" onClick={() => setCurrentChapter(c => Math.max(1, c - 1))} disabled={currentChapter <= 1}>← Prev</button>
                <span style={{ fontFamily: 'Cinzel', fontSize: '13px' }}>Chapter {currentChapter}</span>
                <button className="chapter-btn" onClick={() => setCurrentChapter(c => c + 1)}>Next →</button>
              </div>
              {loadingChapter ? (
                <p style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', color: '#5C4A3A', textAlign: 'center' }}>Loading...</p>
              ) : (
                <div>
                  {verses.map((v, i) => (
                    <p key={i} className="verse-text">
                      <span className="verse-number">{v.split('.')[0]}</span>
                      {v.substring(v.indexOf('.') + 1)}
                    </p>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '100px' }}>
              <p style={{ fontFamily: 'Cinzel', fontSize: '24px', color: '#D4AF37', marginBottom: '20px' }}>✦</p>
              <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontStyle: 'italic', color: '#5C4A3A' }}>
                "The pages await your presence..."<br/><br/>
                Select a book and chapter<br/>to read the ancient wisdom.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}