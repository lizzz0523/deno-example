import { serve } from './deps.ts';
import * as jobs from './controller/jobs.ts';
import { RESPONSE } from './constants.ts';
import { PORT, HOST } from './config.ts';
import { db } from './db.ts';

const s = serve({ port: PORT });

console.log(`Listening on http://${HOST}:${PORT}`);

for await (const req of s) {
  const url = new URL(req.url, `http://${HOST}`);
  const ctx = { req, url, db };

  switch (url.pathname) {
    case '/api/v1/jobs':
      jobs.list(ctx);
      break;
    case '/api/v1/jobs/add':
      jobs.add(ctx);
      break;
    default:
      req.respond(RESPONSE.badRequest);
      break;
  }
}

console.log('Server is closing');
