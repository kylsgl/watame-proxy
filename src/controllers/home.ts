import os from 'node:os';
import type { FastifyRequest, FastifyReply } from 'fastify';

import { formatBytes } from '../lib/utils';

function message(
	proc: NodeJS.Process,
	sys: typeof os,
	hostname: string
): string {
	const { arch, platform, cpus, totalmem, freemem } = sys;
	const totalMem: number = totalmem();
	const freeMem: string = formatBytes(totalMem - freemem());
	const { rss, heapTotal, heapUsed, arrayBuffers, external } =
		proc.memoryUsage();

	return `
	pid: ${proc.pid}
	os: ${platform()} ${arch()}
	cpu: ${cpus()[0].model} (${cpus().length}c/t)
	mem: ${freeMem} / ${formatBytes(totalMem)}
	uptime: ${((time: number): string => {
		const day: number = Math.floor(time / 86400);
		let hour: number | string = Math.floor((time % 86400) / 3600);
		let minute: number | string = Math.floor((time % 3600) / 60);
		let second: number | string = Math.floor(time % 60);

		if (hour < 10) hour = `0${hour}`;
		if (minute < 10) minute = `0${minute}`;
		if (second < 10) second = `0${second}`;
		return `${day}d ${hour}h ${minute}m ${second}s`;
	})(proc.uptime())}

	rss: ${formatBytes(rss)}
	heapTotal: ${formatBytes(heapTotal)}
	heapUsed: ${formatBytes(heapUsed)}
	arrayBuffers: ${formatBytes(arrayBuffers)}
	external: ${formatBytes(external)}

	---------------------------------------------------

	GET /v2/{url}

	  query parameters
	  > cache?: number
	  > cookie?: string
	  > method?: string
	  > redirect?: boolean
	  > referrer?: string

	  examples
	  > ${hostname}/v2/https://i.imgur.com/kzElYPN.jpeg
	  > ${hostname}/v2/https://i.redd.it/lfp8re6ugim91.png?cache=123&redirect=true
	  > ${hostname}/v2/https://github.com?referrer=https://github.com&cookie=enabled=true
	`;
}

async function get(
	{ hostname }: FastifyRequest,
	reply: FastifyReply
): Promise<void> {
	await reply
		.headers({
			'cache-control': 'public, max-age=31536000',
			'content-type': 'text/plain; charset=utf-8',
		})
		.status(200)
		.send(message(process, os, hostname));
}

export default {
	get,
};
