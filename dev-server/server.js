/**
 * dev-server — 僅供本機開發使用
 *
 * 同時提供：
 *   - 前端靜態檔案（根目錄所有檔案）
 *   - /api/subtitles?videoId=<11碼ID>
 *   - /api/proxy-captions?url=<YouTube字幕URL>
 *
 * 用法：npm run dev
 * 注意：本伺服器無任何 Origin 白名單與 rate limit，僅限本機開發。
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = 3000;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.woff2':'font/woff2',
    '.woff': 'font/woff',
};

const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
const ALLOWED_CAPTION_DOMAINS = ['youtube.com', 'googlevideo.com', 'googleusercontent.com'];

function isAllowedCaptionUrl(raw) {
    try {
        const u = new URL(raw);
        if (u.protocol !== 'https:') return false;
        return ALLOWED_CAPTION_DOMAINS.some(d => u.hostname === d || u.hostname.endsWith('.' + d));
    } catch { return false; }
}

function normalizeSubtitle(item, index) {
    let start = 0;
    if (typeof item.offset === 'number') start = item.offset / 1000;
    else if (typeof item.offset === 'string') start = parseFloat(item.offset) / 1000;
    else if (typeof item.start === 'number') start = item.start;
    else if (typeof item.start === 'string') start = parseFloat(item.start);
    if (isNaN(start) || start < 0) start = index * 3;

    let duration = null;
    if (typeof item.duration === 'number') {
        duration = item.offset !== undefined ? item.duration / 1000 : item.duration;
    } else if (typeof item.duration === 'string') {
        duration = parseFloat(item.duration);
        if (item.offset !== undefined) duration = duration / 1000;
    }

    return { start, duration: (duration !== null && !isNaN(duration) && duration >= 0) ? duration : null, text: item.text };
}

async function handleApi(req, res, urlObj) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-store');

    if (urlObj.pathname === '/api/subtitles') {
        const videoId = urlObj.searchParams.get('videoId') || '';
        if (!VIDEO_ID_REGEX.test(videoId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid videoId' }));
        }
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            if (!transcript || transcript.length === 0) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'No transcript found' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ subtitles: transcript.map(normalizeSubtitle) }));
        } catch (e) {
            console.error('[subtitles] error:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to fetch transcript' }));
        }
        return;
    }

    if (urlObj.pathname === '/api/proxy-captions') {
        const captionUrl = urlObj.searchParams.get('url') || '';
        if (!isAllowedCaptionUrl(captionUrl)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid url' }));
        }
        try {
            const upstream = await fetch(captionUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
            });
            const text = await upstream.text();
            if (!upstream.ok) {
                res.writeHead(502, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Upstream error' }));
            }
            res.writeHead(200, { 'Content-Type': upstream.headers.get('content-type') || 'application/json' });
            res.end(text);
        } catch (e) {
            console.error('[proxy-captions] error:', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to proxy captions' }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
}

function serveStatic(req, res, urlObj) {
    let filePath = path.join(ROOT, urlObj.pathname === '/' ? 'index.html' : urlObj.pathname);
    // 防止目錄穿越
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); return res.end();
    }
    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            // fallback: index.html（SPA 用）
            filePath = path.join(ROOT, 'index.html');
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
    });
}

const server = http.createServer((req, res) => {
    const urlObj = new URL(req.url, `http://localhost:${PORT}`);
    if (urlObj.pathname.startsWith('/api/')) {
        handleApi(req, res, urlObj).catch(e => {
            console.error(e);
            if (!res.headersSent) { res.writeHead(500); res.end(); }
        });
    } else {
        serveStatic(req, res, urlObj);
    }
});

server.listen(PORT, () => {
    console.log(`[dev-server] http://localhost:${PORT}`);
    console.log('[dev-server] 提供前端靜態檔 + /api/subtitles + /api/proxy-captions');
    console.log('[dev-server] 僅供本機開發，請勿部署至正式環境');
});
