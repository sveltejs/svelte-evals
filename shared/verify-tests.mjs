import { expect, it } from 'vitest';
import { readFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const required_scripts = {
	'check:tests': 'vitest run --config __agent_eval__/vitest.integrity.config.mjs',
	build: 'vite build',
	test: 'vitest run --config vite.config.ts',
};

export function verify_package(manifest) {
	for (const [name, command] of Object.entries(required_scripts)) {
		expect(
			manifest.scripts?.[name],
			`package.json scripts.${name} must remain ${JSON.stringify(command)}`,
		).toBe(command);
		for (const prefix of ['pre', 'post']) {
			expect(
				manifest.scripts?.[`${prefix}${name}`],
				`package.json must not add a ${prefix}${name} hook around validation`,
			).toBeUndefined();
		}
	}
}

function normalize_config(config) {
	// Provider factories contain functions. Compare their source as well as their
	// options rather than silently dropping them during JSON serialization.
	return JSON.parse(JSON.stringify(config, (_key, value) =>
		typeof value === 'function' ? value.toString() : value,
	));
}

export function verify_vite_config(config, provider) {
	expect(
		normalize_config(config.test),
		'The Vitest test configuration must remain unchanged; configure the application outside the test section',
	).toStrictEqual(normalize_config({
		expect: { requireAssertions: true },
		browser: {
			enabled: true,
			provider,
			instances: [{ browser: 'chromium', headless: true }],
		},
		include: ['test/**/EVAL.ts', 'test/**/*.{test,spec}.{js,ts}'],
	}));
}

export async function verify_tests(project_root = process.cwd()) {
	const manifest_path = resolve(project_root, 'package.json');
	verify_package(JSON.parse(await readFile(manifest_path, 'utf8')));

	// Resolve the same installed packages that the project's test command uses.
	const require = createRequire(manifest_path);
	const { resolveConfig } = await import(pathToFileURL(require.resolve('vite')).href);
	const { playwright } = await import(pathToFileURL(require.resolve('@vitest/browser-playwright')).href);
	const config = await resolveConfig({
		root: project_root,
		configFile: resolve(project_root, 'vite.config.ts'),
		mode: 'test',
	}, 'serve', 'test');
	expect(
		await realpath(config.root),
		'Vite must keep the eval project as its root',
	).toBe(await realpath(project_root));
	// Resolve plugins too: a config hook must not change test discovery either.
	verify_vite_config(config, playwright());
}

it('test configuration is intact', async () => {
	await verify_tests();
});
