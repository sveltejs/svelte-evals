import { autocompleteMultiselect, cancel, isCancel } from '@clack/prompts';
import type { ExperimentConfig } from '@vercel/agent-eval';
import { gateway } from 'ai';

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
	scripts: ['build', 'test'],
	timeout: 600,
	sandbox: 'docker',
};

export function experiment(
	options: Partial<ExperimentConfig> = {},
): ExperimentConfig {
	return {
		...base_config,
		...options,
	};
}
