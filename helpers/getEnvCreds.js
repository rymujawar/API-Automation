import * as fs from 'node:fs';
import path from 'node:path';

/**
 * Resolve credentials for tests.
 * Priority:
 * 1. `process.env.USERNAME` and `process.env.PASSWORD`
 * 2. payload/generateToken.<env>.json where env is from process.env.ENV or BASE_URL
 * 3. payload/generateToken.json
 */
export function getEnvCreds() {
  const user = process.env.USERNAME || process.env.USER;
  const pass = process.env.PASSWORD || process.env.PASS;
  if (user && pass) return { username: user, password: pass };

  const envRaw = (process.env.ENV || process.env.TEST_ENV || process.env.NODE_ENV || '') .toLowerCase();
  let envName = '';
  if (envRaw) envName = envRaw;
  else if (process.env.BASE_URL) {
    const url = process.env.BASE_URL.toLowerCase();
    if (url.includes('qa')) envName = 'qa';
    else if (url.includes('uat')) envName = 'uat';
  }
  if (!envName) envName = 'qa';

  const candidates = [
    path.resolve(process.cwd(), `payload/generateToken.${envName}.json`),
    path.resolve(process.cwd(), 'payload/generateToken.json')
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed.username && parsed.password) return { username: parsed.username, password: parsed.password };
        return parsed;
      } catch (err) {
        // continue to next candidate
      }
    }
  }

  throw new Error('Credentials not found. Set USERNAME/PASSWORD env vars or add payload/generateToken.json (or payload/generateToken.<env>.json)');
}
