import { experiment } from '../shared/experiment-base.ts';
import { folder_to_object } from '../shared/utils.ts';

export default experiment({
	runs: 1,
	sandbox: 'vercel',
	editPrompt(prompt) {
		return `${prompt}\n\nUse the svelte-core-bestpractices skill if needed.`;
	},
	async setup(sandbox) {
		await sandbox.writeFiles({
			'./.opencode/opencode.json': JSON.stringify({
				plugin: ['@sveltejs/opencode'],
			}),
			'./.opencode/svelte.json': JSON.stringify({
				mcp: {
					enabled: false,
				},
			}),
		});
	},
});
