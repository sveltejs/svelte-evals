import { autocompleteMultiselect, cancel, isCancel } from '@clack/prompts';
import type { ExperimentConfig } from '@vercel/agent-eval';
import { gateway } from 'ai';
import { readFile } from 'node:fs/promises';

const available_models = await gateway.getAvailableModels();

const model_options = [{ value: 'custom', label: 'Custom' }].concat(
	available_models.models.reduce<Array<{ value: string; label: string }>>(
		(arr, model) => {
			if (model.modelType === 'language') {
				arr.push({ value: model.id, label: model.name });
			}
			return arr;
		},
		[],
	),
);

const models = await autocompleteMultiselect({
	message: 'Select model(s) to benchmark',
	options: model_options,
});

if (isCancel(models)) {
	cancel('Operation cancelled.');
	process.exit(0);
}

const base_config: ExperimentConfig = {
	agent: 'vercel-ai-gateway/opencode',
	runs: 1,
	earlyExit: true,
	model: models.map((model) => `vercel/${model}`),
	scripts: ['check:tests', 'build', 'test'],
	timeout: 1200,
	sandbox: 'vercel',
	sandboxImage:
		'vercel/sandbox/universal@sha256:c77f7436b9bc0a8b01ef7b09dbcea2de6a18a9fe2aafa89996d2da193da72cf0',
	verifier: 'separate',
	copyFiles: 'changed',
};

export function experiment(
	options: Partial<ExperimentConfig> = {},
): ExperimentConfig {
	return {
		...base_config,
		...options,
		async setup(sandbox) {
			// The harness protects this directory in the separate verifier, while
			// package.json and application-level Vite options remain editable.
			await sandbox.writeFiles({
				'__agent_eval__/verify-tests.mjs': await readFile(
					new URL('./verify-tests.mjs', import.meta.url),
					'utf8',
				),
				'__agent_eval__/vitest.integrity.config.mjs': await readFile(
					new URL('./vitest.integrity.config.mjs', import.meta.url),
					'utf8',
				),
			});
			// The harness calls setup before installing project dependencies. Install
			// them here so Playwright downloads the browser matching this project.
			for (const args of [
				['install'],
				['exec', '--', 'playwright', 'install', '--with-deps', 'chromium'],
			]) {
				const result = await sandbox.runCommand('npm', args);
				if (result.exitCode !== 0) {
					throw new Error(
						`Sandbox setup failed (npm ${args.join(' ')}):\n${result.stdout}\n${result.stderr}`,
					);
				}
			}
			await options.setup?.(sandbox);
		},
	};
}
