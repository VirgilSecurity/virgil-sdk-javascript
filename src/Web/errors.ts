import { Response } from '../lib/fetch';
import { VirgilError } from '../VirgilError';

export class VirgilCardVerificationError extends VirgilError {
	constructor(m: string) {
		super(m, 'CardVerificationError');
	}
}

export interface IHttpErrorResponseBody {
	message: string;
	code: string;
}

export class VirgilHttpError extends VirgilError {
	httpStatus: number;
	errorCode: string;

	constructor(message: string, status: number, errorCode: string) {
		super(message, 'VirgilHttpError');
		this.httpStatus = status;
		this.errorCode = errorCode;
	}
}

export async function generateErrorFromResponse(response: Response) {
	const reason = await response.json() as IHttpErrorResponseBody;
	return new VirgilHttpError(reason.message, response.status, reason.code);
}
