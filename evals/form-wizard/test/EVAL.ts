import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import FormWizard from '../src/routes/+page.svelte';

const testSteps = [
	{
		title: 'Step 1: Personal Info',
		fields: [
			{ name: 'name', label: 'Full Name', required: true },
			{ name: 'email', label: 'Email', required: true },
		],
	},
	{
		title: 'Step 2: Address',
		fields: [
			{ name: 'street', label: 'Street Address', required: true },
			{ name: 'city', label: 'City', required: false },
		],
	},
	{
		title: 'Step 3: Review',
		fields: [{ name: 'notes', label: 'Additional Notes', required: false }],
	},
];

describe('FormWizard component', () => {
	test('shows first step initially - verify Step 1 title is shown', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await expect
			.element(screen.getByTestId('step-title'))
			.toMatchTextContent('Step 1: Personal Info');
		await expect.element(screen.getByTestId('field-name')).toBeInTheDocument();
		await expect.element(screen.getByTestId('field-email')).toBeInTheDocument();
	});

	test('next advances step - fill required fields, click next, verify step 2 shown', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await screen.getByTestId('input-name').fill('John Doe');
		await screen.getByTestId('input-email').fill('john@example.com');
		await screen.getByTestId('next-button').click();
		await expect
			.element(screen.getByTestId('step-title'))
			.toMatchTextContent('Step 2: Address');
		await expect
			.element(screen.getByTestId('field-street'))
			.toBeInTheDocument();
	});

	test('validation prevents advance - click next without filling required fields, verify error and still on step 1', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await screen.getByTestId('next-button').click();
		await expect
			.element(screen.getByTestId('step-title'))
			.toMatchTextContent('Step 1: Personal Info');
		await expect.element(screen.getByTestId('error-name')).toBeInTheDocument();
	});

	test('previous goes back - go to step 2, click previous, verify back on step 1', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await screen.getByTestId('input-name').fill('John Doe');
		await screen.getByTestId('input-email').fill('john@example.com');
		await screen.getByTestId('next-button').click();
		await expect
			.element(screen.getByTestId('step-title'))
			.toMatchTextContent('Step 2: Address');
		await screen.getByTestId('prev-button').click();
		await expect
			.element(screen.getByTestId('step-title'))
			.toMatchTextContent('Step 1: Personal Info');
	});

	test('previous disabled on first step - verify previous button is disabled on step 1', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await expect.element(screen.getByTestId('prev-button')).toBeDisabled();
	});

	test('submit shown on last step - navigate to last step, verify submit button instead of next', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await screen.getByTestId('input-name').fill('John Doe');
		await screen.getByTestId('input-email').fill('john@example.com');
		await screen.getByTestId('next-button').click();
		await screen.getByTestId('input-street').fill('123 Main St');
		await screen.getByTestId('next-button').click();
		await expect
			.element(screen.getByTestId('step-title'))
			.toMatchTextContent('Step 3: Review');
		await expect
			.element(screen.getByTestId('next-button'))
			.not.toBeInTheDocument();
		await expect
			.element(screen.getByTestId('submit-button'))
			.toBeInTheDocument();
	});

	test('step indicator shows current - verify visual indicator of current step', async () => {
		const screen = await render(FormWizard, { props: { steps: testSteps } });
		await expect
			.element(screen.getByTestId('step-indicator'))
			.toMatchTextContent(/1.*3/);
	});
});
