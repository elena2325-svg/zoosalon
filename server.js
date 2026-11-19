const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const args = process.argv.slice(2);

function readArg(name, fallback) {
  const inline = args.find((arg) => arg.startsWith(`--${name}=`));
  if (inline) return inline.split('=').slice(1).join('=');
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) return args[index + 1];
  return fallback;
}

const host = readArg('host', '127.0.0.1');
const port = Number(readArg('port', process.env.PORT || 5173));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    const target = statError || !stat.isFile() ? path.join(root, 'index.html') : filePath;
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(port, host, () => {
  console.log(`Groom Love preview: http://${host}:${port}/`);
});
