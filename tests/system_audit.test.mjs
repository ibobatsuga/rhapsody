import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('1. Security & SSRF Audit (/api/ai/proxy-audio)', () => {
  test('Should reject loopback and private IP addresses (SSRF mitigation)', async () => {
    const maliciousUrls = [
      'http://127.0.0.1:8080/secret',
      'http://localhost:3000',
      'http://169.254.169.254/latest/meta-data/',
      'http://10.0.0.1/admin',
      'http://192.168.1.1/router',
      'file:///etc/passwd',
      'ftp://example.com/audio.mp3'
    ];

    for (const badUrl of maliciousUrls) {
      const res = await fetch(`${baseUrl}/api/ai/proxy-audio?url=${encodeURIComponent(badUrl)}`);
      assert.strictEqual(
        res.status,
        403,
        `Expected 403 Forbidden for SSRF attempt with ${badUrl}, got ${res.status}`
      );
    }
  });

  test('Should reject empty or non-URL parameters', async () => {
    const res = await fetch(`${baseUrl}/api/ai/proxy-audio?url=`);
    assert.strictEqual(res.status, 403);
  });
});

describe('2. Input Validation & Bounds Audit (/api/ai/generate)', () => {
  test('Should reject oversized prompts (> 2000 chars) to prevent memory exhaustion', async () => {
    const hugePrompt = 'A'.repeat(50000);
    const res = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: hugePrompt })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('exceeds maximum permitted limit'));
  });

  test('Should reject invalid provider names', async () => {
    const res = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'hacker_malicious_provider', prompt: 'test' })
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes('Invalid provider'));
  });

  test('Should reject empty or whitespace prompt', async () => {
    const res = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'suno', prompt: '   ' })
    });

    assert.strictEqual(res.status, 400);
  });

  test('Should successfully create and complete simulated task lifecycle', async () => {
    const res = await fetch(`${baseUrl}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'suno',
        prompt: 'Synthwave 80s demo',
        mock: true
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.taskId);
    assert.strictEqual(data.mode, 'simulation');

    // Poll status immediately
    const pollRes = await fetch(`${baseUrl}/api/ai/status/${data.taskId}`);
    assert.strictEqual(pollRes.status, 200);
    const pollData = await pollRes.json();
    assert.ok(['processing', 'completed'].includes(pollData.status));
  });
});

describe('3. Rate Limiting Protection', () => {
  test('Should throttle abusive rapid bursts (Rate Limiter)', async () => {
    // Fire 35 rapid requests (Limit is 30)
    const requests = Array.from({ length: 35 }).map(() =>
      fetch(`${baseUrl}/api/health`)
    );
    const results = await Promise.all(requests);
    const statuses = results.map(r => r.status);
    const has429 = statuses.includes(429);
    assert.ok(has429, 'Expected HTTP 429 Too Many Requests when rate threshold exceeded');
  });
});
