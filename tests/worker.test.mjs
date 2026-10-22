// Unit test for src/worker.js redirects. Run: node --test tests/worker.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.js';

const env = { ASSETS: { fetch: async (req) => new Response(`asset:${new URL(req.url).pathname}`, { status: 200 }) } };
const go = (url) => worker.fetch(new Request(url), env);

test('https apex is served as-is', async () => {
  const res = await go('https://spokaneblowerdoors.com/contact/');
  assert.equal(res.status, 200);
  assert.equal(await res.text(), 'asset:/contact/');
});

test('www redirects to apex in one 301, keeping path and query', async () => {
  const res = await go('https://www.spokaneblowerdoors.com/services/?x=1');
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('location'), 'https://spokaneblowerdoors.com/services/?x=1');
});

test('http www goes straight to https apex in one 301', async () => {
  const res = await go('http://www.spokaneblowerdoors.com/');
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('location'), 'https://spokaneblowerdoors.com/');
});

test('http apex redirects to https', async () => {
  const res = await go('http://spokaneblowerdoors.com/about/');
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('location'), 'https://spokaneblowerdoors.com/about/');
});

test('workers.dev and preview addresses are served, not redirected', async () => {
  const res = await go('https://pr-9-spokaneblowerdoors-site.spokaneblowerdoors.workers.dev/');
  assert.equal(res.status, 200);
});
