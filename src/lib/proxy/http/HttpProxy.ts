import http, {
	type Agent,
	type ClientRequest,
	type IncomingHttpHeaders,
	type IncomingMessage,
} from 'node:http';
import https from 'node:https';

import type {
	ProxyTarget,
	ProxyOptions,
	ProxyReply,
} from '../common/interfaces';

import ProxyBase from '../common/ProxyBase';
import HttpAgent from './HttpAgent';

interface Protocol {
	get: {
		(
			options: string | URL | http.RequestOptions,
			callback?: ((res: http.IncomingMessage) => void) | undefined
		): http.ClientRequest;
		(
			url: string | URL,
			options: http.RequestOptions,
			callback?: ((res: http.IncomingMessage) => void) | undefined
		): http.ClientRequest;
	};
	agent: Agent | false;
}

interface Protocols {
	http: Protocol;
	https: Protocol;
}

export interface HttpProxyOptions extends ProxyOptions {
	requestTimeout?: number;
	useGlobalAgent?: boolean;
}

export class HttpProxy extends ProxyBase {
	private readonly requestTimeout: number;

	private readonly protocols: Protocols = {
		http: {
			get: http.get,
			agent: HttpAgent.getInstance('http'),
		},
		https: {
			get: https.get,
			agent: HttpAgent.getInstance('https'),
		},
	};

	constructor(public target: ProxyTarget, options?: HttpProxyOptions) {
		super(target, options);

		if (options?.useGlobalAgent === false) {
			this.protocols.http.agent = false;
			this.protocols.https.agent = false;
		}

		this.requestTimeout = options?.requestTimeout ?? 4000;
	}

	async proxy(requestHeaders: IncomingHttpHeaders): Promise<ProxyReply> {
		const {
			url: { pathname, hostname, protocol },
			protocols,
			requestTimeout,
			target: { method },
		} = this;

		const requestProtocol: string = protocol.slice(0, -1);

		return new Promise(
			(
				resolve: (reply: ProxyReply | PromiseLike<ProxyReply>) => void,
				reject: (error: Error) => void
			): void => {
				if (!(requestProtocol in protocols)) {
					reject(new Error(`Invalid protocol: ${requestProtocol}`));
				}

				const { get, agent } = protocols[requestProtocol as keyof Protocols];

				const request: ClientRequest = get(
					{
						agent,
						method,
						headers: this.modifyRequestHeaders(requestHeaders),
						hostname,
						path: pathname,
						timeout: requestTimeout,
					},
					(reply: IncomingMessage): void => {
						const { statusCode, headers } = reply;

						try {
							this.replyChecks(headers, statusCode);
						} catch (error: unknown) {
							if (error instanceof Error) {
								reply.destroy(error);
								return;
							}
						}

						const chunks: unknown[] = [];

						reply.on('data', (chunk: unknown): void => {
							chunks.push(chunk);
						});

						reply.on('end', (): void => {
							resolve({
								headers: this.modifyReplyHeaders(headers),
								buffer: Buffer.concat(chunks as Uint8Array[]),
							});
						});

						reply.on('error', reject);
					}
				);

				request.on('timeout', (): void => {
					request.destroy();
				});

				request.on('error', reject);
			}
		);
	}
}
