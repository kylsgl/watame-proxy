import type { FastifyRequest, FastifyReply } from 'fastify';

import type { GetProxyRequest } from '../../interfaces';

import { UndiciAgent, UndiciProxy } from '../../lib/proxy';
import {
	getReferrer,
	isValidRequestMethod,
	isValidWebUrls,
} from '../../lib/utils';

UndiciAgent.init({
	connect: {
		maxCachedSessions: 10,
		rejectUnauthorized: false,
		timeout: 5e3,
	},
	keepAliveTimeout: 15e3,
	keepAliveMaxTimeout: 15e3,
	maxResponseSize: 20971520,
	pipelining: 10,
});

async function all(
	request: FastifyRequest<GetProxyRequest>,
	reply: FastifyReply
): Promise<void> {
	const {
		method: requestMethod,
		params: { '*': url },
		body,
		query: {
			cache,
			cookie,
			method: requestMethodQuery,
			redirect,
			referrer,
			...query
		},
		raw: { headers },
	} = request;

	const method: string = requestMethodQuery ?? requestMethod;

	if (!isValidRequestMethod(UndiciProxy.allowedRequestMethods, method)) {
		await reply
			.status(405)
			.send(new Error(`Request method ${method} is not allowed`));
		return;
	}

	const encodedUrl: string = encodeURI(url);

	const referrerUrl: string =
		referrer !== undefined && referrer.length >= 0
			? referrer
			: getReferrer(encodedUrl);

	const [isValidUrl, invalidUrl] = isValidWebUrls(encodedUrl, referrerUrl);

	if (!isValidUrl) {
		await reply.status(400).send(new Error(`Invalid URL ${invalidUrl}`));
		return;
	}

	const undiciProxy: UndiciProxy = new UndiciProxy(
		{
			url: encodedUrl,
			method,
			body,
			query,
			options: {
				redirect,
				addRequestHeaders: {
					'accept-ranges': 'none',
					cookie,
					referer: referrerUrl,
				},
				removeRequestHeaders: ['host', 'keep-alive', 'range', 'upgrade'],
				addReplyHeaders: {
					'access-control-allow-origin': '*',
					'access-control-allow-methods':
						UndiciProxy.allowedRequestMethods.join(', '),
					'cache-control': cache > 0 ? `public, max-age=${cache}` : 'no-cache',
					'content-disposition': 'inline',
				},
			},
		},
		{
			allowContentTypes: /\/(avif|gif|html|jpeg|json|plain|png|webp|xml)/i,
			maxContentBytes: 20971520,
		}
	);

	await undiciProxy.proxy(headers, reply.raw);
}

export default {
	all,
};
