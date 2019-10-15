/**
 * Custom error class for errors specific to Virgil SDK.
 */
export class VirgilError extends Error {
	name: string;
	constructor(m: string, name: string = 'VirgilError', ParentClass: any = VirgilError) {
		super(m);
		Object.setPrototypeOf(this, ParentClass.prototype);
		this.name = name;
	}
}
