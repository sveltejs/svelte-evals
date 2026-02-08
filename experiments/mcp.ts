import { experiment } from '../shared/experiment-base.ts';

export default experiment({
	async setup(sandbox) {
		await sandbox.writeFiles({
			'./.opencode/opencode.json': JSON.stringify({
				plugin: ['@sveltejs/opencode'],
			}),
			'./.opencode/svelte.json': JSON.stringify({
				skills: {
					enabled: false,
				},
			}),
		});
	},
});
