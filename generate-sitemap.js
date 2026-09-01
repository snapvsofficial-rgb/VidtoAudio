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

function generateSitemap() {
  const urls = [];

  // 1. Root URL (Priority 1.0)
  urls.push(`  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  // 2. Main Blog Index (Priority 0.8)
  urls.push(`  <url>
    <loc>${BASE_URL}/blog</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);

  // 3. Featured & Placeholder Blog Routes (Priority 0.7)
  const blogSlugs = [
    'how-to-extract-audio-from-video-offline',
    'mp4-to-wav-vs-mp3-fidelity-guide',
    'lossless-audio-extraction-explained'
  ];

  blogSlugs.forEach(slug => {
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // 4. Programmatic Format Converter Routes (81 combinations, Priority 0.8)
  validInputs.forEach(inExt => {
    validOutputs.forEach(outExt => {
      urls.push(`  <url>
    <loc>${BASE_URL}/${inExt}-to-${outExt}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });
  });

  // 5. Static Pages (Priority 0.5)
  urls.push(`  <url>
    <loc>${BASE_URL}/privacy-policy.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

  urls.push(`  <url>
    <loc>${BASE_URL}/terms.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
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

  console.log(`[Sitemap Generator] Successfully generated sitemap with ${urls.length} URLs:`);
  console.log(` - ${publicSitemapPath}`);
  console.log(` - ${rootSitemapPath}`);
}

generateSitemap();
