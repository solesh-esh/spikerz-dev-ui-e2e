import express, { type Request, type Response } from 'express';
import {
  type AutomationOptions,
  type AutomationRunResult,
  isBrowserName,
  runAutomation,
} from './automation.js';

const DEFAULT_PORT = 3000;

interface ApiErrorResponse {
  status: 'error';
  message: string;
}

interface HealthResponse {
  status: 'ok';
}

interface RunAutomationResponse {
  status: 'passed' | 'failed';
  result: AutomationRunResult;
}

interface RunState {
  running: boolean;
}

const app = express();
const runState: RunState = { running: false };

app.use(express.json({ limit: '16kb' }));

app.get('/health', (_request: Request, response: Response<HealthResponse>) => {
  response.json({ status: 'ok' });
});

app.post(
  '/run-automation',
  async (
    request: Request<Record<string, never>, RunAutomationResponse | ApiErrorResponse, unknown>,
    response: Response<RunAutomationResponse | ApiErrorResponse>,
  ) => {
    if (runState.running) {
      response.status(409).json({
        status: 'error',
        message: 'Automation is already running. Wait for the current run to finish.',
      });
      return;
    }

    const parsed = parseAutomationOptions(request.body);
    if (!parsed.ok) {
      response.status(400).json({ status: 'error', message: parsed.message });
      return;
    }

    runState.running = true;

    try {
      const result = await runAutomation(parsed.value);
      response.status(result.success ? 200 : 500).json({
        status: result.success ? 'passed' : 'failed',
        result,
      });
    } catch (error) {
      response.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown automation error',
      });
    } finally {
      runState.running = false;
    }
  },
);

const port = readPort(process.env.PORT);
app.listen(port, () => {
  console.log(`Automation API listening on port ${port}`);
});

type ParseResult =
  | { ok: true; value: AutomationOptions }
  | { ok: false; message: string };

function parseAutomationOptions(value: unknown): ParseResult {
  if (value === undefined || value === null) {
    return { ok: true, value: {} };
  }

  if (!isRecord(value)) {
    return { ok: false, message: 'Request body must be a JSON object.' };
  }

  const options: AutomationOptions = {};
  const stringFields = ['baseUrl', 'devUsername', 'devPassword'] as const;

  for (const field of stringFields) {
    const fieldValue = value[field];
    if (fieldValue !== undefined) {
      if (typeof fieldValue !== 'string' || fieldValue.trim().length === 0) {
        return { ok: false, message: `${field} must be a non-empty string.` };
      }
      options[field] = fieldValue;
    }
  }

  if (value.browser !== undefined) {
    if (typeof value.browser !== 'string' || !isBrowserName(value.browser)) {
      return { ok: false, message: 'browser must be one of chrome, chromium, electron, edge, firefox.' };
    }
    options.browser = value.browser;
  }

  if (value.headed !== undefined) {
    if (typeof value.headed !== 'boolean') {
      return { ok: false, message: 'headed must be a boolean.' };
    }
    options.headed = value.headed;
  }

  return { ok: true, value: options };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPort(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const port = Number.parseInt(value, 10);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}
