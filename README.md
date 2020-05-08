> This README is for Virgil SDK v6. If you're here for the previous version (v5.3.x), check the [v5.3.x branch](https://github.com/VirgilSecurity/virgil-sdk-javascript/tree/v5.3.x) for Virgil SDK v5.3.x docs.

# Virgil Core SDK JavaScript 

[![npm](https://img.shields.io/npm/v/virgil-sdk.svg)](https://www.npmjs.com/package/virgil-sdk)
[![Build status](https://img.shields.io/travis/VirgilSecurity/virgil-sdk-javascript.svg)](https://img.shields.io/travis/VirgilSecurity/virgil-sdk-javascript.svg)
[![GitHub license](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](https://github.com/VirgilSecurity/virgil/blob/master/LICENSE)
[![API Reference](https://img.shields.io/badge/API%20Reference-virgil--sdk--javascript-green)](https://virgilsecurity.github.io/virgil-sdk-javascript/)

[Introduction](#introduction) | [SDK Features](#sdk-features) | [Installation](#installation) | [Configure SDK](#configure-sdk) | [Usage Examples](#usage-examples) | [Docs](#docs) | [Support](#support)

## Introduction

<a href="https://developer.virgilsecurity.com/docs"><img width="230px" src="https://cdn.virgilsecurity.com/assets/images/github/logos/virgil-logo-red.png" align="left" hspace="10" vspace="6"></a> [Virgil Security](https://virgilsecurity.com) provides a set of APIs for adding security to any application. In a few simple steps you can encrypt communications, securely store data, and ensure data integrity. Virgil Security products are available for desktop, embedded (IoT), mobile, cloud, and web applications in a variety of modern programming languages.

The Virgil Core SDK is a low-level library that allows developers to get up and running with [Virgil Cards Service API](https://developer.virgilsecurity.com/docs/platform/api-reference/cards-service/) quickly and add end-to-end security to their new or existing digital solutions.

In case you need additional security functionality for multi-device support, group chats and more, try our high-level [Virgil E3Kit framework](https://github.com/VirgilSecurity/awesome-virgil#E3Kit).

## SDK Features

- Communicate with [Virgil Cards Service](https://developer.virgilsecurity.com/docs/platform/api-reference/cards-service/)
- Allow access for your application's users to Virgil Services using JWT
- Manage users' public keys
- Store private keys in IndexedDB as browser storage, filesystem for node.js or [Virgil key storage](https://github.com/VirgilSecurity/virgil-key-storage-rn) with React Native
- Use Virgil [Crypto Library](https://github.com/VirgilSecurity/virgil-crypto-javascript)
- Compatible with **post-quantum algorithms support** provided by Virgil Crypto Library: [Round5](https://round5.org/) (encryption) and [Falcon](https://falcon-sign.info/) (signature) 

## Installation

This module can be used both __server-side__ in a Node application, and __client-side__ in a web browser.

#### On a server

The recommended way is to install from npm:

```sh
npm install virgil-sdk
```

You will also need to install the `virgil-crypto` package from npm, unless plan to use custom crypto
```sh
npm install virgil-crypto
```

#### In the browser

The client-side SDK targets ECMAScript5+ compatible browsers. It is compatible with module bundlers like Rollup,
Webpack and Browserify. If you're using those, you need to install from npm. It can be added to the html page directly
 via `script` tag as well.

Note that the `virgil-crypto` script must also be added to the page.

```html
<script type="text/javascript" src="https://unpkg.com/virgil-crypto@^4.0.0/dist/browser.umd.js"></script>
<script type="text/javascript" src="https://unpkg.com/virgil-sdk@^6.0.0/dist/virgil-sdk.browser.umd.js"></script>
<script>
	// here you can use the global variables `Virgil` and `VirgilCrypto` as namespace objects,
	// containing all of `virgil-sdk` and `virgil-crypto` exports as properties

    VirgilCrypto.initCrypto().then(() => {
        // note that you cannot declare a variable named `crypto` in
    	// global scope (i.e. outside of any function) in browsers that
    	// implement Web Crypto API
    	const virgilCrypto = new VirgilCrypto.VirgilCrypto();
    	const virgilCardCrypto = new VirgilCrypto.VirgilCardCrypto(virgilCrypto);

    	const jwtProvider = new Virgil.CachingJwtProvider(fetchVirgilJwt);
    	const cardVerifier = new Virgil.VirgilCardVerifier(virgilCardCrypto);
    	const cardManager = new Virgil.CardManager({
    		cardCrypto: virgilCardCrypto,
    		accessTokenProvider: jwtProvider,
    		cardVerifier: cardVerifier
    	});    
    });
</script>
```

## Configure SDK

This section contains guides on how to set up Virgil Core SDK modules for authenticating users, managing Virgil Cards and storing private keys.

### Set up authentication

Set up user authentication with tokens that are based on the [JSON Web Token standard](https://jwt.io/) with some Virgil modifications.

In order to make calls to Virgil Services (for example, to publish user's Card on Virgil Cards Service), you need to have a JSON Web Token ("JWT") that contains the user's `identity`, which is a string that uniquely identifies each user in your application.

Credentials that you'll need:

|Parameter|Description|
|--- |--- |
|App ID|ID of your Application at [Virgil Dashboard](https://dashboard.virgilsecurity.com)|
|App Key ID|A unique string value that identifies your account at the Virgil developer portal|
|App Key|A Private Key that is used to sign API calls to Virgil Services. For security, you will only be shown the App Key when the key is created. Don't forget to save it in a secure location for the next step|

#### Set up JWT provider on Client side

Use these lines of code to specify which JWT generation source you prefer to use in your project:

```javascript
// client.js

import { CachingJwtProvider } from 'virgil-sdk';

const fetchJwt = () => fetch('/virgil-jwt', { credentials: 'same-origin' })
    .then(response => response.text());

const jwtProvider = new CachingJwtProvider(fetchJwt);
// pass jwtProvider as `accessTokenProvider` to the `CardManager` constructor
```

#### Generate JWT on Server side

Next, you'll need to set up the `JwtGenerator` and generate a JWT using the Virgil SDK.

Here is an example of how to generate a JWT:

```javascript
// server.js

import express from 'express';
import { initCrypto, VirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtGenerator } from 'virgil-sdk';

async function getJwtGenerator() {
  await initCrypto();

  const virgilCrypto = new VirgilCrypto();
  // initialize JWT generator with your App ID and App Key ID you got in
  // Virgil Dashboard and the `appKey` object you've just imported.
  return new JwtGenerator({
    appId: process.env.APP_ID,
    apiKeyId: process.env.APP_KEY_ID,
    // import your App Key that you got in Virgil Dashboard from string.
    apiKey: virgilCrypto.importPrivateKey(process.env.APP_KEY),
    // initialize accessTokenSigner that signs users JWTs
    accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
    millisecondsToLive:  20 * 60 * 1000 // JWT lifetime - 20 minutes (default)
  });
}

app.get('/virgil-jwt', (req, res) => {
  const generator = await generatorPromise;
  const virgilJwtToken = generator.generateToken(req.user.identity);

  res.json({ virgilToken: virgilJwtToken.toString() });
});
```

For this subsection we've created a sample backend that demonstrates how you can set up your backend to generate the JWTs. To set up and run the sample backend locally, head over to your GitHub repo of choice:

[Node.js](https://github.com/VirgilSecurity/sample-backend-nodejs) | [Golang](https://github.com/VirgilSecurity/sample-backend-go) | [PHP](https://github.com/VirgilSecurity/sample-backend-php) | [Java](https://github.com/VirgilSecurity/sample-backend-java) | [Python](https://github.com/VirgilSecurity/virgil-sdk-python/tree/master#sample-backend-for-jwt-generation)
 and follow the instructions in README.
 
### Set up Card Verifier

Virgil Card Verifier helps you automatically verify signatures of a user's Card, for example when you get a Card from Virgil Cards Service.

By default, `VirgilCardVerifier` verifies only two signatures - those of a Card owner and Virgil Cards Service.

Set up `VirgilCardVerifier` with the following lines of code:

```javascript
import { initCrypto, VirgilCrypto, VirgilCardCrypto } from 'virgil-crypto';
import { VirgilCardVerifier } from 'virgil-sdk';

(async function() {
	// initialize Crypto library
	await initCrypto();
	const cardCrypto = new VirgilCardCrypto(new VirgilCrypto());
	const cardVerifier = new VirgilCardVerifier(cardCrypto);
})();
```

### Set up Card Manager

This subsection shows how to set up a Card Manager module to help you manage users' public keys.

With Card Manager you can:
- specify an access Token (JWT) Provider.
- specify a Card Verifier used to verify signatures of your users, your App Server, Virgil Services (optional).

Use the following lines of code to set up the Card Manager:

```javascript
import { CardManager } from 'virgil-sdk';

// initialize cardManager and specify accessTokenProvider, cardVerifier
const cardManager = new CardManager({
  cardCrypto: cardCrypto,
  accessTokenProvider: accessTokenProvider,
  cardVerifier: cardVerifier
});
```

### Set up Key Storage for private keys

This subsection shows how to set up a `PrivateKeyStorage` using Virgil SDK in order to save private keys after their generation.

Here is an example of how to set up the `PrivateKeyStorage` class:

```javascript
import { initCrypto, VirgilCrypto, VirgilPrivateKeyExporter } from 'virgil-crypto';
import { PrivateKeyStorage } from 'virgil-sdk';

(async function() {
	// initialize Virgil Crypto library
	await initCrypto();

	const virgilCrypto = new VirgilCrypto();
	const privateKeyExporter = new VirgilPrivateKeyExporter(
		virgilCrypto,
		// if provided, will be used to encrypt the key bytes before exporting
		// and decrypt before importing.
		'[OPTIONAL_PASSWORD_TO_ENCRYPT_THE_KEYS_WITH]'
	);
	// Generate a private key
	const keyPair = virgilCrypto.generateKeys();

	const privateKeyStorage = new PrivateKeyStorage(privateKeyExporter);

	// Store the private key with optional metadata (i.e. the PrivateKeyEntry)
	await privateKeyStorage.store('my private key', keyPair.privateKey, { optional: 'data' });

	// Load the private key entry
	const privateKeyEntry = await privateKeyStorage.load('my private key');

	if (privateKeyEntry === null) {
		return;
	}

	console.log(privateKeyEntry.privateKey); // VirgilPrivateKey instance
	console.log(privateKeyEntry.meta); // { optional: 'data' }

	const privateKey = privateKeyEntry.privateKey;

	// Use the privateKey in virgilCrypto operations

	// Delete a private key
	await privateKeyStorage.delete('my private key');

	console.log('Private key has been removed');
})();
```

## Usage Examples

Before you start practicing with the usage examples, make sure that the SDK is configured. See the [Configure SDK](#configure-sdk) section for more information.

### Generate and publish Virgil Cards at Cards Service

Use the following lines of code to create a user's Card with a public key inside and publish it at Virgil Cards Service:

```javascript
import { initCrypto, VirgilCrypto, VirgilCardCrypto, VirgilPrivateKeyExporter } from 'virgil-crypto';
import { CachingJwtProvider, CardManager, PrivateKeyStorage, VirgilCardVerifier } from 'virgil-sdk';

(async function() {
    await initCrypto();

	const virgilCrypto = new VirgilCrypto();
	const cardCrypto = new VirgilCardCrypto(virgilCrypto);

	const jwtProvider = new CachingJwtProvider(fetchVirgilJwt);
	const cardVerifier = new VirgilCardVerifier(cardCrypto);
	const cardManager = new CardManager({
		cardCrypto: cardCrypto,
		accessTokenProvider: jwtProvider,
		cardVerifier: cardVerifier
	});
	const privateKeyStorage = new PrivateKeyStorage(
		new VirgilPrivateKeyExporter(virgilCrypto)
	);

	// Generate a key pair
	const keyPair = virgilCrypto.generateKeys();

	// Store the private key
	await privateKeyStorage.store('alice_private_key', keyPair.privateKey);

	// Publish user's card on the Cards Service
	const card = await cardManager.publishCard({
		privateKey: keyPair.privateKey,
		publicKey: keyPair.publicKey,
		identity: 'alice@example.com'
	});
})();

async function fetchVirgilJwt (context) {
	// assuming your backend server is serving Virgil JWT tokens in plaintext
	// at /virgil-access-token endpoint
	const response = await fetch('/virgil-access-token');
	if (!response.ok) {
		throw new Error('Failed to get Virgil Access Token');
	}

	return await response.text();
}
```

### Sign then encrypt data

Virgil Core SDK allows you to use a user's private key and their Virgil Cards to sign and encrypt any kind of data.

In the following example, we load a private key from a customized key storage and get recipient's Card from the Virgil Cards Service. Recipient's Card contains a public key which we will use to encrypt the data and verify a signature.

```javascript
import { initCrypto, VirgilCrypto, VirgilPrivateKeyExporter } from 'virgil-crypto';
import { PrivateKeyStorage } from 'virgil-sdk';

(async function() {
	await initCrypto();

	const virgilCrypto = new VirgilCrypto();
	const privateKeyStorage = new PrivateKeyStorage(
		new VirgilPrivateKeyExporter(virgilCrypto)
	);

	// Load the private key
	const alicePrivateKey = await privateKeyStorage.load('alice_private_key');
	if (alicePrivateKey === null) {
		console.log('Private key named "alice_private_key" does not exist');
		return;
	}

	const cards = await cardManager.searchCards('bob@example.com');
	if (cards.length === 0) {
		console.log('Virgil Card with identity "bob@example.com" does not exist');
		return;
	}

	const messageToEncrypt = 'Hello, Bob!';
	const bobPublicKeys = cards.map(card => card.publicKey);
	const encryptedMessage = virgilCrypto.signThenEncrypt(messageToEncrypt, alicePrivateKey, bobPublicKeys);
	console.log(encryptedMessage.toString('base64'));
})();
```

### Decrypt data and verify signature

Once the user receives the signed and encrypted message, they can decrypt it with their own private key and verify the signature with the sender's Card:

```javascript
import { initCrypto, VirgilCrypto, VirgilPrivateKeyExporter } from 'virgil-crypto';
import { PrivateKeyStorage } from 'virgil-sdk';

(async function() {
	await initCrypto();

	const virgilCrypto = new VirgilCrypto();
	const privateKeyStorage = new PrivateKeyStorage(
		new VirgilPrivateKeyExporter(virgilCrypto)
	);

	// Load the private key
	const bobPrivateKey = await privateKeyStorage.load('bob_private_key');
	if (bobPrivateKey === null) {
		console.log('Private key named "bob_private_key" does not exist');
		return;
	}

	const cards = await cardManager.searchCards('alice@example.com');
	if (cards.length === 0) {
		console.log('Virgil Card with identity "alice@example.com" does not exist');
		return;
	}

	const alicePublicKeys = cards.map(card => card.publicKey);
	const decryptedMessage = virgilCrypto.decryptThenVerify(encryptedMessage, bobPrivateKey, alicePublicKeys);
	console.log(decryptedMessage.toString());
})();
```

### Get Card by its ID

Use the following lines of code to get a user's card from Virgil Cloud by its ID:

```javascript
cardManager.getCard('f4bf9f7fcbedaba0392f108c59d8f4a38b3838efb64877380171b54475c2ade8')
.then(card => {
    console.log('Got: ', card);
});
```

### Get Card by user's identity

For a single user, use the following lines of code to get a user's Card by a user's `identity`:

```javascript
cardManager.searchCards('alice@example.com')
.then(cards => {
    cards.map(card => console.log(card.id));
});
```

## Docs

* [Developer Documentation](https://developer.virgilsecurity.com/)
* [API Reference](https://virgilsecurity.github.io/virgil-sdk-javascript/)

## License

This library is released under the [3-clause BSD License](LICENSE).

## Support

Our developer support team is here to help you. Find out more information on our [Help Center](https://help.virgilsecurity.com/).

You can find us on [Twitter](https://twitter.com/VirgilSecurity) or send us email support@VirgilSecurity.com.

Also, get extra help from our support team on [Slack](https://virgilsecurity.com/join-community).
