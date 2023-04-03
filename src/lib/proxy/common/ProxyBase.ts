import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
import type { IncomingHttpHeaders as UndiciIncomingHttpHeaders } from 'undici/types/header';

import type { ProxyTarget, ProxyOptions } from './interfaces';

import { formatBytes, errorWithStatusCode } from '../../utils';

export default class ProxyBase {
	url: URL;

	allowContentTypes: RegExp | undefined;

	maxContentBytes = 0;

	constructor(public target: ProxyTarget, options?: ProxyOptions) {
		this.url = new URL(target.url);

		if (options === undefined) {
			return;
		}

		if (options.allowContentTypes !== undefined) {
			this.allowContentTypes = options.allowContentTypes;
		}

		if (options.maxContentBytes !== undefined) {
			this.maxContentBytes = options.maxContentBytes;
		}

		if (options.modifyRequestHeaders !== undefined) {
			this.modifyRequestHeaders = options.modifyRequestHeaders;
		}

		if (options.modifyReplyHeaders !== undefined) {
			this.modifyReplyHeaders = options.modifyReplyHeaders;
		}
	}

	modifyRequestHeaders(
		headers: IncomingHttpHeaders & OutgoingHttpHeaders
	): IncomingHttpHeaders & UndiciIncomingHttpHeaders {
		const {
			url: { hostname },
			target: { options },
		} = this;

		let newRequestHeaders: IncomingHttpHeaders & UndiciIncomingHttpHeaders = {
			...headers,
			host: hostname,
		};

		if (options?.addRequestHeaders !== undefined) {
			Object.assign(newRequestHeaders, options.addRequestHeaders);
		}

		if (options?.removeRequestHeaders !== undefined) {
			const { removeRequestHeaders } = options;
			newRequestHeaders = Object.fromEntries(
				Object.entries(newRequestHeaders).filter(
					([key]): boolean => !removeRequestHeaders.includes(key)
				)
			);
		}

		delete newRequestHeaders.connection;

		return newRequestHeaders;
	}

	modifyReplyHeaders(headers: IncomingHttpHeaders): IncomingHttpHeaders {
		const {
			target: { options },
		} = this;

		const newReplyHeaders: IncomingHttpHeaders = {
			'content-type': headers['content-type'],
		};

		const contentEncoding: string | undefined = headers['content-encoding'];
		if (contentEncoding !== undefined) {
			newReplyHeaders['content-encoding'] = contentEncoding;
		}

		const contentLength: string | undefined = headers['content-length'];
		if (contentLength !== undefined) {
			newReplyHeaders['content-length'] = contentLength;
		}

		if (options?.addReplyHeaders !== undefined) {
			Object.assign(newReplyHeaders, options.addReplyHeaders);
		}

		return newReplyHeaders;
	}

	replyChecks(
		{
			'content-type': contentType,
			'content-length': contentLength,
		}: IncomingHttpHeaders,
		statusCode = 500
	): void {
		if (statusCode !== 200) {
			throw errorWithStatusCode(
				statusCode,
				`Requested resource returned with code ${statusCode}`
			);
		}

		const { allowContentTypes: allowType, maxContentBytes } = this;

		if (
			allowType !== undefined &&
			contentType !== undefined &&
			!allowType.test(contentType.toString())
		) {
			throw errorWithStatusCode(
				415,
				`Resource type ${contentType} is not allowed`
			);
		}

		if (
			maxContentBytes > 0 &&
			contentLength !== undefined &&
			maxContentBytes < Number(contentLength)
		) {
			throw errorWithStatusCode(
				413,
				`Resource size (${formatBytes(
					Number(contentLength)
				)}) exceeds the maximum size of ${formatBytes(maxContentBytes)}`
			);
		}
	}
}
