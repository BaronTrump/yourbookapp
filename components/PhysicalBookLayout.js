import { useState, useEffect } from 'react';

export default function PhysicalBookLayout({ children, sources = [], onSourceChange, currentSource }) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="book-container">
      <style>{`
        :root {
          /* Vintage Leather Theme */
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
          
          /* Page dimensions */
          --page-width: 100%;
          --page-max-width: 600px;
          --book-shadow: 0 8px 32px rgba(0,0,0,0.4);
          --crease-shadow: linear-gradient(90deg, 
            rgba(0,0,0,0.15) 0%, 
            rgba(0,0,0,0.05) 30%,
            transparent 50%,
            rgba(0,0,0,0.05) 70%,
            rgba(0,0,0,0.15) 100%);
        }

        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .book-container {
          min-height: 100vh;
          background: var(--leather-dark);
          background-image: 
            radial-gradient(ellipse at center, var(--leather-brown) 0%, var(--leather-dark) 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .book {
          display: flex;
          gap: 0;
          max-width: 1200px;
          width: 100%;
          perspective: 2000px;
          transform-style: preserve-3d;
        }

        .page {
          flex: 1;
          max-width: 580px;
          min-height: 700px;
          background: var(--parchment);
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.03'/%3E%3C/svg%3E");
          position: relative;
          padding: 40px 35px;
          box-shadow: var(--book-shadow);
          border-radius: 2px 8px 8px 2px;
          overflow: hidden;
        }

        .page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            transparent 0px,
            transparent 31px,
            var(--ruled-line) 31px,
            var(--ruled-line) 32px
          );
          pointer-events: none;
          opacity: 0.4;
        }

        /* Left page - margin line */
        .page-left {
          border-right: none;
        }

        .page-left::after {
          content: '';
          position: absolute;
          top: 0;
          left: 45px;
          bottom: 0;
          width: 2px;
          background: var(--ruled-margin);
          opacity: 0.6;
        }

        /* Right page */
        .page-right {
          border-left: none;
        }

        /* Center crease */
        .book.dual-page .page-left {
          border-radius: 4px 0 0 4px;
          margin-right: 2px;
        }

        .book.dual-page .page-right {
          border-radius: 0 8px 8px 0;
          margin-left: 2px;
        }

        .center-crease {
          width: 40px;
          height: 100%;
          min-height: 700px;
          background: var(--crease-shadow);
          flex-shrink: 0;
        }

        /* Typography */
        .page-title {
          font-family: 'Cinzel', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--leather-dark);
          margin: 0 0 20px 0;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 3px;
          text-shadow: 1px 1px 0 rgba(212, 175, 55, 0.3);
        }

        .page-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-style: italic;
          color: var(--ink-faded);
          text-align: center;
          margin-bottom: 30px;
        }

        .entry-text {
          font-family: 'EB Garamond', serif;
          font-size: 18px;
          line-height: 32px;
          color: var(--ink-sepia);
          text-align: justify;
        }

        /* UI Controls */
        .ui-control {
          font-family: 'Inter', sans-serif;
        }

        .source-selector {
          font-family: 'Inter', sans-serif;
          padding: 10px 16px;
          font-size: 14px;
          border: 2px solid var(--gold-accent);
          background: var(--parchment);
          color: var(--leather-dark);
          border-radius: 4px;
          cursor: pointer;
          margin-bottom: 20px;
        }

        .source-selector:focus {
          outline: 2px solid var(--gold-glow);
          outline-offset: 2px;
        }

        .ask-input {
          font-family: 'EB Garamond', serif;
          font-size: 18px;
          padding: 15px 20px;
          border: 2px solid var(--gold-accent);
          background: var(--parchment);
          color: var(--ink-sepia);
          border-radius: 4px;
          width: 100%;
        }

        .ask-input::placeholder {
          font-style: italic;
          color: var(--ink-faded);
        }

        .ask-input:focus {
          outline: none;
          border-color: var(--leather-dark);
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .ancient-btn {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 12px 28px;
          background: linear-gradient(180deg, var(--gold-accent) 0%, var(--leather-medium) 100%);
          border: 2px solid var(--gold-accent);
          color: var(--parchment);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .ancient-btn:hover {
          background: linear-gradient(180deg, var(--gold-glow) 0%, var(--gold-accent) 100%);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
          transform: translateY(-1px);
        }

        .ancient-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Bookmark FAB */
        .bookmark-fab {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 60px;
          height: 80px;
          background: var(--gold-accent);
          border: none;
          border-radius: 0 0 8px 8px;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 100;
        }

        .bookmark-fab::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 0;
          width: 60px;
          height: 20px;
          background: var(--gold-accent);
          clip-path: polygon(0 0, 50% 100%, 100% 0);
        }

        .bookmark-fab:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.5);
        }

        .bookmark-fab svg {
          width: 28px;
          height: 28px;
          color: var(--leather-dark);
        }

        /* Page Flip Animation */
        @keyframes pageFlip {
          0% { transform: rotateY(0deg); }
          50% { transform: rotateY(-90deg); }
          100% { transform: rotateY(0deg); }
        }

        .page-flipping {
          animation: pageFlip 0.6s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .page-flipping,
          .ancient-btn,
          .bookmark-fab {
            animation: none;
            transition: none;
          }
        }

        /* Responsive */
        @media (max-width: 900px) {
          .book {
            flex-direction: column;
          }
          
          .center-crease {
            display: none;
          }
          
          .page {
            max-width: 100%;
            min-height: 500px;
            border-radius: 4px 8px 8px 4px;
          }
          
          .page-left::after {
            left: 35px;
          }
        }

        /* Answer section */
        .answer-section {
          background: var(--parchment-warm);
          border: 1px solid var(--gold-accent);
          border-radius: 4px;
          padding: 20px;
          margin-top: 30px;
        }

        .answer-title {
          font-family: 'Cinzel', serif;
          font-size: 18px;
          color: var(--leather-medium);
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--gold-accent);
        }

        .reference-card {
          background: var(--parchment);
          border-left: 3px solid var(--gold-accent);
          padding: 10px 15px;
          margin-bottom: 10px;
        }

        .reference-source {
          font-family: 'Cinzel', serif;
          font-size: 14px;
          color: var(--gold-accent);
        }
      `}</style>

      <div className="book">
        {/* Left Page */}
        <div className={`page page-left ${isFlipping ? 'page-flipping' : ''}`}>
          <h1 className="page-title">✦ The Sacred Library ✦</h1>
          <p className="page-subtitle">"Wisdom begins in Wonder"</p>
          
          <select 
            className="source-selector ui-control"
            value={currentSource}
            onChange={(e) => onSourceChange?.(e.target.value)}
          >
            {sources.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {children}
        </div>

        {/* Center Crease (desktop only) */}
        <div className="center-crese" />
        
        {/* Right Page */}
        <div className="page page-right">
          {/* Reserved for table of contents or additional content */}
        </div>
      </div>

      {/* Bookmark FAB */}
      <button className="bookmark-fab" aria-label="Add new entry">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}