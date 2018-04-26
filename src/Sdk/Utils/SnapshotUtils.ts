export function takeSnapshot (content: object): Buffer {
	return Buffer.from( JSON.stringify(content), 'utf8' );
}

export function parseSnapshot<T> (snapshot: Buffer): T {
	return JSON.parse( snapshot.toString('utf8') ) as T;
}
