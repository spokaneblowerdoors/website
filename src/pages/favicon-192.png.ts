import { iconPng } from '../lib/icon';

export async function GET() {
  return new Response(new Uint8Array(await iconPng(192)), { headers: { 'Content-Type': 'image/png' } });
}
