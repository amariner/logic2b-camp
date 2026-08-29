import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const repoRoot = resolve(siteRoot, '../..');
const outputDir = join(siteRoot, 'public/media');
const outputVideo = join(outputDir, 'logic2b-dashboard-mini.mp4');
const outputPoster = join(outputDir, 'logic2b-dashboard-mini-poster.webp');
const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? 'ffprobe';
const workDir = await mkdtemp(join(tmpdir(), 'logic-camp-dashboard-video-'));
const candidateVideo = join(workDir, 'logic2b-dashboard-mini.mp4');
const candidatePoster = join(workDir, 'logic2b-dashboard-mini-poster.webp');

const WIDTH = 1280;
const HEIGHT = 720;
const DURATION_SECONDS = 14.2;
const VIDEO_BUDGET_BYTES = 4_000_000;
const POSTER_BUDGET_BYTES = 350_000;

const scenes = [
  {
    label: 'CONTROL TOTAL',
    source: join(repoRoot, 'docs/img/control-total-centro-desktop-2026-08-14.png'),
    crops: [
      { region: [0.16, 0.31, 0.51, 0.48], frame: [48, 214, 628, 354] },
      { region: [0.56, 0.32, 0.4, 0.48], frame: [706, 280, 526, 306] },
    ],
  },
  {
    label: 'PLANNING',
    source: join(siteRoot, 'public/captura-planning.webp'),
    crops: [
      { region: [0.1, 0.02, 0.67, 0.53], frame: [46, 194, 704, 342] },
      { region: [0.34, 0.31, 0.59, 0.42], frame: [688, 300, 544, 286] },
    ],
  },
  {
    label: 'PLANO EN VIVO',
    source: join(siteRoot, 'public/captura-plano.webp'),
    crops: [
      { region: [0.07, 0.14, 0.59, 0.64], frame: [48, 180, 650, 390] },
      { region: [0.54, 0.16, 0.39, 0.54], frame: [724, 258, 504, 330] },
    ],
  },
];

await mkdir(outputDir, { recursive: true });

try {
  const scenePaths = [];
  for (const [index, scene] of scenes.entries()) {
    const scenePath = join(workDir, `scene-${index + 1}.png`);
    await composeScene(scene, scenePath);
    scenePaths.push(scenePath);
  }

  await sharp(scenePaths[0]).webp({ quality: 80, effort: 5, smartSubsample: true }).toFile(candidatePoster);

  const loop = [...scenePaths, scenePaths[0]];
  const inputs = loop.flatMap((path) => ['-loop', '1', '-framerate', '30', '-t', '4', '-i', path]);
  const prepared = loop
    .map(
      (_, index) =>
        `[${index}:v]zoompan=z='min(zoom+0.00015,1.018)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${WIDTH}x${HEIGHT}:fps=30,format=yuv420p,setpts=PTS-STARTPTS[v${index}]`,
    )
    .join(';');
  const transitions = [
    '[v0][v1]xfade=transition=fade:duration=0.6:offset=3.4[x1]',
    '[x1][v2]xfade=transition=fade:duration=0.6:offset=6.8[x2]',
    '[x2][v3]xfade=transition=fade:duration=0.6:offset=10.2[out]',
  ].join(';');

  await run(
    ffmpeg,
    [
      '-y',
      ...inputs,
      '-filter_complex',
      `${prepared};${transitions}`,
      '-map',
      '[out]',
      '-an',
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '22',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      candidateVideo,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );

  const metadata = await probe(candidateVideo);
  const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
  const audioStream = metadata.streams.find((stream) => stream.codec_type === 'audio');
  const duration = Number(metadata.format.duration);
  const videoFile = await stat(candidateVideo);
  const posterFile = await stat(candidatePoster);
  const posterMeta = await sharp(candidatePoster).metadata();

  if (videoStream?.codec_name !== 'h264') throw new Error('El MP4 final no usa H.264');
  if (videoStream.width !== WIDTH || videoStream.height !== HEIGHT)
    throw new Error(`Resolución inesperada: ${videoStream.width}×${videoStream.height}`);
  if (videoStream.pix_fmt !== 'yuv420p') throw new Error(`Pixel format inesperado: ${videoStream.pix_fmt}`);
  if (audioStream) throw new Error('El MP4 final contiene una pista de audio inesperada');
  if (Math.abs(duration - DURATION_SECONDS) > 0.25)
    throw new Error(`Duración inesperada: ${duration.toFixed(2)} s`);
  if (videoFile.size > VIDEO_BUDGET_BYTES)
    throw new Error(`El vídeo supera 4 MB: ${videoFile.size} bytes`);
  if (posterMeta.width !== WIDTH || posterMeta.height !== HEIGHT || posterMeta.format !== 'webp')
    throw new Error(`Póster inesperado: ${posterMeta.format} ${posterMeta.width}×${posterMeta.height}`);
  if (posterFile.size > POSTER_BUDGET_BYTES)
    throw new Error(`El póster supera 350 kB: ${posterFile.size} bytes`);

  await copyFile(candidateVideo, outputVideo);
  await copyFile(candidatePoster, outputPoster);
  console.log(
    `logic2b-dashboard-mini.mp4 · ${duration.toFixed(1)} s · ${WIDTH}×${HEIGHT} · ${Math.round(videoFile.size / 1024)} kB`,
  );
  console.log(
    `logic2b-dashboard-mini-poster.webp · ${WIDTH}×${HEIGHT} · ${Math.round(posterFile.size / 1024)} kB`,
  );
} finally {
  await rm(workDir, { recursive: true, force: true });
}

async function composeScene(scene, destination) {
  const backdrop = await roundedImage(scene.source, 1120, 630, 18, {
    brightness: 0.42,
    saturation: 0.58,
  });
  const overlays = [
    { input: backdrop, left: 80, top: 45 },
    { input: label(scene.label), left: 103, top: 70 },
  ];

  for (const crop of scene.crops) {
    const [left, top, width, height] = crop.frame;
    overlays.push({ input: shadow(width, height), left: left - 34, top: top - 28 });
    overlays.push({
      input: await croppedCard(scene.source, crop.region, width, height),
      left,
      top,
    });
  }

  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: '#27312b' },
  })
    .composite(overlays)
    .png()
    .toFile(destination);
}

async function roundedImage(source, width, height, radius, modulate) {
  return sharp(source)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .modulate(modulate)
    .composite([{ input: roundMask(width, height, radius), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

async function croppedCard(source, region, width, height) {
  const metadata = await sharp(source).metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;
  const [x, y, w, h] = region;
  const extract = {
    left: Math.round(sourceWidth * x),
    top: Math.round(sourceHeight * y),
    width: Math.min(Math.round(sourceWidth * w), sourceWidth - Math.round(sourceWidth * x)),
    height: Math.min(Math.round(sourceHeight * h), sourceHeight - Math.round(sourceHeight * y)),
  };
  return sharp(source)
    .extract(extract)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .composite([{ input: roundMask(width, height, 14), blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function roundMask(width, height, radius) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" rx="${radius}" fill="white"/></svg>`,
  );
}

function shadow(width, height) {
  return Buffer.from(`<svg width="${width + 68}" height="${height + 58}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="s" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="17"/></filter></defs>
    <rect x="34" y="24" width="${width}" height="${height}" rx="16" fill="#07110b" opacity=".46" filter="url(#s)"/>
  </svg>`);
}

function label(text) {
  const width = Math.max(126, text.length * 8.2 + 34);
  return Buffer.from(`<svg width="${width}" height="34" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="34" rx="17" fill="#e1f4df"/>
    <text x="17" y="22" fill="#0f3e17" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="1.2">${text}</text>
  </svg>`);
}

async function probe(path) {
  const { stdout } = await run(ffprobe, [
    '-v',
    'error',
    '-show_entries',
    'format=duration,size:stream=codec_name,codec_type,width,height,pix_fmt',
    '-of',
    'json',
    path,
  ]);
  return JSON.parse(stdout);
}
