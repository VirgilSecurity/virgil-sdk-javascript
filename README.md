> This README is for Virgil SDK v6. If you're here for the previous version (v5.3.x), check the [v5.3.x branch](https://github.com/VirgilSecurity/virgil-sdk-javascript/tree/v5.3.x) for Virgil SDK v5.3.x docs.

# Virgil Security JavaScript SDK

[![npm](https://img.shields.io/npm/v/virgil-sdk.svg)][npmjs]
[![Build status](https://img.shields.io/travis/VirgilSecurity/virgil-sdk-javascript.svg)](https://img.shields.io/travis/VirgilSecurity/virgil-sdk-javascript.svg)
[![GitHub license](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](https://github.com/VirgilSecurity/virgil/blob/master/LICENSE)

[Introduction](#introduction) | [SDK Features](#sdk-features) | [Installation](#installation) | [Usage Examples](#usage-examples) | [Docs](#docs) | [Support](#support)

## Introduction

<a href="https://developer.virgilsecurity.com/docs"><img width="230px" src="https://cdn.virgilsecurity.com/assets/images/github/logos/virgil-logo-red.png" align="left" hspace="10" vspace="6"></a>[Virgil Security](https://virgilsecurity.com) provides a set of APIs for adding security to any application. In a few simple steps you can encrypt communication, securely store data, provide passwordless login, and ensure data integrity.

The Virgil SDK allows developers to get up and running with Virgil API quickly and add full end-to-end security to their existing digital solutions to become HIPAA and GDPR compliant and more.

## SDK Features
- communicate with [Virgil Cards Service][_cards_service]
- manage users' Public Keys
- store private keys in secure local storage
- use Virgil [Crypto library][_virgil_crypto]
- use your own Crypto

## Installation

This module can be used both __server-side__ in a Node application, and __client-side__ in a web browser.

### On a server

The recommended way is to install from npm:

```sh
npm install virgil-sdk@6.0.0-alpha.4
```

You will also need to install the `virgil-crypto` package from npm, unless plan to use custom crypto
```sh
npm install virgil-crypto@4.0.0-alpha.13
```

### In the browser

The client-side SDK targets ECMAScript5+ compatible browsers. It is compatible with module bundlers like Rollup,
Webpack and Browserify. If you're using those, you need to install from npm. It can be added to the html page directly
 via `script` tag as well.

Note that the `virgil-crypto` script must also be added to the page.

```html
<script type="text/javascript" src="https://unpkg.com/virgil-crypto@4.0.0-alpha.13/dist/browser.umd.js"></script>
<script type="text/javascript" src="https://unpkg.com/virgil-sdk@6.0.0-alpha.4/dist/virgil-sdk.browser.umd.js"></script>
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

## Usage Examples

Before start practicing with the usage examples be sure that the SDK is configured. Check out our
[SDK configuration guides][_configure_sdk] for more information.

#### Generate and publish user's Cards with Public Keys inside on Cards Service

Use the following code to create and publish a user's Card with Public Key inside on Virgil Cards Service:

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
		new VirgilPrivateKeyExporter(
			virgilCrypto,
			'[OPTIONAL_PASSWORD_TO_ENCRYPT_THE_KEYS_WITH]'
		)
	);

	// Generate a key pair
	const keyPair = virgilCrypto.generateKeys();

	// Store the private key
	await privateKeyStorage.save('alice_private_key', keyPair.privateKey);

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

#### Sign then encrypt data

Virgil SDK lets you use a user's Private key and his or her Cards to sign and encrypt any kind of data.

In the following example, we load a Private Key from persistent storage and get recipient's Card from the Virgil Cards
Service.

Recipient's Card contains a Public Key which we will use to encrypt the data and verify the signature.

```javascript
import { initCrypto, VirgilCrypto, VirgilPrivateKeyExporter } from 'virgil-crypto';
import { PrivateKeyStorage } from 'virgil-sdk';

(async function() {
	await initCrypto();

	const virgilCrypto = new VirgilCrypto();
	const privateKeyStorage = new PrivateKeyStorage(
		new VirgilPrivateKeyExporter(
			virgilCrypto,
			'[OPTIONAL_PASSWORD_TO_ENCRYPT_THE_KEYS_WITH]'
		)
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

#### Decrypt then verify data
Once the users receive the signed and encrypted message, they can decrypt it with their own private key and verify
the signature with the Sender's public key:

```javascript
import { initCrypto, VirgilCrypto, VirgilPrivateKeyExporter } from 'virgil-crypto';
import { PrivateKeyStorage } from 'virgil-sdk';

(async function() {
	await initCrypto();

	const virgilCrypto = new VirgilCrypto();
	const privateKeyStorage = new PrivateKeyStorage(
		new VirgilPrivateKeyExporter(
			virgilCrypto,
			'[OPTIONAL_PASSWORD_TO_ENCRYPT_THE_KEYS_WITH]'
		)
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
## Docs
Virgil Security has a powerful set of APIs, and the documentation below can get you started today.

In order to use the Virgil SDK with your application, you will need to first configure your application. By default,
the SDK will attempt to look for Virgil-specific settings in your application but you can change it during SDK
configuration.

* [Configure the SDK][_configure_sdk] documentation
  * [Setup authentication][_setup_authentication] to make API calls to Virgil Services
  * [Setup Card Manager][_card_manager] to manage user's Public Keys
  * [Setup Card Verifier][_card_verifier] to verify signatures inside of user's Card
  * [Setup Key storage][_key_storage] to store Private Keys
  * [Setup your own Crypto library][_own_crypto] inside of the SDK
* [More usage examples][_more_examples]
  * [Create & publish a Card][_create_card] that has a Public Key on Virgil Cards Service
  * [Search user's Card by user's identity][_search_card]
  * [Get user's Card by its ID][_get_card]
  * [Use Card for crypto operations][_use_card]
* [API Reference][_reference_api]


## License

This library is released under the [3-clause BSD License](LICENSE).

## Support
Our developer support team is here to help you. Find out more information on our [Help Center](https://help.virgilsecurity.com/).

You can find us on [Twitter](https://twitter.com/VirgilSecurity) or send us email support@VirgilSecurity.com.

Also, get extra help from our support team on [Slack](https://virgilsecurity.com/join-community).

[_virgil_crypto]: https://github.com/VirgilSecurity/virgil-crypto-javascript
[_cards_service]: https://developer.virgilsecurity.com/docs/api-reference/card-service/v5
[_use_card]: https://developer.virgilsecurity.com/docs/javascript/how-to/public-key-management/v5/use-card-for-crypto-operation
[_get_card]: https://developer.virgilsecurity.com/docs/javascript/how-to/public-key-management/v5/get-card
[_search_card]: https://developer.virgilsecurity.com/docs/javascript/how-to/public-key-management/v5/search-card
[_create_card]: https://developer.virgilsecurity.com/docs/javascript/how-to/public-key-management/v5/create-card
[_own_crypto]: https://developer.virgilsecurity.com/docs/javascript/how-to/setup/v5/setup-own-crypto-library
[_key_storage]: https://developer.virgilsecurity.com/docs/javascript/how-to/setup/v5/setup-key-storage
[_card_verifier]: https://developer.virgilsecurity.com/docs/javascript/how-to/setup/v5/setup-card-verifier
[_card_manager]: https://developer.virgilsecurity.com/docs/javascript/how-to/setup/v5/setup-card-manager
[_setup_authentication]: https://developer.virgilsecurity.com/docs/javascript/how-to/setup/v5/setup-authentication
[_reference_api]: http://virgilsecurity.github.io/virgil-sdk-javascript/
[_configure_sdk]: https://developer.virgilsecurity.com/docs/how-to#sdk-configuration
[_more_examples]: https://developer.virgilsecurity.com/docs/how-to#public-key-management
[npmjs]: https://www.npmjs.com/package/virgil-sdk
