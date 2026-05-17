export interface BasicAuthCredentials {
  username: string;
  password: string;
}

const devUiEnvKeys = ['DEV_UI_USERNAME', 'DEV_UI_PASSWORD'] as const;

type DevUiEnvKey = (typeof devUiEnvKeys)[number];
type DevUiEnvValues = Record<DevUiEnvKey, unknown>;

export function readDevUiCredentials(): Cypress.Chainable<BasicAuthCredentials> {
  return cy.env<DevUiEnvValues>([...devUiEnvKeys]).then((env) => ({
    username: readRequiredEnv(env, 'DEV_UI_USERNAME'),
    password: readRequiredEnv(env, 'DEV_UI_PASSWORD'),
  }));
}

function readRequiredEnv(env: DevUiEnvValues, name: DevUiEnvKey): string {
  const value = env[name];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing Cypress environment variable: ${name}`);
  }

  return value;
}
