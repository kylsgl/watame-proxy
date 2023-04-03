import { formatBytes, getReferrer } from '../../src/lib/utils';

describe('utils functions', (): void => {
	test('formatBytes to catch less than less than 1 bytes', (): void => {
		expect(formatBytes(0)).toBe('0 Bytes');
	});

	test('getReferrer to return an empty string if url is invalid', (): void => {
		expect(getReferrer('http://url')).toBe('');
		expect(getReferrer('http://')).toBe('');
	});
});
