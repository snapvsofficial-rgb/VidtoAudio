import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://vidtoaudio.com';

// Exact format arrays from the client router
const validInputs = ['mp4', 'mkv', 'avi', 'webm', 'mov', 'flv', 'wmv', 'hevc', 'm4v'];
const validOutputs = ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'opus', 'aiff'];

// Get current ISO date YYYY-MM-DD
const lastmod = new Date().toISOString().split('T')[0];

const DEFAULT_BLOG_SLUGS = [
  'how-to-extract-audio-from-video-offline',
  'mp4-to-wav-vs-mp3-fidelity-guide',
  'lossless-audio-extraction-explained'
];

async function fetchDynamicBlogSlugs() {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-vidtoaudio-61b7ddf1-3de3-4e17-89d3-3fcc60ecf01c';
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/blogs`;

  try {
    console.log(`[Sitemap Generator] Fetching published blogs from Firestore: ${projectId}...`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    
    const response = await fetch(firestoreUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Sitemap Generator] Firestore HTTP ${response.status} ${response.statusText}, using fallback slugs.`);
      return DEFAULT_BLOG_SLUGS.map(s => ({ slug: s, lastmod }));
    }

    const data = await response.json();
    if (!data.documents || !Array.isArray(data.documents)) {
      console.log(`[Sitemap Generator] No blog documents returned from Firestore, using fallback slugs.`);
      return DEFAULT_BLOG_SLUGS.map(s => ({ slug: s, lastmod }));
    }

    const blogEntries = [];
    for (const doc of data.documents) {
      const fields = doc.fields || {};
      const published = fields.published?.booleanValue !== false;
      if (!published) continue;

      const slug = fields.slug?.stringValue?.trim() || doc.name?.split('/').pop();
      if (!slug) continue;

      const docTime = fields.updatedAt?.timestampValue || doc.updateTime || lastmod;
      const modDate = docTime.split('T')[0];

      blogEntries.push({ slug, lastmod: modDate });
    }

    // Merge default slugs if not present
    for (const defSlug of DEFAULT_BLOG_SLUGS) {
      if (!blogEntries.some(b => b.slug === defSlug)) {
        blogEntries.push({ slug: defSlug, lastmod });
      }
    }

    console.log(`[Sitemap Generator] Successfully discovered ${blogEntries.length} published blog slugs.`);
    return blogEntries;
  } catch (err) {
    console.warn(`[Sitemap Generator] Could not query Firestore REST API (${err.message}), using fallback slugs.`);
    return DEFAULT_BLOG_SLUGS.map(s => ({ slug: s, lastmod }));
  }
}

async function generateSitemap() {
  const urlBlocks = [];

  // Helper for generating multilingual URL blocks with Google xhtml:link alternates
  const addLocalizedUrls = (routePath, changefreq, priorityMap, customLastMod = lastmod) => {
    const getLoc = (lang, p) => {
      if (lang === 'en') {
        return `${BASE_URL}${p}`;
      }
      return `${BASE_URL}/${lang}${p === '/' ? '/' : p}`;
    };

    const xhtmlLinks = [
      `    <xhtml:link rel="alternate" hreflang="en" href="${getLoc('en', routePath)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="es" href="${getLoc('es', routePath)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="fr" href="${getLoc('fr', routePath)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${getLoc('en', routePath)}"/>`
    ].join('\n');

    const langs = [
      { code: 'en', priority: priorityMap.en || 1.0 },
      { code: 'es', priority: priorityMap.es || 0.8 },
      { code: 'fr', priority: priorityMap.fr || 0.8 }
    ];

    langs.forEach(({ code, priority }) => {
      const loc = getLoc(code, routePath);
      urlBlocks.push(`  <url>
    <loc>${loc}</loc>
${xhtmlLinks}
    <lastmod>${customLastMod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`);
    });
  };

  // 1. Root Homepage (Priority 1.0 EN, 0.9 ES/FR)
  addLocalizedUrls('/', 'weekly', { en: 1.0, es: 0.9, fr: 0.9 });

  // 2. Web Video Editor Studio (Priority 0.9 EN, 0.85 ES/FR)
  addLocalizedUrls('/editor', 'weekly', { en: 0.9, es: 0.85, fr: 0.85 });

  // 3. Blog Index (Priority 0.8 EN, 0.7 ES/FR)
  addLocalizedUrls('/blog', 'daily', { en: 0.8, es: 0.7, fr: 0.7 });

  // 3b. About Us & Publisher Transparency (Priority 0.8 EN, 0.7 ES/FR)
  addLocalizedUrls('/about', 'monthly', { en: 0.8, es: 0.7, fr: 0.7 });

  // 4. Dynamic Blog Articles from Firestore
  const blogEntries = await fetchDynamicBlogSlugs();
  blogEntries.forEach(({ slug, lastmod: postMod }) => {
    addLocalizedUrls(`/blog/${slug}`, 'monthly', { en: 0.7, es: 0.6, fr: 0.6 }, postMod || lastmod);
  });

  // 5. Programmatic Format Converter Routes (81 combinations x 3 languages)
  validInputs.forEach(inExt => {
    validOutputs.forEach(outExt => {
      addLocalizedUrls(`/${inExt}-to-${outExt}`, 'weekly', { en: 0.8, es: 0.7, fr: 0.7 });
    });
  });

  // 6. Static Legal & Information Pages (Priority 0.5)
  urlBlocks.push(`  <url>
    <loc>${BASE_URL}/privacy-policy.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

  urlBlocks.push(`  <url>
    <loc>${BASE_URL}/terms.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

  urlBlocks.push(`  <url>
    <loc>${BASE_URL}/disclaimer.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

  urlBlocks.push(`  <url>
    <loc>${BASE_URL}/contact.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks.join('\n')}
</urlset>
`;

  // Ensure public/ directory exists
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write to public/sitemap.xml (Vite copies public folder directly to dist root)
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, sitemapXml, 'utf-8');

  // Also write to project root sitemap.xml for direct repository reference
  const rootSitemapPath = path.join(__dirname, 'sitemap.xml');
  fs.writeFileSync(rootSitemapPath, sitemapXml, 'utf-8');

  console.log(`[Sitemap Generator] Successfully generated sitemap with ${urlBlocks.length} URLs across EN, ES, FR:`);
  console.log(` - ${publicSitemapPath}`);
  console.log(` - ${rootSitemapPath}`);
}

generateSitemap();
