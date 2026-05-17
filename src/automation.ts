import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { performance } from 'node:perf_hooks';

const DEFAULT_BASE_URL = 'https://demo.spikerz.com';
const DEFAULT_DEV_USERNAME = 'me';
const DEFAULT_DEV_PASSWORD = 'SmipMe123456';
const DEFAULT_BROWSER: BrowserName = 'electron';
const CYPRESS_SPEC = 'cypress/e2e/youtube-connect.cy.ts';
const CYPRESS_RUN_LOG = 'cypress-run.log';
const MAX_CAPTURED_OUTPUT_LENGTH = 40_000;

export const allowedBrowsers = ['chrome', 'chromium', 'electron', 'edge', 'firefox'] as const;

export type BrowserName = (typeof allowedBrowsers)[number];

export interface AutomationOptions {
  baseUrl?: string;
  devUsername?: string;
  devPassword?: string;
  browser?: BrowserName;
  headed?: boolean;
}

export interface AutomationRunResult {
  success: boolean;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  command: string;
  stdout: string;
  stderr: string;
}

interface CypressEnvironment {
  CYPRESS_BASE_URL: string;
  CYPRESS_DEV_UI_USERNAME: string;
  CYPRESS_DEV_UI_PASSWORD: string;
}

export function isBrowserName(value: string): value is BrowserName {
  return allowedBrowsers.some((browser) => browser === value);
}

export function runAutomation(options: AutomationOptions = {}): Promise<AutomationRunResult> {
  const startedAtDate = new Date();
  const startedAt = startedAtDate.toISOString();
  const started = performance.now();
  const browser = options.browser ?? readBrowserFromEnv() ?? DEFAULT_BROWSER;
  const cypressEnv = buildCypressEnvironment(options);
  const args = [
    'cypress',
    'run',
    '--spec',
    CYPRESS_SPEC,
    '--browser',
    browser,
  ];

  if (options.headed ?? process.env.CYPRESS_HEADED === 'true') {
    args.push('--headed');
  }

  const logStream = createWriteStream(CYPRESS_RUN_LOG, { flags: 'w' });
  const child = spawn('npx', args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...cypressEnv,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';

  const teeOutput = (chunk: string, stream: 'stdout' | 'stderr'): void => {
    logStream.write(chunk);
    process.stdout.write(chunk);
    if (stream === 'stdout') {
      stdout = appendBounded(stdout, chunk);
    } else {
      stderr = appendBounded(stderr, chunk);
    }
  };

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk: string) => {
    teeOutput(chunk, 'stdout');
  });
  child.stderr.on('data', (chunk: string) => {
    teeOutput(chunk, 'stderr');
  });

  const shellCommand = `npx ${args.join(' ')} 2>&1 | tee ${CYPRESS_RUN_LOG}`;

  return new Promise<AutomationRunResult>((resolve, reject) => {
    child.once('error', (error) => {
      logStream.end();
      reject(error);
    });
    child.once('close', (exitCode, signal) => {
      logStream.end();
      const finishedAt = new Date().toISOString();
      const durationMs = Math.round(performance.now() - started);

      resolve({
        success: exitCode === 0,
        exitCode,
        signal,
        startedAt,
        finishedAt,
        durationMs,
        command: shellCommand,
        stdout,
        stderr,
      });
    });
  });
}

function buildCypressEnvironment(options: AutomationOptions): CypressEnvironment {
  return {
    CYPRESS_BASE_URL: options.baseUrl ?? process.env.CYPRESS_BASE_URL ?? DEFAULT_BASE_URL,
    CYPRESS_DEV_UI_USERNAME:
      options.devUsername ?? process.env.CYPRESS_DEV_UI_USERNAME ?? DEFAULT_DEV_USERNAME,
    CYPRESS_DEV_UI_PASSWORD:
      options.devPassword ?? process.env.CYPRESS_DEV_UI_PASSWORD ?? DEFAULT_DEV_PASSWORD,
  };
}

function readBrowserFromEnv(): BrowserName | undefined {
  const browser = process.env.CYPRESS_BROWSER;
  return browser !== undefined && isBrowserName(browser) ? browser : undefined;
}

function appendBounded(current: string, chunk: string): string {
  const combined = current + chunk;
  return combined.length <= MAX_CAPTURED_OUTPUT_LENGTH
    ? combined
    : combined.slice(combined.length - MAX_CAPTURED_OUTPUT_LENGTH);
}
