// quicksathi_motion_ad/src/render_mp4.js
// Automated 1080p 30fps Full MP4 Video Generator for QuickSathi Motion Ad
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const PORT = 49876;
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const FPS = 30;
const DURATION = 30.0;
const TOTAL_FRAMES = Math.floor(FPS * DURATION); // 900 frames

// MIME types for local static file server
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.json': 'application/json'
};

async function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT_DIR, reqPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Local video render server listening at http://127.0.0.1:${PORT}`);
      resolve(server);
    });
  });
}

async function renderVideo() {
  console.log(`=======================================================`);
  console.log(`🎬 QuickSathi 30s Motion Graphic Ad — Production Render`);
  console.log(`Resolution: 1920x1080 | Framerate: ${FPS} FPS | Frames: ${TOTAL_FRAMES}`);
  console.log(`=======================================================`);

  const server = await startServer();

  console.log(`Launching Chrome headless at: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  console.log(`Navigating to motion engine...`);

  // Capture browser console output for debugging
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type.toUpperCase()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => console.log(`[Browser Page Error] ${err.message}`));

  await page.goto(`http://127.0.0.1:${PORT}/index.html?render=1`, { waitUntil: 'domcontentloaded', timeout: 20000 });

  // Wait for canvas, images and engine to be initialized
  await page.waitForFunction(() => window.isReady === true, { timeout: 30000 });
  console.log(`Motion engine initialized and assets ready!`);
  await new Promise(r => setTimeout(r, 800));

  const outputMp4 = path.join(ROOT_DIR, 'renders', 'quicksathi_30s_motion_ad.mp4');
  const soundtrackPath = path.join(ROOT_DIR, 'assets', 'soundtrack_30s.wav');

  // Spawn FFmpeg to encode the PNG stream with audio
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', String(FPS),
    '-i', '-',
    '-i', soundtrackPath,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '18',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-shortest',
    outputMp4
  ];

  console.log(`Spawning FFmpeg encoder...`);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs);

  ffmpeg.stderr.on('data', (data) => {
    // Keep ffmpeg quiet unless error, or log summary
    const str = data.toString();
    if (str.includes('Error') || str.includes('fatal')) {
      console.error(`[FFmpeg Error]: ${str}`);
    }
  });

  const startTime = Date.now();

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    const t = frame / FPS;

    // Render exact deterministic frame
    const base64Png = await page.evaluate((curTime) => {
      // Find canvas
      const canvas = document.getElementById('motionCanvas');
      if (window.engine) {
        window.engine.renderFrame(curTime);
      }
      return canvas.toDataURL('image/png').slice(22);
    }, t);

    const buffer = Buffer.from(base64Png, 'base64');
    
    // Write frame to ffmpeg stdin with backpressure handling
    const canContinue = ffmpeg.stdin.write(buffer);
    if (!canContinue) {
      await new Promise(r => ffmpeg.stdin.once('drain', r));
    }

    if (frame % 60 === 0 || frame === TOTAL_FRAMES - 1) {
      const pct = ((frame / TOTAL_FRAMES) * 100).toFixed(1);
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
      const fpsReal = (frame / (Math.max(0.1, (Date.now() - startTime) / 1000))).toFixed(1);
      console.log(`[Frame ${frame.toString().padStart(3, ' ')}/${TOTAL_FRAMES}] ${pct}% | Time: ${t.toFixed(1)}s | Render speed: ${fpsReal} fps | Elapsed: ${elapsedSec}s`);
    }
  }

  console.log(`All frames written to encoder! Finalizing MP4 stream...`);
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`🎉 FFmpeg rendering completed successfully! Code: ${code}`);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });

  // Check generated file size
  if (fs.existsSync(outputMp4)) {
    const stats = fs.statSync(outputMp4);
    console.log(`✅ Production MP4 Video ready: ${outputMp4}`);
    console.log(`📦 File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  // Also generate a preview WebP animated clip / keyframe snapshots
  console.log(`Generating high-quality keyframe snapshot and WebP preview...`);
  const previewWebp = path.join(ROOT_DIR, 'renders', 'quicksathi_motion_preview.webp');
  const webpArgs = [
    '-y',
    '-i', outputMp4,
    '-vf', 'fps=15,scale=960:-1:flags=lanczos',
    '-c:v', 'libwebp',
    '-lossless', '0',
    '-q:v', '75',
    '-loop', '0',
    '-t', '10', // 10s preview clip
    previewWebp
  ];
  const ffmpegWebp = spawn('ffmpeg', webpArgs);
  await new Promise((res) => ffmpegWebp.on('close', res));
  if (fs.existsSync(previewWebp)) {
    const ws = fs.statSync(previewWebp);
    console.log(`✅ WebP preview created: ${previewWebp} (${(ws.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  await browser.close();
  server.close();
  console.log(`🎬 Video production complete! All assets saved in quicksathi_motion_ad/renders/`);
}

renderVideo().catch(err => {
  console.error("Render failed:", err);
  process.exit(1);
});
