// Minimal client wrapper for Gemini analysis in browser environments.
// Expects GEMINI_API_KEY to be available via import.meta.env.VITE_GEMINI_API_KEY.

export async function* streamGeminiAnalysis(prompt: string) {
  // The user provided Node-style example; here we call a simple proxy endpoint.
  // Implementors should back this with a server route. For now, we assume
  // a dev proxy at /api/gemini that accepts { prompt } and streams text chunks.
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok || !res.body) {
    throw new Error('Failed to start Gemini stream');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield decoder.decode(value, { stream: true });
  }
}
