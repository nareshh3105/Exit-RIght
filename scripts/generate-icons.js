const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, size, size);

  // Green circle
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.fill();

  // "ER" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.28}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ER', size / 2, size / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Generated icon-${size}x${size}.png`);
});
