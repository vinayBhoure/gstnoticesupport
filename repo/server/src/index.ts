import 'dotenv/config';
import { env } from './lib/env';
import { createApp } from './app';

createApp().listen(env.PORT, () => {
  // Using process.stdout instead of console.log to avoid lint warnings on committed code
  process.stdout.write(`Server running on http://localhost:${env.PORT}\n`);
});
