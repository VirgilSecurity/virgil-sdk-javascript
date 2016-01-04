// transpilers
import 'babel-core/external-helpers';

// workaround for error: `only one instance of babel/polyfill is allowed`
// so, include the babel/polyfill into build, but load only single instance
if (global && !global._babelPolyfill) {
	require('babel/polyfill');
}

// module exports
export const Version = SDK_VERSION;

export { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

export { encrypt } from './browser/encrypt';
export { encryptAsync } from './browser/encrypt-async';
export { decrypt } from './browser/decrypt';
export { decryptAsync } from './browser/decrypt-async';
export { sign } from './browser/sign';
export { signAsync } from './browser/sign-async';
export { verify } from './browser/verify';
export { verifyAsync } from './browser/verify-async';
export { generateKeyPair } from './browser/generate-key-pair';
export { generateKeyPairAsync } from './browser/generate-key-pair-async';
export { KeysTypesEnum } from './browser/keys-types-enum';
