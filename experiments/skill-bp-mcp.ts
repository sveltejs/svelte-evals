import { experiment } from '../shared/experiment-base.ts';

export default experiment({
	editPrompt(prompt) {
		return `${prompt}

Use the \`svelte-core-bestpractices\` skill if needed.`;
	},
	async setup(sandbox) {
		await sandbox.writeFiles({
			'./.pi/settings.json': JSON.stringify({
				packages: ['npm:@sveltejs/pi'],
			}),
		});
	},
});
