import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
		},
		environment: 'node',
		globals: true,
		include: ['./**/*.test.ts'],
		reporters: 'verbose',
		testTimeout: 2e4,
		watch: false,
	},
});
