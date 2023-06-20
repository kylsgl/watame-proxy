import type { FastifyRequest, FastifyReply } from 'fastify';

import type { GetProxyRequest } from '../../interfaces';

import { HttpAgent, HttpProxy } from '../../lib/proxy';
import { getReferrer, isValidWebUrls } from '../../lib/utils';

HttpAgent.init({
	rejectUnauthorized: false,
	timeout: 15e3,
});

async function get(
	request: FastifyRequest<GetProxyRequest>,
	reply: FastifyReply
): Promise<void> {
	const {
		params: { '*': url },
		query: { cache, referrer },
		raw: { headers },
	} = request;

	const referrerUrl: string =
		referrer !== undefined && referrer.length >= 0
			? referrer
			: getReferrer(url);

	const [isValid, invalidUrl] = isValidWebUrls(url, referrerUrl);
	if (!isValid) {
		await reply.status(400).send(new Error(`Invalid URL ${invalidUrl}`));
		return;
	}

	const httpProxy: HttpProxy = new HttpProxy(
		{
			url,
			method: 'GET',
			options: {
				addRequestHeaders: {
					'accept-ranges': 'none',
					referer: referrerUrl,
				},
				removeRequestHeaders: ['range'],
				addReplyHeaders: {
					'cache-control': cache > 0 ? `public, max-age=${cache}` : 'no-cache',
					'content-disposition': 'inline',
				},
			},
		},
		{
			maxContentBytes: 105e4,
			requestTimeout: 5e3,
		}
	);

	const { headers: replyHeaders, buffer } = await httpProxy.proxy(headers);

	await reply.headers(replyHeaders).status(200).send(buffer);
}

export default {
	get,
};
