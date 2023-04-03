import type { ProxyReply } from '../../../src/lib/proxy';
import { HttpProxy } from '../../../src/lib/proxy';
import { resources } from '../../helper';

describe('Modify request and reply headers', (): void => {
	const {
		validUrls: { HTML },

		replyHeaders,
	} = resources;

	it('should throw an error when used with unsupported protocol', (): void => {
		const httpProxy: HttpProxy = new HttpProxy(
			{
				url: HTML.replace('https', 'error'),
				method: 'GET',
			},
			{
				useGlobalAgent: false,
			}
		);

		void expect(
			async (): Promise<ProxyReply> => httpProxy.proxy(replyHeaders)
		).rejects.toThrow('Invalid protocol: error');
	});
});
