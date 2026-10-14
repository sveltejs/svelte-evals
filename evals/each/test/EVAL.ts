import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import CharacterList from '../src/routes/+page.svelte';

describe('CharacterList component', () => {
	test('renders all characters initially', async () => {
		const screen = await render(CharacterList);
		const characters = screen.getByTestId('character');
		await expect.poll(() => characters.elements().length).toBe(3);
		await expect.element(characters.nth(0)).toMatchTextContent('Jerry');
		await expect.element(characters.nth(1)).toMatchTextContent('Elaine');
		await expect.element(characters.nth(2)).toMatchTextContent('Kramer');
	});

	test('adds George to the list when button clicked', async () => {
		const screen = await render(CharacterList);
		const characters = screen.getByTestId('character');
		await expect.poll(() => characters.elements().length).toBe(3);
		await screen.getByTestId('add-george-button').click();
		await expect.poll(() => characters.elements().length).toBe(4);
		await expect.element(characters.nth(3)).toMatchTextContent('George');
		await expect.element(characters.nth(0)).toMatchTextContent('Jerry');
		await expect.element(characters.nth(1)).toMatchTextContent('Elaine');
		await expect.element(characters.nth(2)).toMatchTextContent('Kramer');
	});
});
