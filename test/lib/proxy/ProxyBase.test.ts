import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
import type { IncomingHttpHeaders as UndiciIncomingHttpHeaders } from 'undici/types/header';

import ProxyBase from '../../../src/lib/proxy/common/ProxyBase';
import type { ProxyTarget } from '../../../src/lib/proxy';
import { resources } from '../../helper';

describe('Modify request and reply headers', (): void => {
	const {
		validUrls: { HTML },
		requestHeaders,
		replyHeaders,
	} = resources;

	const target: ProxyTarget = {
		url: HTML,
		method: 'GET',
		options: {
			addRequestHeaders: {
				age: '5678',
				referer: 'asdfgh',
			},
			removeRequestHeaders: ['dnt'],
			addReplyHeaders: {
				'cache-control': 'public, max-age=123',
				'content-disposition': 'inline',
			},
		},
	};

	it('should return modified request headers', (): void => {
		const modifiedRequestHeaders: IncomingHttpHeaders &
			UndiciIncomingHttpHeaders = new ProxyBase(target).modifyRequestHeaders(
			requestHeaders
		);

		expect(modifiedRequestHeaders).not.toHaveProperty('connection');

		expect(modifiedRequestHeaders).toMatchObject({
			age: target.options?.addRequestHeaders?.age,
			referer: target.options?.addRequestHeaders?.referer,
		});

		target.options?.removeRequestHeaders?.forEach(
			(header: keyof IncomingHttpHeaders): void => {
				expect(modifiedRequestHeaders).not.toHaveProperty(header as string);
			}
		);
	});

	it('should return modified reply headers', (): void => {
		const modifiedReplyHeaders: IncomingHttpHeaders = new ProxyBase(
			target
		).modifyReplyHeaders(replyHeaders);

		expect(modifiedReplyHeaders).not.toHaveProperty('connection');

		expect(modifiedReplyHeaders).toMatchObject({
			'cache-control': 'public, max-age=123',
			'content-disposition': 'inline',
		});
	});

	it('should accept and use custom modifiers', (): void => {
		const proxyBase: ProxyBase = new ProxyBase(target, {
			modifyRequestHeaders(
				headers: IncomingHttpHeaders &
					OutgoingHttpHeaders &
					UndiciIncomingHttpHeaders
			): IncomingHttpHeaders & UndiciIncomingHttpHeaders {
				const newRequestHeaders = headers;
				delete newRequestHeaders.host;
				return newRequestHeaders;
			},
			modifyReplyHeaders(headers: IncomingHttpHeaders): IncomingHttpHeaders {
				const newReplyHeaders = headers;
				delete newReplyHeaders['referrer-policy'];
				return newReplyHeaders;
			},
		});

		const modifiedRequestHeaders: IncomingHttpHeaders & OutgoingHttpHeaders =
			proxyBase.modifyRequestHeaders(requestHeaders);

		const modifiedReplyHeaders: IncomingHttpHeaders =
			proxyBase.modifyReplyHeaders(replyHeaders);

		expect(modifiedRequestHeaders).not.toHaveProperty('host');
		expect(modifiedReplyHeaders).not.toHaveProperty('referrer-policy');
	});

	it('should throw an error if content-length exceeds the specified limit', (): void => {
		const proxyBase: ProxyBase = new ProxyBase(target, {
			allowContentTypes: /text\/html/,
			maxContentBytes: 2,
		});

		expect((): void => {
			proxyBase.replyChecks(
				{ 'content-type': 'text/html', 'content-length': '3' },
				200
			);
		}).toThrowError();
	});

	it('should throw an error if type is not allowed', (): void => {
		const proxyBase: ProxyBase = new ProxyBase(target, {
			allowContentTypes: /text\/html/,
			maxContentBytes: 2,
		});

		expect((): void => {
			proxyBase.replyChecks(
				{ 'content-type': 'image/jpeg', 'content-length': '1' },
				200
			);
		}).toThrowError();
	});

	it('should throw an error if status code is undefined', (): void => {
		const proxyBase: ProxyBase = new ProxyBase(target, {
			allowContentTypes: /text\/html/,
			maxContentBytes: 2,
		});

		expect((): void => {
			proxyBase.replyChecks(
				{ 'content-type': 'text/html', 'content-length': '2' },
				undefined
			);
		}).toThrowError();
	});
});
