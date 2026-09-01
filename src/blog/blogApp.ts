import { fetchAllBlogs, fetchBlogBySlug } from '../services/configService';
import { BlogPost } from '../types';

// Simple lightweight Markdown to HTML parser
function renderMarkdown(md: string): string {
  if (!md) return '';
  let html = md
    // Escape angle brackets for code security
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-6 mb-3 tracking-tight">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-brand-300 mt-8 mb-4 tracking-tight border-b border-slate-800 pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold text-white mt-8 mb-4 tracking-tight">$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="text-slate-300 italic">$1</em>')
    // Blockquote
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-brand-500 pl-4 py-2 my-4 bg-dark-900/60 rounded-r-lg text-slate-300 italic">$1</blockquote>')
    // Code block
    .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="bg-dark-950 p-4 rounded-xl border border-slate-800 text-brand-300 font-mono text-sm overflow-x-auto my-4"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code class="bg-dark-800 px-1.5 py-0.5 rounded text-brand-300 font-mono text-xs border border-slate-700/60">$1</code>')
    // Unordered lists
    .replace(/^\s*-\s+(.*$)/gim, '<li class="flex items-start gap-2 text-slate-300 my-1"><span class="text-brand-400 mt-1 font-bold">&bull;</span><span>$1</span></li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-brand-400 hover:text-brand-300 underline font-medium">$1</a>')
    // Paragraphs
    .replace(/\n\s*\n/gim, '</p><p class="text-slate-300 leading-relaxed my-4">');

  return `<div class="prose prose-invert max-w-none text-slate-300"><p class="text-slate-300 leading-relaxed my-4">${html}</p></div>`;
}

function calculateReadingTime(text: string): string {
  const words = text ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export async function renderBlogView(container: HTMLElement, slug?: string): Promise<void> {
  if (slug) {
    // Render Single Blog Article
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
          <a href="/blog" data-route-link class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl transition-colors">
            &larr; Back to All Articles
          </a>
        </div>
      `;
      return;
    }

    // Update document title for SEO
    document.title = `${blog.title} | VidToAudio Blog`;

    const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Recently Published';

    container.innerHTML = `
      <div class="max-w-4xl mx-auto px-4 py-12">
        <nav class="flex items-center gap-2 text-xs text-slate-400 mb-8">
          <a href="/" data-route-link class="hover:text-brand-400 transition-colors">Home</a>
          <span>/</span>
          <a href="/blog" data-route-link class="hover:text-brand-400 transition-colors">Blog</a>
          <span>/</span>
          <span class="text-slate-200 truncate max-w-xs">${blog.title}</span>
        </nav>

        <header class="mb-10 pb-8 border-b border-slate-800">
          <div class="flex items-center gap-3 mb-4">
            <span class="px-3 py-1 bg-brand-950 text-brand-400 border border-brand-800/60 rounded-full text-xs font-semibold uppercase tracking-wider">
              Audio Extraction Guide
            </span>
            <span class="text-xs text-slate-500 font-medium">${calculateReadingTime(blog.content)}</span>
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
          <a href="/blog" data-route-link class="inline-flex items-center gap-2 px-5 py-2.5 bg-dark-900 border border-slate-700 hover:border-brand-500 text-slate-200 hover:text-white rounded-xl transition-all">
            &larr; Back to All Articles
          </a>
          <a href="/" data-route-link class="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl shadow-lg transition-all">
            Try Offline Audio Converter
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
          Audio Engineering & Extraction Guides
        </span>
        <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          VidToAudio Blog & Insights
        </h1>
        <p class="text-slate-400 text-base sm:text-lg">
          Explore technical guides, format comparisons, and on-device privacy optimization tutorials.
        </p>
      </header>

      <div id="blog-posts-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="col-span-full py-16 text-center">
          <div class="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm text-slate-400">Loading articles from Firestore...</p>
        </div>
      </div>
    </div>
  `;

  document.title = 'Audio Guides & Conversion Insights | VidToAudio Blog';

  const blogs = await fetchAllBlogs();
  const grid = document.getElementById('blog-posts-grid');
  if (!grid) return;

  if (!blogs || blogs.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-dark-900 border border-slate-800 rounded-2xl p-12 text-center">
        <div class="w-14 h-14 bg-brand-950/60 border border-brand-800 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No Articles Published Yet</h3>
        <p class="text-slate-400 text-sm max-w-md mx-auto mb-6">
          Publish your first technical guide or video-to-audio tutorial using the protected Admin Dashboard.
        </p>
        <a href="/admin" data-route-link class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-xl transition-colors">
          Open Admin CMS &rarr;
        </a>
      </div>
    `;
    return;
  }

  grid.innerHTML = blogs.map(blog => {
    const formattedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'Recent';

    return `
      <article class="bg-dark-900/90 border border-slate-800 hover:border-brand-500/60 rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-lg group">
        <div>
          <div class="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
            <span class="font-medium text-slate-400">${formattedDate}</span>
            <span class="bg-dark-950 px-2 py-0.5 rounded text-brand-400 font-mono">${calculateReadingTime(blog.content)}</span>
          </div>
          <h2 class="text-xl font-bold text-white group-hover:text-brand-300 transition-colors mb-3 line-clamp-2">
            <a href="/blog/${blog.slug}" data-route-link>${blog.title}</a>
          </h2>
          <p class="text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed">
            ${blog.excerpt || (blog.content ? blog.content.slice(0, 140).replace(/[#*`]/g, '') + '...' : 'Read this article to learn more about video-to-audio extraction.')}
          </p>
        </div>
        <div class="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-xs text-slate-500 font-mono">/${blog.slug}</span>
          <a href="/blog/${blog.slug}" data-route-link class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 group-hover:translate-x-0.5 transition-transform">
            Read Article &rarr;
          </a>
        </div>
      </article>
    `;
  }).join('');
}
