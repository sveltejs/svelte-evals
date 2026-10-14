import { readFile } from 'node:fs/promises';
import { expect, test, vi } from 'vitest';
import { verify_package, verify_vite_config } from './verify-tests.mjs';

// Exercise the assertion helpers without registering the eval-specific test
// against this repository's package.json and Vite configuration.
vi.mock('vitest', async (import_original) => ({
	...await import_original(),
	it: vi.fn(),
}));

const manifest = JSON.parse(await readFile(new URL('../assets/default-project/package.json', import.meta.url), 'utf8'));
const provider = {
	name: 'playwright',
	options: {},
	providerFactory() {},
};

function vite_config() {
	return {
		test: {
			expect: { requireAssertions: true },
			browser: {
				enabled: true,
				provider: { ...provider },
				instances: [{ browser: 'chromium', headless: true }],
			},
			include: ['test/**/EVAL.ts', 'test/**/*.{test,spec}.{js,ts}'],
		},
	};
}

test('allows adding dependencies and unrelated npm scripts', () => {
	const updated = structuredClone(manifest);
	updated.dependencies = { 'some-package': '^1.0.0' };
	updated.scripts.format = 'prettier --write .';
	expect(() => verify_package(updated)).not.toThrow();
});

for (const script of ['check:tests', 'test', 'build']) {
	test(`rejects replacing the ${script} script with a no-op`, () => {
		const updated = structuredClone(manifest);
		updated.scripts[script] = 'node -e "process.exit(0)"';
		expect(() => verify_package(updated)).toThrow(/must remain/);
	});
}

test('rejects changing test filtering through CLI flags', () => {
	const updated = structuredClone(manifest);
	updated.scripts.test += ' --exclude test/EVAL.ts --passWithNoTests';
	expect(() => verify_package(updated)).toThrow(/scripts.test must remain/);
});

test('rejects lifecycle hooks that could rewrite config after verification', () => {
	const updated = structuredClone(manifest);
	updated.scripts.pretest = 'node change-config.js';
	expect(() => verify_package(updated)).toThrow(/pretest hook/);
});

test('allows application plugins, aliases and build configuration', () => {
	const config = vite_config();
	config.plugins = [{ name: 'application-plugin' }];
	config.resolve = { alias: { '@utils': '/src/utils' } };
	config.build = { minify: false };
	expect(() => verify_vite_config(config, provider)).not.toThrow();
});

const mutations = {
	'discovery pattern': (config) => { config.test.include = ['test/visible.test.ts']; },
	'hidden test exclusion': (config) => { config.test.exclude = ['**/EVAL.ts']; },
	'disabled browser': (config) => { config.test.browser.enabled = false; },
	'browser selection': (config) => { config.test.browser.instances = [{ browser: 'firefox' }]; },
	'assertion requirement': (config) => { config.test.expect.requireAssertions = false; },
	'empty test passes': (config) => { config.test.passWithNoTests = true; },
	'project override': (config) => { config.test.projects = ['other.config.ts']; },
	'provider implementation': (config) => { config.test.browser.provider.providerFactory = () => null; },
};

for (const [name, mutate] of Object.entries(mutations)) {
	test(`rejects changing ${name}`, () => {
		const config = vite_config();
		mutate(config);
		expect(() => verify_vite_config(config, provider)).toThrow(/test configuration must remain unchanged/);
	});
}
