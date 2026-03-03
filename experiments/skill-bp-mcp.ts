import { experiment } from '../shared/experiment-base.ts';
import { folder_to_object } from '../shared/utils.ts';

export default experiment({
	editPrompt(prompt) {
		return `${prompt}

Use the \`svelte-core-bestpractices\` skill if needed.`;
	},
	async setup(sandbox) {
		await sandbox.writeFiles({
			'./.opencode/opencode.json': JSON.stringify({
				plugin: ['@sveltejs/opencode'],
			}),
		});
	},
});
