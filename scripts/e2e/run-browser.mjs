import { spawn } from 'node:child_process';
import process from 'node:process';

const port = Number(process.env.E2E_PORT || 3100);
const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${port}`;
const startupTimeoutMs = 60_000;
const pollMs = 500;

let server;
let stopping = false;

function stopServer() {
  if (!server || stopping) return;
  stopping = true;
  try {
    if (process.platform === 'win32') server.kill('SIGTERM');
    else process.kill(-server.pid, 'SIGTERM');
  } catch {
    try { server.kill('SIGTERM'); } catch {}
  }
}

async function waitForServer() {
  const started = Date.now();
  let lastError = 'not attempted';
  while (Date.now() - started < startupTimeoutMs) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status >= 200 && response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error(`E2E server did not become ready within ${startupTimeoutMs / 1000}s (${lastError})`);
}

async function main() {
  console.log(`[E2E] Starting Next.js on ${baseUrl}...`);
  server = spawn('pnpm', ['start', '-p', String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), E2E_BASE_URL: baseUrl },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: process.platform !== 'win32',
  });

  server.stdout.on('data', (chunk) => process.stdout.write(`[next] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[next] ${chunk}`));
  server.on('exit', (code, signal) => {
    if (!stopping && code !== 0) {
      console.error(`[E2E] Next.js exited unexpectedly (code=${code}, signal=${signal ?? 'none'})`);
    }
  });

  await waitForServer();
  console.log(`[E2E] Server ready: ${baseUrl}`);
  console.log('[E2E] Starting Playwright...');

  const playwright = spawn('pnpm', ['exec', 'playwright', 'test'], {
    cwd: process.cwd(),
    env: { ...process.env, E2E_BASE_URL: baseUrl },
    stdio: 'inherit',
  });

  const exitCode = await new Promise((resolve, reject) => {
    playwright.on('error', reject);
    playwright.on('exit', (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });

  process.exitCode = exitCode;
}

process.on('SIGINT', () => {
  stopServer();
  process.exitCode = 130;
});
process.on('SIGTERM', () => {
  stopServer();
  process.exitCode = 143;
});

try {
  await main();
} catch (error) {
  console.error(`[E2E] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  stopServer();
}
