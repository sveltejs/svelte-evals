# svelte-evals

Evals for LLMs to learn and benchmark their Svelte skills.

This repository has three main parts:
- **Evals** live in `evals/<name>` and include a prompt, tests, and any project-specific overrides.
- **The shared project** lives in `assets/default-project/` and is copied into each sandbox during setup.
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

   Alternatively, if the project is linked with the Vercel CLI, pull a `VERCEL_OIDC_TOKEN` into
   `.env.local` (it works for both the AI Gateway and the sandbox, but expires after a few hours,
   so re-run this when authentication starts failing):
   ```bash
   npx vercel env pull .env.local
   ```

## Run an experiment with `@vercel/agent-eval`

Experiments are defined in `experiments/*.ts`. The CLI expects the `evals/` folder to be a
sibling of `experiments/`.

```bash
# Run a single experiment by name (experiments/basic.ts)
npx @vercel/agent-eval basic

# Or run by path
npx @vercel/agent-eval experiments/basic.ts

# Run a single eval of the experiment to verify the setup (API keys, model IDs, sandbox)
npx @vercel/agent-eval basic --smoke
```

Every experiment asks which model(s) to benchmark when it's loaded (see
`shared/experiment-base.ts`), so the commands above need an interactive terminal.

Results are written to `results/<experiment-name>/<model>/<timestamp>/`.

> [!WARNING]
> Since `@vercel/agent-eval` 2.x there's also a `run` subcommand (`npx @vercel/agent-eval run basic`,
> also what you get by picking an experiment from the bare `npx @vercel/agent-eval`). It only
> executes new/changed evals, but it writes to a different layout (`results/<experiment-name>/<timestamp>/`)
> and then runs a "housekeeping" step that **deletes everything else it finds in
> `results/<experiment-name>/`**, including the per-model results produced by the commands above
> (and the results of `--smoke` runs). Don't use it on an experiment whose results you want to keep.

## Visualize results with the playground

The `agent-eval` CLI exposes a `playground` command to browse the results:

```bash
npx @vercel/agent-eval playground --results-dir ./results --evals-dir ./evals --port 3000
```

Add `--watch` to live-reload while an experiment is running.

Open the URL it prints (default: http://localhost:3000) to browse results.

## Create a new eval (scripted)

Use the script in `scripts/add-eval.ts` to scaffold a new eval:

```bash
pnpm run add-eval
```

The script will:
- Create `evals/<your-eval-name>/` with a minimal `package.json`, `EVAL.ts`, and a starter `test/EVAL.ts`
- Write your prompt to `evals/<your-eval-name>/PROMPT.md`

Afterward, edit `EVAL.ts` and `test/EVAL.ts` inside the new eval to define success criteria.

During setup, files from `assets/default-project/` fill in any paths not supplied by the eval.
Add files at the same relative paths under `evals/<name>/` to override them, or add new files
there to extend the project. Overrides replace whole files, except for `package.json`: its
top-level settings override the defaults, while scripts and dependency maps merge by name.
Each eval needs at least `{"type":"module"}` because the harness validates it before setup.
Shared dependency and Vite configuration changes belong in `assets/default-project/`.

`EVAL.ts` and `PROMPT.md` are never copied from the default project during setup: hidden tests
must live in the eval itself so the harness can restore them only for validation.

### Where tests live

`@vercel/agent-eval` removes every file named `EVAL.ts` (in any folder) and `PROMPT.md` before the
LLM runs, and puts them back right before validation. **Any other file is visible to the LLM**, so
tests that must be hidden from the LLM must be in a file called `EVAL.ts`:

- `EVAL.ts` is run by the harness with its own vitest config (no Svelte plugin): use it for static
  checks on the generated source.
- `test/EVAL.ts` contains the component tests (Vitest Browser Mode + `vitest-browser-svelte`,
  using headless Chromium through Playwright). It's run by the
  `test` npm script, which experiments list in `scripts`. The script passes
  `--config vite.config.ts` explicitly because the harness writes a `vitest.config.ts` in the
  project that would otherwise take precedence.

The component test configuration includes `test/**/EVAL.ts` and
`test/**/*.{test,spec}.{js,ts}`, so visible tests can live alongside the hidden suite.
Other files under `test/` can be helpers without being treated as test suites.

Component tests use `render` from `vitest-browser-svelte`, browser locators, and awaited
`expect.element(...)` assertions. Keyboard interactions use `userEvent` from `vitest/browser`.
The renderer automatically cleans up between tests; no jsdom or Testing Library setup is needed.

The shared experiment setup fills in the default project, installs project dependencies, and runs
`playwright install --with-deps chromium` before the agent starts. Experiment-specific
setup hooks run afterward. Experiments use the Ubuntu-based `vercel/sandbox/universal`
image pinned by digest in `shared/experiment-base.ts`, with a 1200-second timeout to
allow for dependency installation, the agent, and validation.

Validation runs in a separate verifier sandbox, which also runs the setup hook.
Agents can add dependencies to `package.json` and configure application-level Vite
options. The `check:tests` script verifies the validation commands and the resolved
`test` configuration, including browser settings and discovery patterns. Changes to
that configuration or validation lifecycle hooks fail the check.

Setup installs the shared Vitest test (`shared/verify-tests.mjs`) and its configuration
into the harness-protected `__agent_eval__/` directory. Each hidden root `EVAL.ts`
imports `verify-tests.mjs` directly, so changing the `check:tests` npm script
cannot bypass the check.

Run its regression tests from the repository root with
`pnpm exec vitest run shared/verify-tests.test.mjs shared/default-project.test.ts`.

To work on an eval locally, assemble the default project and its overrides in a temporary
directory, then implement the prompt there and run the checks:

```bash
project=$(mktemp -d)
cp -R assets/default-project/. "$project/"
cp -R evals/accordion/. "$project/"
node --input-type=module -e '
import { readFile, writeFile } from "node:fs/promises";
import { merge_package_json } from "./shared/default-project.ts";
const defaults = await readFile("assets/default-project/package.json", "utf8");
const path = `${process.argv[1]}/package.json`;
await writeFile(path, merge_package_json(defaults, await readFile(path, "utf8")));
' "$project"
mkdir -p "$project/__agent_eval__"
cp shared/verify-tests.mjs shared/vitest.integrity.config.mjs "$project/__agent_eval__/"
cd "$project"
pnpm install --ignore-workspace
pnpm exec playwright install --with-deps chromium
pnpm run check:tests
pnpm test
```

Since the LLM can't see the tests, `PROMPT.md` has to specify everything they rely on: `data-testid`
attributes, prop names and defaults, text formats, roles, etc. Don't specify the things the eval is
trying to measure (e.g. which rune to use).

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
   npx @vercel/agent-eval my-experiment
   ```
