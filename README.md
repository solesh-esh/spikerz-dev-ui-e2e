# Spikerz Cypress Automation

TypeScript Cypress automation for the Spikerz Dev UI YouTube social connection flow.

## Project Structure

The Cypress tests use a Page Object Model:

- `cypress/pages/` — page objects (`dev-ui`, `social-connect`, `choose-accounts`, `social-connect-details`)
- `cypress/support/config/credentials.ts` — typed env/credential helpers
- `cypress/e2e/youtube-connect.cy.ts` — test orchestration only

## What It Tests

The Cypress spec performs the requested flow:

1. Opens `https://demo.spikerz.com` with Dev UI basic auth.
2. Navigates to `/social-connect/`.
3. Selects YouTube and clicks connect (OAuth callback URL is used directly).
4. Verifies the **Choose accounts to connect** popup and confirms account selection.
5. Verifies the **Confirm details** screen is displayed.

## Environment Variables

Copy `.env.example` into your shell environment or pass the values directly:

```bash
export CYPRESS_BASE_URL="https://demo.spikerz.com"
export CYPRESS_DEV_UI_USERNAME="me"
export CYPRESS_DEV_UI_PASSWORD="SmipMe123456"
```

## Local Usage

```bash
npm install
npm run build
npm run cypress
```

Run on browser

```bash
npx cypress run --spec cypress/e2e/youtube-connect.cy.ts --browser chrome --headed
```

Run the API locally:

```bash
npm run dev
```

Trigger the automation:

```bash
curl -X POST http://localhost:3000/run-automation \
  -H "Content-Type: application/json" \
  -d '{"browser":"chrome"}'
```

The request waits for Cypress to finish and returns the run result, including exit code, duration, stdout, and stderr.

## Docker Usage

Build the image:

```bash
docker build -t spikerz-automation .
```

Run the API container:

```bash
docker run --rm -p 3000:3000 spikerz-automation
```

Trigger the containerized automation:

```bash
curl -X POST http://localhost:3000/run-automation \
  -H "Content-Type: application/json" \
  -d '{"browser":"chrome"}'
```

You can override credentials or runtime options per request:

```bash
curl -X POST http://localhost:3000/run-automation \
  -H "Content-Type: application/json" \
  -d '{
    "baseUrl": "https://demo.spikerz.com",
    "devUsername": "me",
    "devPassword": "SmipMe123456",
    "browser": "chrome",
    "headed": false
  }'
```
