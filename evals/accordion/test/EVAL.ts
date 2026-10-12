import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import Accordion from '../src/routes/+page.svelte';

const testItems = [
	{ title: 'Section 1', content: 'Content for section 1' },
	{ title: 'Section 2', content: 'Content for section 2' },
	{ title: 'Section 3', content: 'Content for section 3' },
];

describe('Accordion component', () => {
	test('clicking opens section - content becomes visible', async () => {
		const screen = await render(Accordion, { props: { items: testItems } });
		const panel = screen.getByTestId('accordion-panel');
		await expect.element(panel).not.toBeInTheDocument();
		await screen.getByTestId('accordion-button').nth(0).click();
		await expect.element(panel).toBeInTheDocument();
		await expect.element(panel).toMatchTextContent('Content for section 1');
	});

	test('clicking again closes section - content hides', async () => {
		const screen = await render(Accordion, { props: { items: testItems } });
		const button = screen.getByTestId('accordion-button').nth(0);
		const panel = screen.getByTestId('accordion-panel');
		await button.click();
		await expect.element(panel).toBeInTheDocument();
		await button.click();
		await expect.element(panel).not.toBeInTheDocument();
	});

	test('single mode closes others - opening one section closes previously open one', async () => {
		const screen = await render(Accordion, {
			props: { items: testItems, single: true },
		});
		const buttons = screen.getByTestId('accordion-button');
		const panels = screen.getByTestId('accordion-panel');
		await buttons.nth(0).click();
		await expect.poll(() => panels.elements().length).toBe(1);
		await expect.element(panels).toMatchTextContent('Content for section 1');
		await buttons.nth(1).click();
		await expect.poll(() => panels.elements().length).toBe(1);
		await expect.element(panels).toMatchTextContent('Content for section 2');
	});

	test('multiple sections can be open in default mode', async () => {
		const screen = await render(Accordion, {
			props: { items: testItems, single: false },
		});
		const buttons = screen.getByTestId('accordion-button');
		const panels = screen.getByTestId('accordion-panel');
		await buttons.nth(0).click();
		await expect.poll(() => panels.elements().length).toBe(1);
		await buttons.nth(1).click();
		await expect.poll(() => panels.elements().length).toBe(2);
		await expect
			.element(panels.nth(0))
			.toMatchTextContent('Content for section 1');
		await expect
			.element(panels.nth(1))
			.toMatchTextContent('Content for section 2');
	});

	test('ARIA attributes present - aria-expanded on buttons', async () => {
		const screen = await render(Accordion, { props: { items: testItems } });
		const buttons = screen.getByTestId('accordion-button');
		await expect.poll(() => buttons.elements().length).toBe(3);
		for (let i = 0; i < 3; i++) {
			await expect
				.element(buttons.nth(i))
				.toHaveAttribute('aria-expanded', 'false');
		}
		await buttons.nth(0).click();
		await expect
			.element(buttons.nth(0))
			.toHaveAttribute('aria-expanded', 'true');
		await expect
			.element(buttons.nth(1))
			.toHaveAttribute('aria-expanded', 'false');
		await expect
			.element(buttons.nth(2))
			.toHaveAttribute('aria-expanded', 'false');
	});
});
