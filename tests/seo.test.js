import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, signIn, ADMIN_EMAIL, ADMIN_PASSWORD } from './helpers.js';

let server;
let articleId;
before(async () => {
  server = await startServer({ APP_URL: 'https://school.example' });
  const admin = await signIn(server.url, ADMIN_EMAIL, ADMIN_PASSWORD);
  const res = await admin('POST', '/api/news', {
    title: 'Library <script>alert(1)</script> Opening',
    category: 'Facilities',
    day: '05',
    month: 'OCT',
    summary: 'The new library opens.',
    body: 'First paragraph.\n\nSecond paragraph.',
  });
  articleId = res.body.id;
});
after(async () => { await server.stop(); });

test('robots.txt allows the site, hides the API and points to the sitemap', async () => {
  const text = await (await fetch(`${server.url}/robots.txt`)).text();
  assert.match(text, /Disallow: \/api\//);
  assert.match(text, /Sitemap: https:\/\/school\.example\/sitemap\.xml/);
});

test('sitemap lists the home page and every article with the public URL', async () => {
  const res = await fetch(`${server.url}/sitemap.xml`);
  assert.match(res.headers.get('content-type'), /xml/);
  const xml = await res.text();
  assert.match(xml, /<loc>https:\/\/school\.example\/<\/loc>/);
  assert.match(xml, new RegExp(`<loc>https://school\\.example/news/${articleId}</loc>`));
});

test('article pages are server-rendered, escaped and carry share metadata', async () => {
  const res = await fetch(`${server.url}/news/${articleId}`);
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.ok(!html.includes('<script>alert(1)</script>'), 'title is escaped');
  assert.match(html, /Library &lt;script&gt;alert\(1\)&lt;\/script&gt; Opening/);
  assert.match(html, /<p>First paragraph\.<\/p>/);
  assert.match(html, /<p>Second paragraph\.<\/p>/);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://school\\.example/news/${articleId}"`));
  assert.match(html, /application\/ld\+json/);
});

test('unknown or malformed article ids are not served as articles', async () => {
  // They fall through to the single-page app (or 404 when no build exists)
  for (const path of ['/news/999999', `/news/${articleId}abc`]) {
    const html = await (await fetch(`${server.url}${path}`)).text();
    assert.ok(!html.includes('class="category"'), `${path} must not render an article page`);
  }
});
