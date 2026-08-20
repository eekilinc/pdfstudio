import fs from 'fs';

const buf = fs.readFileSync('src-tauri/icons/icon.ico');
const count = buf.readUInt16LE(4);
console.log('ICO image count:', count);
for (let i = 0; i < count; i++) {
  const w = buf[6 + i * 16] || 256;
  const h = buf[7 + i * 16] || 256;
  const size = buf.readUInt32LE(14 + i * 16);
  const offset = buf.readUInt32LE(18 + i * 16);
  console.log(`Layer ${i+1}: ${w}x${h}, size: ${size} bytes, offset: ${offset}`);
}
