export function renderSimpleMarkdown(md: string) {
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  const inline = (s: string) => s
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');

  for (const raw of lines) {
    const l = raw.trim();
    if (!l) { flushList(); continue; }

    if (/^#\s+/.test(l)) { flushList(); out.push(`<h3 class="text-lg font-semibold mt-3">${inline(l.replace(/^#\s+/, ''))}</h3>`); continue; }
    if (/^##\s+/.test(l)) { flushList(); out.push(`<h4 class="font-semibold mt-2">${inline(l.replace(/^##\s+/, ''))}</h4>`); continue; }
    if (/^\*\*[^*].*\*\*$/.test(l)) { flushList(); out.push(`<h3 class="text-lg font-semibold mt-3">${inline(l.replace(/^\*\*|\*\*$/g, ''))}</h3>`); continue; }

    if (/^[-*]\s+/.test(l)) {
      if (!inList) { out.push('<ul class="list-disc ml-5">'); inList = true; }
      out.push(`<li>${inline(l.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    flushList();
    out.push(`<p class="mt-2">${inline(l)}</p>`);
  }

  flushList();
  return out.join('');
}
