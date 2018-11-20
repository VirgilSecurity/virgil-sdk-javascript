import { VirgilError } from '../VirgilError';

export enum ErrorCode {
	AccessTokenExpired = '20304',
	Unknown = '00000',
}

/**
 * @hidden
 */
export interface IHttpErrorResponseBody {
	message: string;
	code: string;
}

/**
 * Error thrown by {@link CardManager} when request to the Virgil Cards Service
 * fails.
 */
export class VirgilHttpError extends VirgilError {
	httpStatus: number;
	errorCode: ErrorCode;

	constructor(message: string, status: number, errorCode: string) {
		super(message, 'VirgilHttpError');
		this.httpStatus = status;
		this.errorCode = errorCode as ErrorCode;
	}
}

/**
 * Generates error object from response object with HTTP status >= 400
 *
 * @hidden
 *
 * @param {Response} response
 * @returns {Promise<VirgilHttpError>}
 */
export async function generateErrorFromResponse(response: Response) {
	if (response.status >= 400 && response.status < 500) {
		const reason = await response.json() as IHttpErrorResponseBody;
		return new VirgilHttpError(reason.message, response.status, reason.code);
	} else {
		return new VirgilHttpError(response.statusText, response.status, '00000');
	}
}
