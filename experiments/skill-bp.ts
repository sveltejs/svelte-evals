import { experiment } from '../shared/experiment-base.ts';

export default experiment({
	runs: 1,
	sandbox: 'vercel',
	editPrompt(prompt) {
		return `${prompt}\n\nUse the svelte-core-bestpractices skill if needed.`;
	},
	async setup(sandbox) {
		await sandbox.writeFiles({
			'./.pi/settings.json': JSON.stringify({
				packages: ['npm:@sveltejs/pi'],
			}),
			'./.pi/svelte.json': JSON.stringify({
				mcp: {
					enabled: false,
				},
			}),
		});
	},
});
