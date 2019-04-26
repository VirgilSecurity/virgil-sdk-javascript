/// <reference types="sinon" />

import AssertStatic = Chai.AssertStatic;
import SinonSpy = sinon.SinonSpy;
import SinonSpyCall = sinon.SinonSpyCall;
import SinonStatic = sinon.SinonStatic;

interface ExtendedAssert extends AssertStatic {
	notCalled(spy: SinonSpy): void;
	called(spy: SinonSpy): void;
	calledOnce(spy: SinonSpy): void;
	calledTwice(spy: SinonSpy): void;
	calledThrice(spy: SinonSpy): void;
	callCount(spy: SinonSpy, count: number): void;
	callOrder(...spies: SinonSpy[]): void;
	calledOn(spyOrSpyCall: SinonSpy | SinonSpyCall, obj: any): void;
	alwaysCalledOn(spy: SinonSpy, obj: any): void;
	calledWith(spyOrSpyCall: SinonSpy | SinonSpyCall, ...args: any[]): void;
	alwaysCalledWith(spy: SinonSpy, ...args: any[]): void;
	neverCalledWith(spy: SinonSpy, ...args: any[]): void;
	calledWithExactly(spyOrSpyCall: SinonSpy | SinonSpyCall, ...args: any[]): void;
	alwaysCalledWithExactly(spy: SinonSpy, ...args: any[]): void;
	calledWithMatch(spyOrSpyCall: SinonSpy | SinonSpyCall, ...args: any[]): void;
	alwaysCalledWithMatch(spy: SinonSpy, ...args: any[]): void;
	neverCalledWithMatch(spy: SinonSpy, ...args: any[]): void;
	calledWithNew(spyOrSpyCall: SinonSpy | SinonSpyCall): void;
	threw(spyOrSpyCall: SinonSpy | SinonSpyCall): void;
	threw(spyOrSpyCall: SinonSpy | SinonSpyCall, exception: string): void;
	threw(spyOrSpyCall: SinonSpy | SinonSpyCall, exception: any): void;
	alwaysThrew(spy: SinonSpy): void;
	alwaysThrew(spy: SinonSpy, exception: string): void;
	alwaysThrew(spy: SinonSpy, exception: any): void;
}

declare var assert: ExtendedAssert;

declare var sinon: SinonStatic;

declare module '*.json' {
	const value: { [key: string]: any };
	export default value;
}

declare module NodeJS {
	interface Process {
		browser?: boolean;
	}
}
