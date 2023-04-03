import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isWebUri } from 'valid-url';

import type { ErrorWithStatusCode } from '../../interfaces';
import type { RequestMethod } from '../proxy';

export function errorWithStatusCode(
	statusCode: number,
	message: string
): Error {
	const error: ErrorWithStatusCode = new Error(message);
	error.statusCode = statusCode;

	return error;
}

// https://stackoverflow.com/a/18650828
export function formatBytes(bytes: number): string {
	if (bytes < 1) {
		return '0 Bytes';
	}

	const KILOBYTE = 1024;
	const SIZES: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

	const index = Math.floor(Math.log(bytes) / Math.log(KILOBYTE));
	const formatted = parseFloat((bytes / KILOBYTE ** index).toFixed(2));

	return `${formatted} ${SIZES[index]}`;
}

export function getDirname(url: string): string {
	return dirname(fileURLToPath(url));
}

export function getReferrer(url: string): string {
	try {
		const { protocol, hostname } = new URL(url);
		const host: string[] = hostname.split('.');
		const name: string | undefined = host.at(-2);
		const tld: string | undefined = host.at(-1);

		if (name === undefined || tld === undefined) {
			throw new Error();
		}

		return `${protocol}//${name}.${tld}/`;
	} catch (error) {
		return '';
	}
}

export function isValidRequestMethod(
	methods: string[],
	method: string
): method is RequestMethod {
	return methods.includes(method.toUpperCase());
}

export function isValidWebUrls(
	...urls: string[]
): [isValid: boolean, invalidUrl: string] {
	for (let index = 0; index < urls.length; index += 1) {
		const url: string = urls[index];
		if (
			url.length <= 10 ||
			isWebUri(url) === undefined ||
			url.split('.').length < 2
		) {
			return [false, url];
		}
	}

	return [true, ''];
}
