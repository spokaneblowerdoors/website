// Renders public/favicon.svg to square PNGs at build time. Google needs a square icon
// whose size is a multiple of 48 px, at a stable address.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

export async function iconPng(size: number): Promise<Buffer> {
  const svg = readFileSync('public/favicon.svg');
  return sharp(svg, { density: 72 * (size / 32) })
    .resize(size, size)
    .png()
    .toBuffer();
}

// favicon.ico holding one 48x48 PNG image.
export async function iconIco(): Promise<Buffer> {
  const image = await iconPng(48);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(48, 6); // width
  header.writeUInt8(48, 7); // height
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(image.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([header, image]);
}
