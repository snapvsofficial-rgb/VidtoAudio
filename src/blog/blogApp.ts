import { fetchAllBlogs, fetchBlogBySlug } from '../services/configService';
import { BlogPost } from '../types';
import { SupportedLanguage, getTranslations, buildLocalizedPath } from '../i18n';
import { getLocalizedBlogPost } from '../services/translationService';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInline(text: string): string {
  if (!text) return '';
  let out = escapeHtml(text);
  // Bold & Italic ***text***
  out = out.replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="text-white font-bold"><em class="italic text-slate-200">$1</em></strong>');
  // Bold **text**
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  // Italic *text*
  out = out.replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>');
  // Inline code `code`
  out = out.replace(/`([^`]+)`/g, '<code class="bg-dark-800 px-1.5 py-0.5 rounded text-brand-300 font-mono text-xs border border-slate-700/60">$1</code>');
  // Links [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-400 hover:text-brand-300 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
  return out;
}

function parseTableRow(line: string): string[] {
  const escaped = line.trim().replace(/\\\|/g, '__ESCAPED_PIPE__');
  const stripped = escaped.replace(/^\|/, '').replace(/\|$/, '');
  return stripped.split('|').map(cell => cell.replace(/__ESCAPED_PIPE__/g, '|').trim());
}

function isDelimiterRow(line: string): boolean {
  return /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(line);
}

function getAlignments(delimiterLine: string): Array<'left' | 'center' | 'right'> {
  const cells = parseTableRow(delimiterLine);
  return cells.map(cell => {
    const trimmed = cell.trim();
    const startsWithColon = trimmed.startsWith(':');
    const endsWithColon = trimmed.endsWith(':');
    if (startsWithColon && endsWithColon) return 'center';
    if (endsWithColon) return 'right';
    return 'left';
  });
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return '';
  const headers = parseTableRow(lines[0]);
  const alignments = getAlignments(lines[1]);
  const rows = lines.slice(2).map(l => parseTableRow(l));

  const getAlignClass = (idx: number) => {
    const a = alignments[idx] || 'left';
    if (a === 'center') return 'text-center';
    if (a === 'right') return 'text-right';
    return 'text-left';
  };

  const headerCellsHtml = headers.map((h, i) => `
    <th scope="col" class="px-5 py-3.5 font-bold tracking-wider ${getAlignClass(i)}">
      ${renderInline(h)}
    </th>
  `).join('');

  const rowsHtml = rows.map((r) => {
    while (r.length < headers.length) r.push('');
    const cellsHtml = r.map((c, i) => `
      <td class="px-5 py-3.5 text-sm whitespace-normal ${getAlignClass(i)}">
        ${renderInline(c)}
      </td>
    `).join('');
    return `
      <tr class="transition-colors hover:bg-slate-800/50 odd:bg-transparent even:bg-slate-800/30">
        ${cellsHtml}
      </tr>
    `;
  }).join('');

  return `
    <div class="overflow-x-auto my-6 rounded-xl border border-slate-700/80 shadow-lg bg-slate-900/60">
      <table class="min-w-full divide-y divide-slate-700 text-left text-sm text-slate-300">
        <thead class="bg-slate-800/95 text-xs uppercase tracking-wider font-semibold text-slate-200 border-b border-slate-700">
          <tr>
            ${headerCellsHtml}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/70 bg-slate-900/40">
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  `;
}

// Full structured Markdown to HTML parser with Markdown Table support
export function renderMarkdown(md: string): string {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Fenced Code Blocks ```
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push(`<pre class="bg-dark-950 p-4 rounded-xl border border-slate-800 text-brand-300 font-mono text-sm overflow-x-auto my-4"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    // Markdown Table detection: current row contains pipe and next row is delimiter
    if (trimmed.includes('|') && i + 1 < lines.length && isDelimiterRow(lines[i + 1])) {
      const tableLines: string[] = [line, lines[i + 1]];
      i += 2;
      while (i < lines.length && lines[i].trim().includes('|') && lines[i].trim().length > 0) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(renderTable(tableLines));
      continue;
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      blocks.push(`<h4 class="text-lg font-bold text-slate-200 mt-4 mb-2 tracking-tight">${renderInline(trimmed.slice(5))}</h4>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('### ')) {
      blocks.push(`<h3 class="text-xl font-bold text-white mt-6 mb-3 tracking-tight">${renderInline(trimmed.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(`<h2 class="text-2xl font-bold text-brand-300 mt-8 mb-4 tracking-tight border-b border-slate-800 pb-2">${renderInline(trimmed.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(`<h1 class="text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight">${renderInline(trimmed.slice(2))}</h1>`);
      i++;
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [trimmed.replace(/^>\s?/, '')];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(`<blockquote class="border-l-4 border-brand-500 pl-4 py-2.5 my-4 bg-dark-900/60 rounded-r-lg text-slate-300 italic">${renderInline(quoteLines.join(' '))}</blockquote>`);
      continue;
    }

    // Bullet Lists
    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [trimmed.replace(/^[-*]\s+/, '')];
      i++;
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(`<ul class="my-4 space-y-1.5 pl-2">${listItems.map(item => `<li class="flex items-start gap-2 text-slate-300"><span class="text-brand-400 mt-1 font-bold">&bull;</span><span>${renderInline(item)}</span></li>`).join('')}</ul>`);
      continue;
    }

    // Ordered Lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [trimmed.replace(/^\d+\.\s+/, '')];
      i++;
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(`<ol class="my-4 space-y-1.5 pl-6 list-decimal text-slate-300">${listItems.map(item => `<li>${renderInline(item)}</li>`).join('')}</ol>`);
      continue;
    }

    // Horizontal Rule
    if (/^(?:---|\*\*\*|___)$/.test(trimmed)) {
      blocks.push(`<hr class="border-slate-800 my-8" />`);
      i++;
      continue;
    }

    // Paragraph: collect lines until an empty line or a block element
    const paraLines: string[] = [trimmed];
    i++;
    while (i < lines.length && lines[i].trim().length > 0) {
      const nextTrim = lines[i].trim();
      if (
        nextTrim.startsWith('#') || 
        nextTrim.startsWith('```') || 
        nextTrim.startsWith('>') || 
        /^[-*]\s+/.test(nextTrim) || 
        /^\d+\.\s+/.test(nextTrim) ||
        (nextTrim.includes('|') && i + 1 < lines.length && isDelimiterRow(lines[i + 1])) || 
        /^(?:---|\*\*\*|___)$/.test(nextTrim)
      ) {
        break;
      }
      paraLines.push(nextTrim);
      i++;
    }
    blocks.push(`<p class="text-slate-300 leading-relaxed my-4">${renderInline(paraLines.join(' '))}</p>`);
  }

  return `<div class="prose prose-invert max-w-none text-slate-300">${blocks.join('\n')}</div>`;
}

function calculateReadingTime(text: string, lang: SupportedLanguage): string {
  const words = text ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  if (lang === 'es') return `${minutes} min de lectura`;
  if (lang === 'fr') return `${minutes} min de lecture`;
  return `${minutes} min read`;
}

export async function renderBlogView(container: HTMLElement, slug?: string, lang: SupportedLanguage = 'en'): Promise<void> {
  const t = getTranslations(lang);
  const homeLink = buildLocalizedPath('/', lang);
  const blogLink = buildLocalizedPath('/blog', lang);

  if (slug) {
    container.innerHTML = `
      <div class="py-12 flex justify-center items-center">
        <div class="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    `;

    const rawBlog = await fetchBlogBySlug(slug);
    if (!rawBlog) {
      container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-16 text-center">
          <div class="w-16 h-16 bg-red-950/50 border border-red-800 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">
            ${lang === 'es' ? 'Artículo No Encontrado' : (lang === 'fr' ? 'Article Non Trouvé' : 'Article Not Found')}
          </h2>
          <p class="text-slate-400 mb-6">
            ${lang === 'es' ? 'El artículo solicitado no existe o ha sido trasladado.' : (lang === 'fr' ? 'L\'article demandé n\'a pas pu être trouvé ou a été déplacé.' : 'The article you requested could not be found or has been moved.')}
          </p>
          <a href="${blogLink}" data-route-link class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-colors">
            ${t.blog.backToArticles}
          </a>
        </div>
      `;
      return;
    }

    // Resolve localized title, excerpt, and content
    const blog = getLocalizedBlogPost(rawBlog, lang);

    document.title = `${blog.title} | VidToAudio Blog`;

    const localeString = lang === 'es' ? 'es-ES' : (lang === 'fr' ? 'fr-FR' : 'en-US');
    const formattedDate = rawBlog.createdAt ? new Date(rawBlog.createdAt).toLocaleDateString(localeString, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : (lang === 'es' ? 'Recientemente Publicado' : (lang === 'fr' ? 'Récemment Publié' : 'Recently Published'));

    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-12">
        <nav class="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <a href="${homeLink}" data-route-link class="hover:text-brand-400 transition-colors">${t.nav.home}</a>
          <span>/</span>
          <a href="${blogLink}" data-route-link class="hover:text-brand-400 transition-colors">${t.nav.blog}</a>
          <span>/</span>
          <span class="text-slate-200 truncate max-w-xs">${blog.title}</span>
        </nav>

        <header class="mb-10 pb-8 border-b border-slate-800">
          <div class="flex items-center gap-3 mb-4 flex-wrap">
            <span class="px-3 py-1 bg-brand-950 text-brand-400 border border-brand-800/60 rounded-full text-xs font-semibold uppercase tracking-wider">
              ${t.blog.badge}
            </span>
            ${lang !== 'en' ? `
              <span class="px-2.5 py-0.5 bg-dark-950 text-slate-300 border border-slate-700/80 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                <span>${lang === 'es' ? '🇪🇸 Español' : '🇫🇷 Français'}</span>
                ${blog.isDynamicTranslation ? `<span class="text-[10px] text-brand-400 bg-brand-950/80 px-1.5 py-0.5 rounded border border-brand-800">${lang === 'es' ? 'Auto-traducido' : 'Auto-traduit'}</span>` : ''}
              </span>
            ` : ''}
            <span class="text-xs text-slate-500 font-medium">${calculateReadingTime(blog.content, lang)}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            ${blog.title}
          </h1>
          <div class="flex items-center gap-3 text-sm text-slate-400">
            <div class="w-8 h-8 rounded-full bg-brand-900 border border-brand-700 flex items-center justify-center text-brand-300 font-bold text-xs">
              VA
            </div>
            <div>
              <div class="text-slate-200 font-medium">${rawBlog.authorEmail || 'VidToAudio Tech Editorial'}</div>
              <div class="text-xs text-slate-500">${formattedDate}</div>
            </div>
          </div>
        </header>

        <main class="text-base sm:text-lg leading-relaxed space-y-6">
          ${renderMarkdown(blog.content)}
        </main>

        <footer class="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <a href="${blogLink}" data-route-link class="inline-flex items-center gap-2 px-5 py-2.5 bg-dark-900 border border-slate-700 hover:border-brand-500 text-slate-200 hover:text-white rounded-xl transition-all">
            ${t.blog.backToArticles}
          </a>
          <a href="${homeLink}" data-route-link class="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl shadow-lg transition-all">
            ${t.converter.tryItHereHome}
          </a>
        </footer>
      </div>
    `;
    return;
  }

  // Render Public Blog Index List
  container.innerHTML = `
    <div class="max-w-5xl mx-auto px-4 py-12">
      <header class="text-center max-w-3xl mx-auto mb-16">
        <span class="px-3.5 py-1.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800/60 text-xs font-semibold uppercase tracking-wider inline-block mb-4">
          ${t.blog.badge}
        </span>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          ${t.blog.heading}
        </h1>
        <p class="text-slate-400 text-base sm:text-lg">
          ${t.blog.subtitle}
        </p>
      </header>

      <div id="blog-posts-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full py-16 text-center">
          <div class="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm text-slate-400">${t.blog.loadingText}</p>
        </div>
      </div>
    </div>
  `;

  document.title = `${t.blog.heading} | VidToAudio`;

  const blogs = await fetchAllBlogs();
  const grid = document.getElementById('blog-posts-grid');
  if (!grid) return;

  if (!blogs || blogs.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-dark-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div class="w-14 h-14 bg-brand-950/60 border border-brand-800 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">${lang === 'es' ? 'Próximamente más artículos' : (lang === 'fr' ? 'Bientôt d’autres articles' : 'No articles published yet')}</h3>
        <p class="text-slate-400 text-sm max-w-md mx-auto mb-6">
          ${lang === 'es' ? 'Nuestros ingenieros están redactando guías técnicas.' : (lang === 'fr' ? 'Nos ingénieurs préparent des guides d’extraction.' : 'Our editorial team is preparing comprehensive audio extraction guides.')}
        </p>
      </div>
    `;
    return;
  }

  const localeString = lang === 'es' ? 'es-ES' : (lang === 'fr' ? 'fr-FR' : 'en-US');

  grid.innerHTML = blogs.map(b => {
    const localized = getLocalizedBlogPost(b, lang);
    const postDate = b.createdAt ? new Date(b.createdAt).toLocaleDateString(localeString, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Guide';

    const articleUrl = buildLocalizedPath(`/blog/${localized.slug || b.slug}`, lang);

    return `
      <article class="bg-dark-900/90 border border-slate-800 hover:border-brand-500/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-950/30 group">
        <div>
          <div class="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3 font-mono">
            <span>${postDate}</span>
            <span>${calculateReadingTime(localized.content, lang)}</span>
          </div>
          <h2 class="text-xl font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight mb-2.5 line-clamp-2">
            ${localized.title}
          </h2>
          <p class="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
            ${localized.excerpt || localized.content.slice(0, 140) + '...'}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <a href="${articleUrl}" data-route-link class="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
            ${t.blog.readMore}
          </a>
        </div>
      </article>
    `;
  }).join('');
}
