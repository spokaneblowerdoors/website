import { iconIco } from '../lib/icon';

export async function GET() {
  return new Response(new Uint8Array(await iconIco()), { headers: { 'Content-Type': 'image/x-icon' } });
}
