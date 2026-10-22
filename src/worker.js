// Tiny front door for the website on Cloudflare Workers.
// Sends www.spokaneblowerdoors.com and plain http:// to https://spokaneblowerdoors.com in ONE 301 redirect,
// then serves the built static site (dist/) for everything else.
const CANONICAL_HOST = 'spokaneblowerdoors.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isOurDomain = url.hostname === CANONICAL_HOST || url.hostname === `www.${CANONICAL_HOST}`;
    if (isOurDomain && (url.hostname !== CANONICAL_HOST || url.protocol !== 'https:')) {
      url.hostname = CANONICAL_HOST;
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
