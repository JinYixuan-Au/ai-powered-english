# Senior High English

Angular first-lesson experience with EdgeOne and Vercel server-side Qwen learning endpoints.

## Architecture

The Starter Coach sends a student's three reflections to `POST /api/ai-feedback`. The separate conversational Learning Partner sends a bounded, in-memory message history to `POST /api/chat`.

Both deployment targets expose those same relative routes:

- EdgeOne uses `edge-functions/api/*.js` and reads `env.QWEN_API_KEY`.
- Vercel uses `api/*.js` and reads `process.env.QWEN_API_KEY`.

Both call the Singapore-region Alibaba Cloud Model Studio OpenAI-compatible endpoint using `qwen-flash`. The API key is never included in the Angular bundle.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install and sign in to the EdgeOne CLI:

   ```bash
   npm install -g edgeone
   edgeone login
   ```

3. Copy the environment template and add a Singapore-region Model Studio key:

   ```bash
   cp .env.example .env
   ```

   `.env` is ignored by Git. Never commit the real key.

4. If this checkout has not been associated with the deployed Makers project, link it once:

   ```bash
   edgeone makers link
   ```

5. Start the unified Angular and Functions development server:

   ```bash
   edgeone makers dev
   ```

   Open `http://localhost:8088`. The Starter Coach and chatbot will call the local
   `/api/ai-feedback` and `/api/chat` functions respectively.

Standard frontend-only checks remain available through `npm test` and `npm run build`, but `ng serve` alone does not emulate the EdgeOne API function.

### Vercel local development

Install and sign in to the Vercel CLI, link the project once, and start its unified development server:

```bash
npm install -g vercel
vercel login
vercel link
vercel dev
```

Configure `QWEN_API_KEY` for Vercel's Development environment or keep it in an ignored local environment file. Open the localhost address printed by `vercel dev`; both relative `/api` routes will resolve to the Vercel functions.

## EdgeOne deployment

In the EdgeOne Makers project, open **Project Settings → Environment Management** and add `QWEN_API_KEY` as a secret for Production and Preview as needed. Redeploy after saving it. EdgeOne injects the secret into the function's `context.env`; the function reads it as `env.QWEN_API_KEY`.

The existing Git deployment flow automatically deploys the Angular output and the `edge-functions` directory together.

## Vercel deployment

Add `QWEN_API_KEY` under **Project Settings → Environment Variables** for each required Vercel environment. Environment-variable changes and new `api/*.js` files apply only to a new deployment, so push the commit to the connected branch or trigger a redeployment afterward.

The Vercel Angular deployment serves the frontend while the root `api` directory supplies `/api/chat` and `/api/ai-feedback`.
