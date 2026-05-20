import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

let allData = {};

function loadData() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
      let name = file.replace('.json', '');
      if (file.startsWith('kjv_')) name = file.slice(4, -5).replace(/_/g, ' ');
      if (file === 'quran_en.json') name = 'quran';
      allData[name] = data;
    } catch (e) {
      console.error('Error loading', file, e.message);
    }
  }
  
  console.log(`Loaded ${Object.keys(allData).length} texts`);
}

loadData();

function searchTexts(query, source = 'all') {
  const results = [];
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const sources = source === 'all' ? Object.keys(allData) : [source];
  
  for (const src of sources) {
    if (!allData[src]) continue;
    const data = allData[src];
    
    if (data.chapters) {
      let chNum = 0;
      for (const ch of data.chapters || []) {
        chNum++;
        for (const v of ch.verses || []) {
          const text = (v.text || '').toLowerCase();
          if (words.some(w => text.includes(w))) {
            results.push({ source: src.toUpperCase(), ref: `${chNum}:${v.verse}`, text: v.text, score: 1 });
          }
        }
      }
    } else if (data.verses) {
      for (const v of data.verses || []) {
        const text = (v.text || v.translation || '').toLowerCase();
        if (words.some(w => text.includes(w))) {
          results.push({ source: src.toUpperCase(), ref: `${v.verse || 1}`, text: v.text || v.translation, score: 1 });
        }
      }
    }
    
    if (results.length >= 50) break;
  }
  
  return results.slice(0, 25);
}

function getChapterData(book, chapter) {
  if (!allData[book]) return null;
  const data = allData[book];
  
  if (data.chapters) {
    const ch = data.chapters.find(c => c.chapter === parseInt(chapter));
    if (ch && ch.verses) {
      return ch.verses.map(v => `${v.verse}. ${v.text}`);
    }
  }
  
  // Handle flat structure like Quran
  if (data.verses) {
    const start = (parseInt(chapter) - 1) * 10;
    return data.verses.slice(start, start + 10).map(v => `${v.verse}. ${v.text || v.translation}`);
  }
  
  return [];
}

function formatContext(results) {
  return results.map(r => `[${r.source} ${r.ref}]\n${r.text}`).join('\n\n');
}

async function askAI(query, context) {
  const sources = [...new Set(context.match(/\[(\w+)\s+\d+:\d+\]/g) || [])].map(s => s.match(/\[(\w+)/)[1]);
  const crossRefPrompt = sources.length > 1 
    ? `\n\nThis question involves knowledge from multiple sacred texts: ${sources.join(', ')}. Compare and synthesize the teachings from these different sources.` 
    : '';

  try {
    const response = await fetch('http://localhost:8082/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a wise ancient scholar with deep knowledge of multiple sacred religious texts. Answer using ONLY the provided scriptural references. When relevant, cross-reference and compare teachings across different texts. Be scholarly, insightful, and cite verses.' },
          { role: 'user', content: `Scriptural references:\n${context}\n${crossRefPrompt}\n\nQuestion: ${query}` }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'The ancient wisdom is silent...';
  } catch (e) {
    return `The connection to wisdom fails: ${e.message}`;
  }
}

export default async function handler(req, res) {
  // GET - list books or get chapter
  if (req.method === 'GET') {
    const { book, chapter } = req.query;
    
    if (book && chapter) {
      const verses = getChapterData(book, chapter);
      return res.json({ verses: verses || [], book, chapter });
    }
    
    // Return all available books
    const books = Object.keys(allData).map(k => ({
      id: k,
      name: k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, ' '),
      chapters: allData[k].chapters?.length || 1
    }));
    return res.json({ books });
  }
  
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { question, source = 'all' } = req.body;
  
  if (!question) return res.status(400).json({ error: 'Question required' });
  
  const searchResults = searchTexts(question, source);
  
  if (searchResults.length === 0) {
    return res.json({ answer: `No verses found for "${question}". Try different keywords.`, sources: [] });
  }
  
  const context = formatContext(searchResults);
  const answer = await askAI(question, context);
  
  res.json({ answer, sources: searchResults.slice(0, 8) });
}