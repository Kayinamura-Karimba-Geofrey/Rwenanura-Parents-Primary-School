// Search-engine facing routes: robots.txt, sitemap.xml and a server-rendered
// page per news article (/news/:id) that can be indexed and shared.
import express from 'express';
import db from '../db.js';

const router = express.Router();

const SITE_NAME = 'Rwenanura Parents Primary School';

function siteUrl() {
  return (process.env.APP_URL || 'http://localhost:5000').replace(/\/+$/, '');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl()}/sitemap.xml\n`);
});

router.get('/sitemap.xml', (req, res) => {
  const base = siteUrl();
  const articles = db.prepare('SELECT id, created_at FROM news_events ORDER BY id DESC').all();
  const urls = [
    `<url><loc>${base}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>`,
    ...articles.map(a => {
      const lastmod = (a.created_at || '').slice(0, 10);
      return `<url><loc>${base}/news/${a.id}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<priority>0.6</priority></url>`;
    }),
  ];
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  );
});

// GET /news/:id - Standalone article page
router.get('/news/:id', (req, res, next) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || String(id) !== req.params.id) return next();
  const item = db.prepare('SELECT * FROM news_events WHERE id = ?').get(id);
  if (!item) return next();

  const base = siteUrl();
  const url = `${base}/news/${item.id}`;
  const date = [item.day_str, item.month_str, item.year_str].filter(Boolean).join(' ');
  const meta = [date, item.time_str, item.location].filter(Boolean).join(' • ');
  const paragraphs = [item.summary, ...String(item.body || '').split(/\n\s*\n/)]
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('\n      ');
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': item.type === 'event' ? 'Event' : 'NewsArticle',
    ...(item.type === 'event'
      ? { name: item.title, location: { '@type': 'Place', name: item.location }, organizer: { '@type': 'School', name: SITE_NAME, url: base } }
      : { headline: item.title, publisher: { '@type': 'School', name: SITE_NAME, url: base } }),
    description: item.summary,
    url,
  }).replace(/</g, '\\u003c');

  res.setHeader('Cache-Control', 'public, max-age=300');
  res.type('html').send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(item.title)} | ${SITE_NAME}</title>
    <meta name="description" content="${escapeHtml(item.summary)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(item.title)}" />
    <meta property="og:description" content="${escapeHtml(item.summary)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(base)}/images/hero-1.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="#0d5c3a" />
    <script type="application/ld+json">${structuredData}</script>
    <style>
      @font-face { font-family: 'Inter'; font-weight: 300 700; font-display: swap; src: url('/fonts/inter-latin.woff2') format('woff2'); }
      @font-face { font-family: 'Outfit'; font-weight: 400 800; font-display: swap; src: url('/fonts/outfit-latin.woff2') format('woff2'); }
      body { margin: 0; font-family: 'Inter', sans-serif; color: #334155; background: #f8fafc; line-height: 1.7; }
      header { background: #0d5c3a; padding: 1rem; }
      header a { color: #fff; font-family: 'Outfit', sans-serif; font-weight: 700; text-decoration: none; }
      main { max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
      .category { display: inline-block; background: #e8f5ee; color: #0d5c3a; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 999px; }
      h1 { font-family: 'Outfit', sans-serif; color: #0f172a; line-height: 1.25; margin: 0.75rem 0 0.25rem; }
      .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }
      .back { display: inline-block; margin-top: 2rem; color: #0d5c3a; font-weight: 700; }
    </style>
  </head>
  <body>
    <header><a href="/">← ${SITE_NAME}</a></header>
    <main>
      <span class="category">${escapeHtml(item.category)}</span>
      <h1>${escapeHtml(item.title)}</h1>
      <div class="meta">${escapeHtml(meta)}</div>
      ${paragraphs}
      <a class="back" href="/#news">More school news</a>
    </main>
  </body>
</html>`);
});

export default router;
