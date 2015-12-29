Module = Module || {};
Module.onRuntimeInitialized = function() {

};
var VirgilCrypto = Module;

var Crypto = {};
Crypto.VirgilCipher = VirgilCrypto.VirgilCipher;
Crypto.VirgilSigner = VirgilCrypto.VirgilSigner;
Crypto.VirgilKeyPair = VirgilCrypto.VirgilKeyPair;
Crypto.VirgilByteArray = VirgilCrypto.VirgilByteArray;
Crypto.VirgilByteArrayToBase64 = VirgilCrypto.VirgilBase64.encode;
Crypto.VirgilByteArrayFromBase64 = VirgilCrypto.VirgilBase64.decode;
Crypto.VirgilByteArrayFromUTF8 = VirgilCrypto.VirgilByteArray.fromUTF8;
