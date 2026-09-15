const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

if (!fs.existsSync(logoPath)) {
  console.error('logo.png not found!');
  process.exit(1);
}

const pngBuf = fs.readFileSync(logoPath);
console.log('PNG size:', pngBuf.length);

// Create valid ICO wrapper around the PNG
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // 1 = icon (.ico)
icoHeader.writeUInt16LE(1, 4); // 1 image
icoHeader.writeUInt8(0, 6);   // width (0 = 256)
icoHeader.writeUInt8(0, 7);   // height (0 = 256)
icoHeader.writeUInt8(0, 8);   // color count
icoHeader.writeUInt8(0, 9);   // reserved
icoHeader.writeUInt16LE(1, 10); // color planes
icoHeader.writeUInt16LE(32, 12); // bpp
icoHeader.writeUInt32LE(pngBuf.length, 14); // image data size
icoHeader.writeUInt32LE(22, 18); // offset to image data

const icoBuf = Buffer.concat([icoHeader, pngBuf]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
console.log('Successfully wrote public/favicon.ico (' + icoBuf.length + ' bytes)');

// Also generate SVG favicon wrapping the brand logo base64
const b64 = pngBuf.toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <image href="data:image/png;base64,${b64}" width="100" height="100"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
console.log('Successfully wrote public/favicon.svg (' + svgContent.length + ' bytes)');

// Ensure favicon.png and apple-touch-icon.png are copies of logo.png
fs.copyFileSync(logoPath, path.join(publicDir, 'favicon.png'));
fs.copyFileSync(logoPath, path.join(publicDir, 'favicon-48x48.png'));
fs.copyFileSync(logoPath, path.join(publicDir, 'favicon-96x96.png'));
fs.copyFileSync(logoPath, path.join(publicDir, 'favicon-192x192.png'));
fs.copyFileSync(logoPath, path.join(publicDir, 'apple-touch-icon.png'));
console.log('All favicon variants synced with logo.png successfully.');
