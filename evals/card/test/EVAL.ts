import { render } from 'vitest-browser-svelte';
import { describe, it, expect } from 'vitest';
import Card from '../src/routes/+page.svelte';
import { createRawSnippet } from 'svelte';

function createTextSnippet(text: string) {
	return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

describe('Card with Slots', () => {
	it('renders body content', async () => {
		const screen = await render(Card, {
			props: { children: createTextSnippet('Body content') },
		});
		await expect.element(screen.getByTestId('card-body')).toBeInTheDocument();
		await expect
			.element(screen.getByText('Body content', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders header when provided', async () => {
		const screen = await render(Card, {
			props: {
				children: createTextSnippet('Body content'),
				header: createTextSnippet('Header content'),
			},
		});
		await expect.element(screen.getByTestId('card-header')).toBeInTheDocument();
		await expect
			.element(screen.getByText('Header content', { exact: true }))
			.toBeInTheDocument();
	});

	it('renders footer when provided', async () => {
		const screen = await render(Card, {
			props: {
				children: createTextSnippet('Body content'),
				footer: createTextSnippet('Footer content'),
			},
		});
		await expect.element(screen.getByTestId('card-footer')).toBeInTheDocument();
		await expect
			.element(screen.getByText('Footer content', { exact: true }))
			.toBeInTheDocument();
	});

	it('header not rendered when empty', async () => {
		const screen = await render(Card, {
			props: { children: createTextSnippet('Body content') },
		});
		await expect
			.element(screen.getByTestId('card-header'))
			.not.toBeInTheDocument();
	});

	it('footer not rendered when empty', async () => {
		const screen = await render(Card, {
			props: { children: createTextSnippet('Body content') },
		});
		await expect
			.element(screen.getByTestId('card-footer'))
			.not.toBeInTheDocument();
	});

	it('applies variant class - outlined', async () => {
		const screen = await render(Card, {
			props: {
				children: createTextSnippet('Body content'),
				variant: 'outlined',
			},
		});
		await expect.element(screen.getByTestId('card')).toHaveClass('outlined');
	});

	it('applies elevated variant (default)', async () => {
		const screen = await render(Card, {
			props: { children: createTextSnippet('Body content') },
		});
		await expect.element(screen.getByTestId('card')).toHaveClass('elevated');
	});
});
