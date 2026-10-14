import { cancel, intro, isCancel, text } from '@clack/prompts';
import { cp, mkdir, writeFile } from 'node:fs/promises';

intro("Let's add a new eval!");

function check<U extends unknown | symbol>(
	prompt: U,
): asserts prompt is Exclude<U, symbol> {
	if (isCancel(prompt)) {
		cancel('Operation cancelled.');
		process.exit(0);
	}
}

const name = await text({
	message: "What's the name of your eval?",
	placeholder: 'my-awesome-eval',
});

check(name);

const prompt = await text({
	message: "What's the prompt?",
	placeholder:
		'I want to add a remote function to this SvelteKit project so that...',
});

check(prompt);

const eval_path = `./evals/${name}`;

await mkdir(`${eval_path}/test`, { recursive: true });
await writeFile(`${eval_path}/package.json`, `${JSON.stringify({ type: 'module' }, null, '\t')}\n`);
await cp('./assets/default-project/test/EVAL.ts', `${eval_path}/test/EVAL.ts`);
await writeFile(`${eval_path}/PROMPT.md`, prompt);
await writeFile(
	`${eval_path}/EVAL.ts`,
	`import { expect, it } from 'vitest';
import './__agent_eval__/verify-tests.mjs';

it('validate', async () => {
	// nothing to check here
	expect(true).toBe(true);
});
`,
);
