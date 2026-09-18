import { fetchAllBlogs, fetchBlogBySlug } from '../services/configService';
import { BlogPost } from '../types';
import { SupportedLanguage, getTranslations, buildLocalizedPath } from '../i18n';

// Simple lightweight Markdown to HTML parser
function renderMarkdown(md: string): string {
  if (!md) return '';
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-6 mb-3 tracking-tight">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-brand-300 mt-8 mb-4 tracking-tight border-b border-slate-800 pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight">$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="text-slate-300 italic">$1</em>')
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-brand-500 pl-4 py-2 my-4 bg-dark-900/60 rounded-r-lg text-slate-300 italic">$1</blockquote>')
    .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="bg-dark-950 p-4 rounded-xl border border-slate-800 text-brand-300 font-mono text-sm overflow-x-auto my-4"><code>$2</code></pre>')
    .replace(/`([^`]+)`/gim, '<code class="bg-dark-800 px-1.5 py-0.5 rounded text-brand-300 font-mono text-xs border border-slate-700/60">$1</code>')
    .replace(/^\s*-\s+(.*$)/gim, '<li class="flex items-start gap-2 text-slate-300 my-1"><span class="text-brand-400 mt-1 font-bold">&bull;</span><span>$1</span></li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-brand-400 hover:text-brand-300 underline font-medium">$1</a>')
    .replace(/\n\s*\n/gim, '</p><p class="text-slate-300 leading-relaxed my-4">');

  return `<div class="prose prose-invert max-w-none text-slate-300"><p class="text-slate-300 leading-relaxed my-4">${html}</p></div>`;
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

    const blog = await fetchBlogBySlug(slug);
    if (!blog) {
      container.innerHTML = `
        <div class="max-w-4xl mx-auto px-4 py-16 text-center">
          <div class="w-16 h-16 bg-red-950/50 border border-red-800 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">Article Not Found</h2>
          <p class="text-slate-400 mb-6">The article you requested could not be found or has been moved.</p>
          <a href="${blogLink}" data-route-link class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-colors">
            ${t.blog.backToArticles}
          </a>
        </div>
      `;
      return;
    }

    document.title = `${blog.title} | VidToAudio Blog`;

    const localeString = lang === 'es' ? 'es-ES' : (lang === 'fr' ? 'fr-FR' : 'en-US');
    const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString(localeString, {
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
          <div class="flex items-center gap-3 mb-4">
            <span class="px-3 py-1 bg-brand-950 text-brand-400 border border-brand-800/60 rounded-full text-xs font-semibold uppercase tracking-wider">
              ${t.blog.badge}
            </span>
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
              <div class="text-slate-200 font-medium">${blog.authorEmail || 'VidToAudio Tech Editorial'}</div>
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
    const postDate = b.createdAt ? new Date(b.createdAt).toLocaleDateString(localeString, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Guide';

    const articleUrl = buildLocalizedPath(`/blog/${b.slug}`, lang);

    return `
      <article class="bg-dark-900/90 border border-slate-800 hover:border-brand-500/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-950/30 group">
        <div>
          <div class="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3 font-mono">
            <span>${postDate}</span>
            <span>${calculateReadingTime(b.content, lang)}</span>
          </div>
          <h2 class="text-xl font-bold text-white group-hover:text-brand-300 transition-colors tracking-tight mb-2.5 line-clamp-2">
            ${b.title}
          </h2>
          <p class="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
            ${b.excerpt || b.content.slice(0, 140) + '...'}
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
