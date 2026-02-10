import fs from 'node:fs/promises';
import path from 'node:path';

export async function folder_to_object(
	file_path: string,
	base_path = '',
): Promise<Record<string, string>> {
	const files = fs.glob(file_path + '/**/*', { withFileTypes: true });
	const result: Record<string, string> = {};
	for await (let file of files) {
		if (file.isFile()) {
			const full_path = path.join(file.parentPath, file.name);
			const relative = path.join(
				base_path,
				path.relative(file_path, full_path),
			);
			result[relative] = await fs.readFile(full_path, 'utf-8');
		}
	}
	return result;
}
