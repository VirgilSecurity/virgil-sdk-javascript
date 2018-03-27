class Foo {
	title: string = 'World';

	getHello(): string {
		return 'Hello, ' + this.title;
	}
}

console.log(new Foo().getHello());