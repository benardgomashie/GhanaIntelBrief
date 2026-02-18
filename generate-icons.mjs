// Script to generate PWA icons with Ghana flag gradient
// Run with: node generate-icons.mjs

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create Ghana flag gradient (red, yellow, green with black star)
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, '#EF4444');    // Red
  gradient.addColorStop(0.33, '#EF4444');
  gradient.addColorStop(0.33, '#FCD34D'); // Yellow
  gradient.addColorStop(0.66, '#FCD34D');
  gradient.addColorStop(0.66, '#22C55E'); // Green
  gradient.addColorStop(1, '#22C55E');

  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw black star in center
  const centerX = size / 2;
  const centerY = size / 2;
  const starRadius = size * 0.3;
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * starRadius;
    const y = centerY + Math.sin(angle) * starRadius;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Inner point
    const innerAngle = angle + Math.PI / 5;
    const innerRadius = starRadius * 0.4;
    const ix = centerX + Math.cos(innerAngle) * innerRadius;
    const iy = centerY + Math.sin(innerAngle) * innerRadius;
    ctx.lineTo(ix, iy);
  }
  ctx.closePath();
  ctx.fill();

  // Add "GIB" text
  const fontSize = size * 0.15;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GIB', centerX, centerY + starRadius + fontSize);

  return canvas;
}

// Generate all icon sizes
console.log('Generating PWA icons...');
sizes.forEach(size => {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filename = join(__dirname, 'public', `icon-${size}x${size}.png`);
  writeFileSync(filename, buffer);
  console.log(`✓ Generated ${size}x${size} icon`);
});

console.log('All icons generated successfully!');
