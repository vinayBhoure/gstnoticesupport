// Unified entry point for single-domain deployment (Hostinger shared hosting).
//
// Hostinger's shared-hosting Node.js app exposes exactly one process on one
// platform-assigned port for the whole domain — there is no way to run the
// Next.js frontend and the Express backend as two separately reachable
// services. This file boots both inside one process and dispatches by path:
// requests under /api/v1/* and /health go to Express, everything else goes
// to Next.js. Because both are served from the same origin, the auth cookie
// (server/src/utils/cookies.ts) is first-party to the browser and Next's
// Server Components (client/src/lib/auth/session.ts) can read it — this is
// what fixes the login redirect loop that a split-domain deployment caused.
//
// This file is NOT run through the Next.js compiler (see Next's custom-server
// docs) and is not built by tsc — it runs as plain CommonJS via `node
// server.js`, requiring the already-built server/dist/app.js and client/'s
// installed `next` package directly.
//
// Self-build on first boot: some Hostinger deployment presets (the generic
// Node.js "Entry file" flow) expose no separate build-command field — they
// only run `npm install` then execute this file directly. This app needs a
// build step first (tsc for server/dist, next build for client/.next, prisma
// generate), so if those artifacts are missing we run `npm run build`
// ourselves before requiring anything that depends on them. This is a no-op
// (near-instant fs.existsSync checks) on every restart after the first.

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const serverDistEntry = path.join(__dirname, 'server', 'dist', 'app.js');
const clientBuildId = path.join(__dirname, 'client', '.next', 'BUILD_ID');

if (!fs.existsSync(serverDistEntry) || !fs.existsSync(clientBuildId)) {
  process.stdout.write('Build artifacts missing — running `npm run build` before starting...\n');
  execSync('npm run build', { cwd: __dirname, stdio: 'inherit' });
  process.stdout.write('Build complete.\n');
}

require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

const http = require('http');
const next = require('next');
const { createApp } = require('./server/dist/app');

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';

const nextApp = next({ dev, dir: path.join(__dirname, 'client') });
const handleNextRequest = nextApp.getRequestHandler();
const apiApp = createApp();

function isApiRequest(url) {
  return url.startsWith('/api/v1/') || url === '/health' || url.startsWith('/health/');
}

nextApp.prepare().then(() => {
  const server = http.createServer((req, res) => {
    if (isApiRequest(req.url || '')) {
      apiApp(req, res);
    } else {
      handleNextRequest(req, res);
    }
  });

  server.listen(port, () => {
    process.stdout.write(`Unified server listening on port ${port} (${dev ? 'development' : 'production'})\n`);
  });
});
