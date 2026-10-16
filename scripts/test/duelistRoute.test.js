'use strict';
// Due List routes: /clicms/upload is HQ-only (lobby roles 403), needs a file (400);
// /clicms/duelist/current answers every CMS role; /api/division/staff-monitoring/:hrmsId
// 404s an unknown staff. Real routers on a throwaway express app, session faked from a header.
const assert = require('assert');
const http = require('http');
const express = require('express');
const pool = require('../../config/database');

const app = express();
app.locals.pool = pool;
app.use(express.json());
app.use((req, _res, next) => { req.session = { user: JSON.parse(req.headers['x-test-user'] || 'null') }; next(); });
app.use('/clicms', require('../../routes/clicms'));
app.use('/api/division', require('../../routes/division/dashboardRoutes'));

const call = (port, method, path, user, body) => new Promise((resolve, reject) => {
  const data = body ? JSON.stringify(body) : null;
  const req = http.request({ port, method, path, headers: {
    'x-test-user': JSON.stringify(user), 'content-type': 'application/json', ...(data ? { 'content-length': Buffer.byteLength(data) } : {}) } },
  (res) => { let s = ''; res.on('data', (c) => { s += c; }); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(s || 'null') })); });
  req.on('error', reject);
  if (data) req.write(data);
  req.end();
});

const jrcc = { username: 'csmtmljrcc', div_role: 'jrcc', div_office_code: 'CSMT-ML' };
const hr = { username: 'csmthr', div_role: 'office_hr', div_office_code: 'CSMT-ML' };
const hq = { username: 'clihqmlbb', div_role: 'clicms', div_office_code: 'HQ' };
const admin = { username: 'deetro', div_role: 'division_admin', div_office_code: 'HQ' };

const server = app.listen(0);
(async () => {
  const { port } = server.address();
  try {
    let r = await call(port, 'POST', '/clicms/upload', jrcc);
    assert.strictEqual(r.status, 403, 'jrcc upload'); assert.ok(/Lobby users/.test(r.body.error));
    r = await call(port, 'POST', '/clicms/upload', hr);
    assert.strictEqual(r.status, 403, 'office_hr upload');
    r = await call(port, 'POST', '/clicms/upload', hq);
    assert.strictEqual(r.status, 400, 'clicms without file'); assert.ok(/No file/.test(r.body.error));

    // Stored state is readable by lobby roles; shape is { stored, generatedAtIST, rows, warnings, parameters } or { stored: null }
    r = await call(port, 'POST', '/clicms/duelist/current', jrcc);
    assert.strictEqual(r.status, 200, 'jrcc current');
    assert.ok('stored' in r.body, 'stored key');
    if (r.body.stored) { assert.ok(Array.isArray(r.body.rows)); assert.ok(r.body.parameters.footplate); }

    r = await call(port, 'GET', '/api/division/staff-monitoring/ZZZZZZ', admin);
    assert.strictEqual(r.status, 404, 'unknown hrms');
  } finally {
    server.close();
    await pool.end();
  }
  console.log('duelistRoute.test.js OK');
})().catch((e) => { console.error(e); process.exit(1); });
