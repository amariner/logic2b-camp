import { createServer } from 'node:http';
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

/** Local, read-only server for the composed catalogue; never reaches the API. */
export async function themeQaServer(dist) {
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };
  const server = createServer(async (req, res) => {
    const path = resolve(
      dist,
      '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname),
    );
    if (!path.startsWith(dist + '/') && path !== dist) return res.writeHead(400).end();
    const file = existsSync(path) && statSync(path).isFile() ? path : join(path, 'index.html');
    if (!existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
