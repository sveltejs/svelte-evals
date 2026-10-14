import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import { userEvent } from 'vitest/browser';
import Tabs from '../src/routes/+page.svelte';

const testTabs = [
	{ label: 'Tab 1', content: 'Content for tab 1' },
	{ label: 'Tab 2', content: 'Content for tab 2' },
	{ label: 'Tab 3', content: 'Content for tab 3' },
];

describe('Tabs component', () => {
	test('clicking tab shows content - render with tabs, click second tab, verify its content is shown', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		await screen.getByTestId('tab').nth(1).click();
		await expect.element(screen.getByTestId('tabpanel')).toBeInTheDocument();
		await expect
			.element(screen.getByTestId('tabpanel'))
			.toMatchTextContent('Content for tab 2');
	});

	test('first tab is active by default - render, verify first tab content is visible', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		await expect.element(screen.getByTestId('tabpanel')).toBeInTheDocument();
		await expect
			.element(screen.getByTestId('tabpanel'))
			.toMatchTextContent('Content for tab 1');
		const tabs = screen.getByTestId('tab');
		await expect.element(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
		await expect.element(tabs.nth(1)).toHaveAttribute('aria-selected', 'false');
		await expect.element(tabs.nth(2)).toHaveAttribute('aria-selected', 'false');
	});

	test('arrow right navigates to next tab - focus on first tab, press ArrowRight, verify second tab has focus', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		const tabs = screen.getByTestId('tab');
		tabs.nth(0).element().focus();
		await expect.element(tabs.nth(0)).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(tabs.nth(1)).toHaveFocus();
	});

	test('arrow left navigates to previous tab - focus on second tab, press ArrowLeft, verify first tab has focus', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		const tabs = screen.getByTestId('tab');
		await tabs.nth(1).click();
		tabs.nth(1).element().focus();
		await expect.element(tabs.nth(1)).toHaveFocus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(tabs.nth(0)).toHaveFocus();
	});

	test('proper ARIA roles - verify tablist role on container, tab role on buttons, tabpanel role on content', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		await expect
			.element(screen.getByTestId('tablist'))
			.toHaveAttribute('role', 'tablist');
		for (let i = 0; i < 3; i++) {
			await expect
				.element(screen.getByTestId('tab').nth(i))
				.toHaveAttribute('role', 'tab');
		}
		await expect
			.element(screen.getByTestId('tabpanel'))
			.toHaveAttribute('role', 'tabpanel');
	});

	test('arrow navigation wraps around - last tab ArrowRight goes to first, first tab ArrowLeft goes to last', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		const tabs = screen.getByTestId('tab');
		await tabs.nth(2).click();
		tabs.nth(2).element().focus();
		await expect.element(tabs.nth(2)).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(tabs.nth(0)).toHaveFocus();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(tabs.nth(2)).toHaveFocus();
	});

	test('tabs have proper aria-controls and tabpanel has matching id', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		const tab = screen.getByTestId('tab').nth(0);
		await expect.element(tab).toHaveAttribute('aria-controls');
		const ariaControls = tab.element().getAttribute('aria-controls');
		expect(ariaControls).toBeTruthy();
		await expect
			.element(screen.getByTestId('tabpanel'))
			.toHaveAttribute('id', ariaControls);
	});

	test('inactive tabs have tabindex -1, active tab has tabindex 0', async () => {
		const screen = await render(Tabs, { props: { tabs: testTabs } });
		const tabs = screen.getByTestId('tab');
		await expect.element(tabs.nth(0)).toHaveAttribute('tabindex', '0');
		await expect.element(tabs.nth(1)).toHaveAttribute('tabindex', '-1');
		await expect.element(tabs.nth(2)).toHaveAttribute('tabindex', '-1');
	});
});
