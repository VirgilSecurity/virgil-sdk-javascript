export class VirgilError extends Error {
	name: string;
	constructor(m: string, name: string = 'VirgilError') {
		super(m);
		Object.setPrototypeOf(this, new.target.prototype);
		this.name = name;
	}
}
