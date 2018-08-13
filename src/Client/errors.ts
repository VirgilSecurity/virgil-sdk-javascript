import { Response } from '../Lib/fetch';
import { VirgilError } from '../VirgilError';

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
	errorCode: string;

	constructor(message: string, status: number, errorCode: string) {
		super(message, 'VirgilHttpError');
		this.httpStatus = status;
		this.errorCode = errorCode;
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
	const reason = await response.json() as IHttpErrorResponseBody;
	return new VirgilHttpError(reason.message, response.status, reason.code);
}
