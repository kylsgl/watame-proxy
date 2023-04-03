import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';
import type { IncomingHttpHeaders as UndiciIncomingHttpHeaders } from 'undici/types/header';

export interface ProxyOptions {
	/** Allowed content types. https://www.iana.org/assignments/media-types/media-types.xhtml */
	allowContentTypes?: RegExp;
	/** Max allowed size of the message body in bytes  */
	maxContentBytes?: number;
	modifyRequestHeaders?: (
		headers: IncomingHttpHeaders &
			OutgoingHttpHeaders &
			UndiciIncomingHttpHeaders
	) => IncomingHttpHeaders & UndiciIncomingHttpHeaders;
	modifyReplyHeaders?: (headers: IncomingHttpHeaders) => IncomingHttpHeaders;
}

export interface ProxyReply {
	headers: IncomingHttpHeaders;
	buffer: Buffer;
}

export interface ProxyTarget {
	url: string;
	method: RequestMethod;
	body?: string;
	query?: Record<string, string | number | undefined>;
	options?: {
		redirect?: boolean;
		addRequestHeaders?: IncomingHttpHeaders & OutgoingHttpHeaders;
		removeRequestHeaders?: string[];
		addReplyHeaders?: IncomingHttpHeaders;
	};
}

export type RequestMethod =
	| 'DELETE'
	| 'GET'
	| 'OPTIONS'
	| 'PATCH'
	| 'POST'
	| 'PUT';
