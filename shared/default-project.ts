import type { Sandbox } from '@vercel/agent-eval';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const default_project = fileURLToPath(new URL('../assets/default-project/', import.meta.url));
const ignored = new Set(['node_modules', '.git', '.svelte-kit', 'build', 'dist', '.DS_Store']);

export async function read_default_project(directory = default_project): Promise<Record<string, string>> {
	const files: Record<string, string> = {};

	async function read_directory(path: string) {
		for (const entry of await readdir(path, { withFileTypes: true })) {
			// Hidden tests must stay in the eval fixture, where the harness can
			// withhold them until validation. Setup runs after that filtering.
			if (ignored.has(entry.name) || /^EVAL\.tsx?$/.test(entry.name) || entry.name === 'PROMPT.md') continue;
			const file_path = join(path, entry.name);
			if (entry.isDirectory()) {
				await read_directory(file_path);
			} else if (entry.isFile()) {
				files[relative(directory, file_path).split(sep).join('/')] = await readFile(file_path, 'utf8');
			}
		}
	}

	await read_directory(directory);
	return files;
}

export function merge_package_json(default_content: string, override_content: string): string {
	const defaults = JSON.parse(default_content);
	const overrides = JSON.parse(override_content);
	const manifest = { ...defaults, ...overrides };
	for (const field of ['scripts', 'dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
		if (defaults[field] || overrides[field]) {
			manifest[field] = { ...defaults[field], ...overrides[field] };
		}
	}
	return `${JSON.stringify(manifest, null, '\t')}\n`;
}

export async function setup_default_project(sandbox: Sandbox) {
	const files = await read_default_project();
	// agent-eval requires a module manifest in each fixture before setup runs.
	// Merge its overrides so it only needs to declare eval-specific settings.
	const manifest = merge_package_json(files['package.json'], await sandbox.readFile('package.json'));
	// The harness has already uploaded the eval's overrides. Only fill in
	// missing paths, both in the agent sandbox and in the separate verifier.
	const result = await sandbox.runCommand('node', [
		'-e',
		`const { existsSync } = require('node:fs');
		console.log(JSON.stringify(JSON.parse(process.argv[1]).filter(path => !existsSync(path))));`,
		JSON.stringify(Object.keys(files)),
	]);
	if (result.exitCode !== 0) {
		throw new Error(`Could not inspect eval overrides:\n${result.stdout}\n${result.stderr}`);
	}
	const missing: string[] = JSON.parse(result.stdout);
	await sandbox.writeFiles({
		...Object.fromEntries(missing.map((path) => [path, files[path]])),
		'package.json': manifest,
	});
}
