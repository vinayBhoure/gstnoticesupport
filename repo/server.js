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

require('dotenv').config({ path: require('path').join(__dirname, 'server', '.env') });

const path = require('path');
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
