import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-auto';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })],
	test: {
		expect: { requireAssertions: true },
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: 'chromium', headless: true }]
		},
		include: ['test/**/*.{js,ts}']
	}
});
