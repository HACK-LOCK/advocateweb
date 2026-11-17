// Minimal static file server for Render Web Service deployments.
// Uses only Node.js built-in modules - no npm dependencies required.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 10000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

// Only the application shell and its asset folders are publicly served.
const PUBLIC_DIRS = ['css', 'js'];
const PUBLIC_FILES = new Set(['index.html']);

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    ...headers
  });
  res.end(body);
}

function notFound(res) {
  send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return send(res, 400, 'Bad request', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/index.html';
  }

  const relativePath = pathname.replace(/^\/+/, '');
  const topLevel = relativePath.split('/')[0];

  if (!PUBLIC_FILES.has(relativePath) && !PUBLIC_DIRS.includes(topLevel)) {
    return notFound(res);
  }

  const filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    return notFound(res);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return notFound(res);
    }

    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
  });
});

server.listen(PORT, () => {
  console.log(`advocateweb listening on port ${PORT}`);
});
