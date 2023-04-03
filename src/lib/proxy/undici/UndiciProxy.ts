import {
	STATUS_CODES,
	type IncomingHttpHeaders,
	type ServerResponse,
} from 'node:http';
import type StreamFactory from 'undici/types/dispatcher';

import type { RequestMethod } from '../common/interfaces';
import type { ErrorWithStatusCode } from '../../../interfaces';

import ProxyBase from '../common/ProxyBase';
import UndiciAgent from './UndiciAgent';

export default class UndiciProxy extends ProxyBase {
	async proxy(
		requestHeaders: IncomingHttpHeaders,
		reply: ServerResponse
	): Promise<void> {
		const {
			target: { method, options, body, query },
			url: { href, origin },
		} = this;

		const opts: StreamFactory.RequestOptions = {
			body,
			bodyTimeout: 1e4,
			headers: this.modifyRequestHeaders(requestHeaders),
			headersTimeout: 1e4,
			maxRedirections: options?.redirect === true ? 10 : 0,
			method,
			opaque: reply,
			origin,
			path: href,
			query,
		};

		const factory = ({
			statusCode,
			headers,
			opaque,
		}: StreamFactory.StreamFactoryData): ServerResponse => {
			this.replyChecks(headers, statusCode);
			(opaque as ServerResponse).writeHead(
				statusCode,
				this.modifyReplyHeaders(headers)
			);

			return opaque as ServerResponse;
		};

		const errorHandler = (error: ErrorWithStatusCode): void => {
			const statusCode: number = error.statusCode ?? 500;
			const statusMessage: string | undefined = STATUS_CODES[statusCode];
			const replyHeaders: IncomingHttpHeaders = this.modifyReplyHeaders({
				'content-type': 'application/json; charset=utf-8',
			});

			reply.writeHead(statusCode, statusMessage, replyHeaders).write(
				JSON.stringify({
					statusCode,
					error: statusMessage,
					message: error.message,
				})
			);
		};

		try {
			await UndiciAgent.getInstance().stream(opts, factory);
		} catch (error) {
			if (error instanceof Error && !reply.headersSent) {
				errorHandler(error);
			}

			reply.end();
		}
	}

	static readonly allowedRequestMethods: RequestMethod[] = ['GET', 'POST'];
}
