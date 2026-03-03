import { experiment } from '../shared/experiment-base.ts';

export default experiment({
	editPrompt(prompt) {
		return `${prompt}\n\nUse the \`svelte-code-writer\` skill if needed.`;
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
