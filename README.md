# JavaScript SDK Programming Guide 
[![npm](https://img.shields.io/npm/v/virgil-sdk.svg)](https://www.npmjs.com/package/virgil-sdk)

This guide is a practical introduction to creating JavaScript apps for that 
make use of Virgil Security services.

In this guide you will find code for every task you need to implement in order 
to create an application using Virgil Security. It also includes a description 
of the main objects and functions. The aim of this guide is to get you up and 
running quickly. You should be able to copy and paste the code provided here 
into your own apps and use it with minimal changes.

## Table of Contents

* [Setting up your project](#setting-up-your-project)
* [User and App Credentials](#user-and-app-credentials)
* [Usage](#usage)
* [Creating Virgil Cards](#creating-virgil-cards)
* [Getting Virgil Cards](#getting-virgil-cards)
* [Validating Virgil Cards](#validating-virgil-cards)
* [Revoking a Virgil Card](#revoking-a-virgil-card)
* [Using Crypto](#using-crypto)
* [Operations with Crypto Keys](#operations-with-crypto-keys)
  * [Generate Keys](#generate-keys)
  * [Import and Export Keys](#import-and-export-keys)
* [Encryption and Decryption](#encryption-and-decryption)
  * [Encrypt Data](#encrypt-data)
  * [Decrypt Data](#decrypt-data)
* [Generating and Verifying Signatures](#generating-and-verifying-signatures)
  * [Generating a Signature](#generating-a-signature)
  * [Verifying a Signature](#verifying-a-signature)
* [Authenticated Encryption](#authenticated-encryption)
  * [Sign then Encrypt](#sign-then-encrypt)
  * [Decrypt then Verify](#decrypt-then-verify)
* [Release Notes](#release-notes)

## Setting up your project

### Target environments

SDK targets ECMAScript5 compatible browsers and Node.js from version 0.12 
and above. 

### Installation

You can install Virgil SDK from npm

```sh
npm install virgil-sdk --save
```

Or get it from CDN
```html
<script 
src="https://cdn.virgilsecurity.com/packages/javascript/sdk/4.0.0/virgil-sdk.min.js"
crossorigin="anonymous"></script>
```

Or [download the source code](https://github.com/VirgilSecurity/virgil-sdk-javascript/releases)

> IMPORTANT!
> Please note that in browser environment we're using Web Workers internally 
to invoke some heavy cryptographic 
> operations which means that Chrome and Opera will give an error 
> `"Uncaught SecurityError: Script at '[blob url here]' cannot be accessed from origin 'null'."` 
> when you try to use Virgil SDK locally. It needs to be on a proper domain.

## User and App Credentials

To start using Virgil Services you first have to create an account at [Virgil 
Developer Portal](https://developer.virgilsecurity.com/account/signup).

After you create an account, or if you already have an account, sign in and 
create a new application. Make sure you save the *private key* that is 
generated for your application at this point as you will need it later. 
After your application is ready, create a *token* that your app will 
use to make authenticated requests to Virgil Services. One more thing that 
you're going to need is your application's *app id* which is an identifier 
of your application's Virgil Card.

## Usage

Now that you have your account and application in place you can start making 
requests to Virgil Services.

### Initializing an API Client

To initialize the client, you need the *access token* that you created for 
your application on [Virgil Developer Portal](https://developer.virgilsecurity.com/)

```javascript
// var virgil = require('virgil-sdk');
// or just use virgil if you've added virgil sdk via <script> tag
 
var client = virgil.client("[YOUR_ACCESS_TOKEN_HERE]");
```

## Creating Virgil Cards

At this point you can start creating and publishing *Virgil Cards* for your
users.

> *Virgil Card* is the main entity of Virgil services, it includes the user's 
> identity their public key.

The easiest (and for now the only) way to create a Virgil Card is to create 
it with the `scope` parameter set to `'application'`. The cards created this 
way will only be available to your application (i.e. will only be returned in 
response to a request presenting your application's *access token*).
As your application represents an authority on behalf of which the Virgil 
Cards are created, you're going to need to sign the cards you create with 
your application's private key. You also going to need the *app id* to 
distinguish your app's signature from others. 

The following snippet assumes Node.js environment as you probably don't want 
your application's private key to be exposed to the client-side. We're using 
hard-coded values for the sensitive data such as application's private key and 
it's password for simplicity's sake. You should **never** do that in a real 
application. Such data should be provided externally in a secure manner.

```javascript
var virgil = require('virgil-sdk');
var fs = require('fs');

var APP_ID = "[YOUR_APP_ID_HERE]";
var APP_KEY_PASSWORD = "[YOUR_APP_KEY_PASSWORD_HERE]";

// this can either be a Buffer object or a base64-encoded string with the 
// private key bytes
var appPrivateKeyMaterial = "[YOUR_BASE64_ENCODED_APP_KEY_HERE]";
var appPrivateKey = virgil.crypto.importPrivateKey(
		appPrivateKeyMaterial, APP_KEY_PASSWORD);

// appPrivateKey is an object that is a handle to the private and 
// does not hold the private key value
```

Note that you had to use `virgil.crypto.importPrivateKey` to convert the raw 
private key bytes to an object. This is the way the keys are represented by
`virgil.crypto`. You will later pass that object as the private key to the 
methods that require it, like `sign`.

### Generate a new key pair
 
Virgil Cards include their owner's public key, so the first thing you need 
to create a card is to generate a key pair. Suppose you want to create a card 
for your user whose name is Alice:

```javascript
var aliceKeys = virgil.crypto.generateKeys();

// {
// 		publicKey: CryptoKeyHandle object,
//		privateKey: CryptoKeyHandle object
// }
```

### Prepare request

Next you need a request object that will hold the card's data. The following 
properties are required to create the request:

 - **public_key** - Public key associated with the Card as a 
 base64-encoded string
 - **identity** - Identity associated with the card.
 - **identity_type** - The type of identity associated with the card.
 
You may optionally include your application specific parameters to be 
associated with the card via 'data' property, which has to be an associative
array with no more than 16 items, and the length of keys and values must not 
exceed 256 characters.

Note that you have to call `virgil.crypto.exportPublicKey` to get the public
key bytes out of the `CryptoKeyHandle` object that `generateKeys` method 
returns. `virgil.crypto.exportPublicKey` returns a `Buffer` which you can
to convert to a base64 string using one of it's `toString` overloads. 

```javascript
var exportedPublicKey = virgil.crypto.exportPublicKey(aliceKeys.publicKey);
var publishRequest = virgil.publishCardRequest({
      identity: "alice",
      identity_type: "username",
      public_key: exportedPublicKey.toString('base64')
    });
```


### Sign request

When you have the request object ready you need to sign it with two private 
keys: the key of the Card being created and your application's key. Use 
`virgil.requestSigner` function to create an object you can use to sign the 
request

```javascript
var requestSigner = virgil.requestSigner(virgil.crypto);

requestSigner.selfSign(publishRequest, aliceKeys.privateKey);
requestSigner.authoritySign(publishRequest, APP_ID, appPrivateKey);
```

### Publish a Virgil Card

After you sign the request object you can send it to Virgil Services to 
conclude the card creation process.

```javascript
client.publishCard(publishRequest)
.then(function (aliceCard) {
  console.log(aliceCard);
});
```

## Getting Virgil Cards

In order to encrypt a message for a user you have to know their public key 
(i.e. their Virgil Card). There are two ways you can get cards from Virgil 
Services: search by identity and get by id.

### Get Virgil Card by Id

If you know the id of the card you want to encrypt a message for, you can use 
`client.getCard` method. It accepts a single argument - `card_id` as a string
and returns a Promise that is resolved with the card once the it is loaded:

```javascript
var cardId = "[ID_OF_THE_CARD_TO_GET]";
client.getCard(cardId).then(function (card) {
  console.log(card);
});
```

### Search for Virgil Cards

The `client.searchCards` method performs the cards search by criteria. 
It accepts a single `criteria` parameter with the following properties:

- **identities** - An array of identity values to search for (Required)
- **identity_type** - Specifies the *identity_type* of the cards to be 
found (Optional).
- **scope** - Specifies the scope to perform search on. Either 'global' or 
'application' (Optional. Default is 'application')

It returns a Promise that is resolved with an array of cards matching the 
criteria once the server response is loaded.

```javascript
 
var criteria = {
  identities: [ "alice", "bob" ]
};
client.searchCards(criteria).then(function (cards) {
  console.log(cards);
});
```

## Validating Virgil Cards

You should be verifying the integrity of the cards that you get from the
network. To do that, there is a `cardValidator` method available that you 
use to create a validator object which you can pass to the `client` object 
using its `setCardValidator` method. The client will then check the validity 
of the cards before returning them to the calling code. By default objects 
created by `cardValidator` factory function will check the *Virgil Cards 
Service* signature and the card's owner signature. You can require that 
other signatures be checked for a card by passing the required signer's id 
and public key to the `addVerifier` method of the validator object.

```javascript
var myAppPublicKey = "[BUFFER_OR_BASE64_STRING_WITH_KEY_MATERIAL]";
var validator = virgil.cardValidator(virgil.crypto);

validator.addVerifier('APP_ID', myAppPublicKey);

client.setCardValidator(validator);

var criteria = {
  identities: [ "alice", "bob" ]
};
client.searchCards(criteria)
.then(function (cards) {
  console.log(cards);
})
.catch(function (err) {
  if (err.invalidCards) {
    // err.invalidCards contains an array of Card objects 
    // that didn't pass validation
  }
});
```

## Revoking a Virgil Card

Occasionally you might need to revoke a Virgil Card from the Virgil Services. 
The steps required to do that are similar to those need to publish a card.

### Prepare request

To make a request object to revoke a Virgil Card use `virgil.revokeCardRequest` 
factory function. It accepts a `params` object with the following properties:
 - **card_id** - Id of card to revoke (Required)
 - **revocation_reason** - The reason for revoking the card. Must be either 
 'unspecified' or 'compromised'. Default is "unspecified". You can use the 
 `virgil.RevocationReason` enumeration to get the correct value.

```javascript
var cardId = "[CARD_ID_HERE]";

var revokeRequest = virgil.revokeCardRequest({
  card_id: cardId,
  revocation_reason: virgil.RevocationReason.COMPROMISED
});
```

### Sign request

This step is the same as the one for the publish request only this time you 
only have to provide the authority's (i.e. your application's) signature.

```javascript
var requestSigner = virgil.requestSigner(virgil.crypto);

requestSigner.authoritySign(revokeRequest, APP_ID, appPrivateKey);
```

### Send request

```javascript
client.revokeCard(revokeRequest).then(function () {
  console.log('Revoked successfully');
});
```


## Using Crypto


The `virgil.crypto` object provides implementation of cryptographic operations 
such as hashing, signature generation and verification as well as encryption 
and decryption. All api functions of `virgil.crypto` accept byte arrays as 
either Node.js `Buffer`s of base64-encoded strings and return byte arrays 
`Buffer`s. In browsers [this polyfill](https://github.com/feross/buffer) and 
is available via `virgil.Buffer` property.


## Operations with Crypto Keys

### Generate Keys
The following code sample illustrates key pair generation. The default 
algorithm is ed25519.

```javascript
 var aliceKeys = virgil.crypto.generateKeys();
```

To specify a different algorithm, pass one of the values of 
`virgil.crypto.KeyPairType` enumeration

```javascript
var aliceKeys = virgil.crypto.generateKeys(
	virgil.crypto.KeyPairType.FAST_EC_X25519) // Curve25519
```

### Import and Export Keys
All `virgil.crypto` api functions (except `import...` and `export...` accept 
and return keys as `CryptoKeyHandle` objects. To get the raw key data as 
`Buffer` from the `CryptoKeyHandle` use `exportPrivateKey` or `exportPublicKey` 
methods accordingly. To get the `CryptoKeyHandle` object out of the raw key 
data use `importPrivateKey` and `importPublicKey` methods:

```javascript
 var exportedPrivateKey = virgil.crypto.exportPrivateKey(aliceKeys.privateKey);
 var exportedPublicKey = virgil.crypto.exportPublicKey(aliceKeys.publicKey);

 var privateKey = virgil.crypto.importPrivateKey(exportedPrivateKey);
 var publicKey = virgil.crypto.importPublicKey(exportedPublicKey);
```

If you want to encrypt the private key before exporting it you must provide a 
password to encrypt the key with as a second parameter to `exportPrivateKey` 
function. Similarly, if you want to import a private key that has been 
encrypted - provide a password as a second parameter to `importPrivateKey` 
function:

```javascript
var exportedEncryptedKey = virgil.crypto.exportPrivateKey(
	aliceKeys.privateKey, 'pa$$w0rd');
var importedEncryptedKey = virgil.crypto.importPublicKey(
	exportedPublicKey, 'pa$$w0rd');
```

## Encryption and Decryption
Data encryption using [ECIES](https://en.wikipedia.org/wiki/Integrated_Encryption_Scheme) 
scheme with [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) mode.

### Encrypt Data

#### encrypt(data, recipient | recipients)

##### Arguments

Encrypts the data with single recipient(s) public key(s).

* data (Buffer|string): The data to encrypt. If data is a string, an encoding 
of UTF-8 is assumed.
* recipient|recipients: Either one of the following
	- recipient (CryptoKeyHandle): The single recipient public key handle.
	- recipients (CryptoKeyHandle[]): Array of the recipient public 
	key handles.

##### Returns

* (Buffer): Returns encrypted data.

```javascript
var plaintext = 'Hello Bob!';
var cipherData = virgil.crypto.encrypt(plaintext, aliceKeys.publicKey);
```

### Decrypt Data

#### decrypt(data, privateKey)

##### Arguments

Decrypts the data using the private key.

* data (Buffer|string): The data to decrypt. If data is a string, an encoding 
of base64 is assumed.
* privateKey (CryptoKeyHandle): The private key to use for decryption.

##### Returns

* (Buffer): Returns decrypted data.

```javascript
var decryptedData = virgil.crypto.decrypt(cipherData, aliceKeys.privateKey);
```

## Generating and Verifying Signatures
This section walks you through the steps necessary to use the `virgil.crypto` 
to generate a digital signature for data and to verify that a signature is 
authentic.


### Generate Signature

Sign the SHA-384 fingerprint of data using the private key. 

#### sign(data, privateKey)

Signs the data using the private key and returns the signature.

##### Arguments

* data (Buffer|string): The data to sign. If data is a string, an encoding of 
UTF-8 is assumed.
* privateKey (CryptoKeyHandle): The private key to use for signing.

##### Returns

* (Buffer): Returns the signature.

```javascript
// The data to be signed with alice's Private key
var data = 'Hello Bob, How are you?';
var signature = virgil.crypto.sign(data, aliceKeys.privateKey);
```

### Verify Signature

Verify the signature of the SHA-384 fingerprint of data using the public key.

#### verify(data, signature, publicKey)

Verifies the signature for the data and returns `true` if verification succeeded or `false` if it failed.

##### Arguments

* data (Buffer|string): The signed data. If data is a string, an encoding of
UTF-8 is assumed.
* signature (Buffer|string): The signature. If signature is a string, an 
encoding of base64 is assumed.
* publicKey (Buffer): The public key of the party that signed the data.

##### Returns

* (boolean): Returns `true` if verification succeeded or `false` if it failed.

```javascript
 var isValid = virgil.crypto.verify(data, signature, aliceKeys.publicKey);
 ```
 
## Authenticated Encryption
Authenticated Encryption provides both data confidentiality and data integrity 
assurances to the information being protected.

```javascript
 
var alice = virgil.crypto.generateKeys();
var bob = virgil.crypto.generateKeys();
```

### Sign then encrypt

Generates the signature, encrypts the data and attaches the signature to the 
cipher data. Returns a signed cipher data. To encrypt for multiple recipients, 
pass an array of public keys as third parameter

#### signThenEncrypt(data, privateKey, recipient | recipients)

##### Arguments

* data (Buffer|string): The data to sign and encrypt. If data is a string, an 
encoding of UTF-8 is assumed.
* privateKey (CryptoKeyHandle): The private key to use for signature 
generation.
* recipient|recipients: Either one of the following
	- recipient (CryptoKeyHandle): The public key to use for encryption.
	- recipients (CryptoKeyHandle[]): Array of public keys to use for 
	encryption.

##### Returns

* (Buffer): Returns encrypted signed data.

```
var cipherData = virgil.crypto.signThenEncrypt(
	data, alice.privateKey, bob.publicKey);
```

### Decrypt then verify
Decrypts the data and verifies attached signature. Returns decrypted data if 
verification succeeded or throws an error if it failed. 

### decryptThenVerify(cipherData, privateKey, publicKey)

#### Arguments

* cipherData (Buffer|string): The data to decrypt and verify. If data is 
a string, an encoding of base64 is assumed.
* privateKey (CryptoKeyHandle): The private key to use for decryption.
* publicKey (CryptoKeyHandle): The sender's public key to use for signature 
verification.

#### Returns

* (Buffer): Returns decrypted data.

```
var decryptedData = virgil.crypto.decryptThenVerify(
	cipherData, bob.privateKey, alice.publicKey);
```
 

## Release Notes
 - Please read the latest notes [here](https://github.com/VirgilSecurity/virgil-sdk-javascript/releases).
