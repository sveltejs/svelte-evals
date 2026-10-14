export default {
	test: {
		include: ['__agent_eval__/verify-tests.mjs'],
		environment: 'node',
		expect: { requireAssertions: true },
	},
};
