import { experiment } from '../shared/experiment-base.ts';

export default experiment({
	async setup(sandbox) {
		await sandbox.writeFiles({
			// Pi manages package skills itself: `skills: []` loads none of them.
			'./.pi/settings.json': JSON.stringify({
				packages: [{ source: 'npm:@sveltejs/pi', skills: [] }],
			}),
		});
	},
});
