import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp modern geometric financial-flow SVG for Montra
const brandSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#173D32"/>
      <stop offset="100%" stop-color="#0E2820"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9F99D"/>
      <stop offset="100%" stop-color="#A3E635"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background rounded canvas -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>

  <!-- Subtle ambient inner glow ring -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#D9F99D" stroke-width="2" stroke-opacity="0.15"/>

  <!-- Modern Geometric Montra Emblem: Flowing 'M' & Wealth Orbit -->
  <g filter="url(#shadow)" transform="translate(256, 256) scale(1.1) translate(-256, -256)">
    <!-- Base Wallet / Arc Foundation -->
    <path d="M128 320 C128 360, 160 384, 256 384 C352 384, 384 360, 384 320" 
          fill="none" stroke="#255E4E" stroke-width="20" stroke-linecap="round"/>
    
    <!-- Stylized Modern M / Dynamic Growth Peaks -->
    <path d="M140 330 L180 180 L256 280 L332 180 L372 330" 
          fill="none" stroke="#ffffff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Vibrant Lime Wealth Node / Coin Crest -->
    <circle cx="256" cy="150" r="32" fill="url(#accentGrad)" />
    <path d="M256 132 L256 168 M244 142 C244 136, 268 136, 268 146 C268 156, 244 154, 244 162 C244 168, 268 168, 268 164" 
          fill="none" stroke="#173D32" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
          
    <!-- Upward Growth Accent Trail -->
    <circle cx="348" cy="140" r="10" fill="#D9F99D" opacity="0.85"/>
  </g>
</svg>
`;

// Maskable icon with 15% safe padding
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#173D32"/>
      <stop offset="100%" stop-color="#0E2820"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9F99D"/>
      <stop offset="100%" stop-color="#A3E635"/>
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable -->
  <rect width="512" height="512" fill="url(#bgGrad)"/>

  <!-- Centered emblem scaled to safe zone (80% diameter) -->
  <g transform="translate(256, 256) scale(0.82) translate(-256, -256)">
    <!-- Base Wallet / Arc Foundation -->
    <path d="M128 320 C128 360, 160 384, 256 384 C352 384, 384 360, 384 320" 
          fill="none" stroke="#255E4E" stroke-width="22" stroke-linecap="round"/>
    
    <!-- Stylized Modern M -->
    <path d="M140 330 L180 180 L256 280 L332 180 L372 330" 
          fill="none" stroke="#ffffff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    
    <!-- Lime Coin Node -->
    <circle cx="256" cy="150" r="34" fill="url(#accentGrad)" />
    <path d="M256 132 L256 168 M244 142 C244 136, 268 136, 268 146 C268 156, 244 154, 244 162 C244 168, 268 168, 268 164" 
          fill="none" stroke="#173D32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>

    <circle cx="348" cy="140" r="11" fill="#D9F99D" opacity="0.9"/>
  </g>
</svg>
`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg);
  console.log('Saved icon.svg');

  const svgBuffer = Buffer.from(brandSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Saved pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Saved pwa-512x512.png');

  // 512x512 Maskable
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Saved pwa-maskable-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved apple-touch-icon.png');

  // 32x32 Favicon
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Saved favicon.ico');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
