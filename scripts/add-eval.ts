import { cancel, intro, isCancel, text } from '@clack/prompts';
import { cp, writeFile } from 'node:fs/promises';

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

await cp('./assets/default-project', eval_path, { recursive: true });
await writeFile(`${eval_path}/PROMPT.md`, prompt);
await writeFile(
	`${eval_path}/EVAL.ts`,
	`import { expect, it } from 'vitest';

it('validate', async () => {
	// nothing to check here
	expect(true).toBe(true);
});
`,
);
