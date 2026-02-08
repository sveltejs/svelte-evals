# svelte-evals

Evals for LLMs to learn and benchmark their Svelte skills.

This repository is split into two main concepts:
- **Evals** live in `evals/<name>` and include a prompt plus a runnable project and tests.
- **Experiments** live in `experiments/<name>.ts` and configure how evals are executed with
  `@vercel/agent-eval`.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in `AI_GATEWAY_API_KEY` plus either `VERCEL_TOKEN` or `VERCEL_OIDC_TOKEN`.

## Run an experiment with `@vercel/agent-eval`

Experiments are defined in `experiments/*.ts`. The CLI expects the `evals/` folder to be a
sibling of `experiments/`.

```bash
# Run a single experiment by name (experiments/basic.ts)
npx agent-eval basic

# Or run by path
npx agent-eval experiments/basic.ts

# Run every experiment in the repository
npx agent-eval
```

Results are written to `results/<experiment-name>/<timestamp>/`.

## Visualize results with `@vercel/agent-eval-playground`

The `agent-eval` CLI exposes a `playground` command that launches
`@vercel/agent-eval-playground` under the hood:

```bash
npx agent-eval playground --results-dir ./results --evals-dir ./evals --port 3000
```

Open the URL it prints (default: http://localhost:3000) to browse results.

## Create a new eval (scripted)

Use the script in `scripts/add-eval.ts` to scaffold a new eval:

```bash
pnpm run add-eval
```

The script will:
- Create `evals/<your-eval-name>/` from `assets/default-project/`
- Write your prompt to `evals/<your-eval-name>/PROMPT.md`

Afterward, edit `EVAL.ts` and any tests inside the new eval to define success criteria.

## Create a new experiment

1. Add a new file in `experiments/` (for example, `experiments/my-experiment.ts`).
2. Export an `ExperimentConfig` using the shared helper:

```ts
import { experiment } from '../shared/experiment-base.ts';

export default experiment({
  evals: ['my-eval'],
  runs: 2,
  editPrompt(prompt) {
    return `${prompt}\n\nExtra instructions...`;
  },
});
```

3. Run it with:
   ```bash
   npx agent-eval my-experiment
   ```
