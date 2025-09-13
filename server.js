import { Readable } from 'node:stream';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { XMLParser } from 'fast-xml-parser';
import { getJson } from 'serpapi';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Simple whitelist for proxying PDFs
const ALLOWED_PDF_HOSTS = new Set([
  'arxiv.org',
  'export.arxiv.org',
  'core.ac.uk',
]);

app.get('/api/proxy-pdf', async (req, res) => {
  try {
    const url = req.query.url;
    if (typeof url !== 'string') return res.status(400).send('Missing url');
    const target = new URL(url);
    if (!ALLOWED_PDF_HOSTS.has(target.hostname)) return res.status(403).send('Host not allowed');
    const upstream = await fetch(url, { redirect: 'follow' });
    if (!upstream.ok) return res.status(upstream.status).send('Upstream error');
    const ctype = upstream.headers.get('content-type') || '';
    if (!ctype.includes('pdf')) return res.status(415).send('Not a PDF');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!upstream.body) return res.status(502).send('No body');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (e) {
    console.error('proxy-pdf failed', e);
    res.status(500).send('Proxy failed');
  }
});

async function fetchFromArxiv(query) {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`;
  const res = await fetch(url);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const data = parser.parse(xml);
  const entries = data && data.feed && data.feed.entry
    ? (Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry])
    : [];
  return entries.map((e) => ({
    title: (e.title || '').trim(),
    authors: (Array.isArray(e.author) ? e.author.map((a) => a.name).join(', ') : e.author?.name) || 'Unknown',
    snippet: (e.summary || '').toString().replace(/\s+/g, ' ').trim().slice(0, 220) + '…',
    link: (Array.isArray(e.link) ? e.link.find((l) => l['@_rel'] === 'alternate')?.['@_href'] : undefined) || e.id,
    bestLink: (Array.isArray(e.link)
      ? (e.link.find((l) => (l['@_type'] || '').includes('pdf'))?.['@_href'] || e.link.find((l) => l['@_rel'] === 'alternate')?.['@_href'])
      : undefined) || e.id,
  }));
}

app.post('/api/search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Try SerpApi first if key exists, otherwise fallback to arXiv
  const hasKey = !!process.env.SERPAPI_API_KEY;
  try {
    if (hasKey) {
      const response = await getJson({
        engine: 'google_scholar',
        q: query,
        api_key: process.env.SERPAPI_API_KEY,
      });
      const papers = (response.organic_results || []).map((r) => ({
        title: r.title,
        authors: r.publication_info?.summary || 'Unknown',
        snippet: r.snippet || '',
        link: r.link,
        bestLink: (Array.isArray(r.resources) ? r.resources.find((res) => (res.file_format || '').toLowerCase() === 'pdf')?.link : undefined) || r.link,
      }));
      return res.json({ papers });
    }
    // No key, fall through to arXiv
    const papers = await fetchFromArxiv(query);
    return res.json({ papers });
  } catch (err) {
    try {
      const papers = await fetchFromArxiv(query);
      return res.json({ papers });
    } catch (fallbackErr) {
      console.error('Search failed:', fallbackErr);
      return res.status(500).json({ error: 'Search failed' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
