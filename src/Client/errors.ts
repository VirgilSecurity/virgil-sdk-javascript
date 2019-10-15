import { VirgilError } from '../VirgilError';

export enum ErrorCode {
	AccessTokenExpired = 20304,
	Unknown = 0,
}

/**
 * @hidden
 */
export interface IHttpErrorResponseBody {
	message: string;
	code: number;
}

/**
 * Error thrown by {@link CardManager} when request to the Virgil Cards Service
 * fails.
 */
export class VirgilHttpError extends VirgilError {
	httpStatus: number;
	errorCode: ErrorCode;

	constructor(message: string, status: number, errorCode: number) {
		super(message, 'VirgilHttpError', VirgilHttpError);
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
		return new VirgilHttpError(response.statusText, response.status, 0);
	}
}
