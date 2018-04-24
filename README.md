# Virgil Security JavaScript SDK

[![npm](https://img.shields.io/npm/v/virgil-sdk.svg)][npmjs]
[![Contact Support](https://img.shields.io/badge/contact-support-yellow.svg)][support]

[Installation](#installation) | [Encryption Example](#encryption-example) | [Initialization](#initialization) | [Documentation](#documentation) | [Support](#support)

[Virgil Security](https://virgilsecurity.com) provides a set of APIs for adding security to any application. In a few simple steps you can encrypt communication, securely store data, provide passwordless login, and ensure data integrity.

To initialize and use Virgil SDK, you need to have [Developer Account](https://dashboard.virgilsecurity.com).

## Installation

This module can be used both __server-side__ in a Node application, and __client-side__ in a web browser.

### On a server

This module can be installed via NPM. This is a pre-release version, so to install from npm you need to 
specify the `next` tag

```sh
npm install virgil-sdk@next
```

> **Important!** You will need node.js version >= 6 to use virgil-sdk.  
If you have a different version you can use [nvm](https://github.com/creationix/nvm) 
(or a similar tool) to install Node.js of supported version alongside your current installation.  
If you only intend to use virgil-sdk in a browser environment, you can ignore this warning.
__Next:__ [Get Started with the JS SDK][js_getstarted].

### In the browser

The client-side SDK targets ECMAScript5+ compatible browsers.

```html
<script src="https://unpkg.com/virgil-sdk@next/dist/virgil-sdk.browser.umd.min.js"></script>
```

or [download the source code](https://github.com/VirgilSecurity/virgil-sdk-javascript/releases) into your application.

__Next:__ [Get Started with the JS SDK][js_getstarted].

## Encryption Example

Virgil Security makes it super easy to add encryption to any application. With our SDK you create a public [__Virgil Card__][glossary_virgil_card] for every one of your users and devices. With these in place you can easily encrypt any data in the client.

```js
const { VirgilCrypto } = require('virgil-crypto');
const virgilCrypto = new VirgilCrypto();
 
// find Alice's card(s)
cardManager.searchCards('alice')
	.then(function (cards) {
		// encrypt the message using Alice's cards
        const message = "Hello Alice!";
		const encryptedMessage = virgilCrypto.encrypt(message, cards.map(function () { return card.publicKey; }));
		// transmit the message with your preferred technology
		// this method must be implemented by the developer
		transmitMessage(encryptedMessage.toString("base64"));
	});
```

The receiving user then uses their stored __private key__ to decrypt the message.


```js
// load Alice's Key from storage.
const { VirgilCrypto } = require('virgil-crypto');
const { KeyStorage } = require('virgil-sdk');

const virgilCrypto = new VirgilCrypto();
const virgilKeyStorage = new KeyStorage();

virgilKeyStorage.load("alices_key_1")
	.then(function (rawPrivateKey) {
		const privateKey = virgilCrypto.importPrivateKey(rawPrivateKey, "alices_password");
		const message = virgilCrypto.decrypt(transferData, privateKey);
		console.log(message.toString());
	});
```

__Next:__ To [get you properly started][_guides_virgil_cards] you'll need to know how to create and publish Virgil Cards. Our [Get Started guide][_guides_virgil_cards] will get you there all the way.

__Also:__ [Encrypted communication][js_getstarted_encrypted_comms] is just one of the few things our SDK can do. Have a look at our guides on  [Encrypted Storage][js_getstarted_storage] and [Data Integrity][js_getstarted_data_integrity] for more information.


## Initialization

To use this SDK you need to [sign up for an account](https://dashboard.virgilsecurity.com/signup) and create your first __application__. 
Make sure the API version you select is V5. Also make sure to save the __application id__. Next, create an __api key__ 
and save its __private key__, and __id__. 

### In the browser

To initialize the SDK in a web browser you will need to provide a callback that will be used to get the JWT from _your_ 
 server.

```js
const { VirgilCardCrypto } = require('virgil-crypto');
const { CardManager, CallbackJwtProvider, VirgilCardVerifier } = require('virgil-sdk');

const cardCrypto = new VirgilCardCrypto();

// getVirgilJwt is a function, that returns a Promise, that resolves
// to a Virgil JWT
const jwtProvider = new CallbackJwtProvider(getVirgilJwt);
const cardVerifier = new VirgilCardVerifier(cardCrypto);

const cardManager = new CardManager({
	cardCrypto,
	accessTokenProvider: jwtProvider,
	retryOnUnauthorized: true,
	cardVerifier: cardVerifier
});
```

### On a server

To initialize the SDK on the server side we will need the __app id__, __api key private key__, the __api key id__ 
you created on the [Developer Dashboard](https://developer.virgilsecurity.com/account/dashboard).

```javascript
const { VirgilCrypto, VirgilAccessTokenSigner } = require('virgil-crypto');
const { JwtGenerator } = require('virgil-sdk');

const crypto = new VirgilCrypto();
const apiPrivateKey = crypto.importPrivateKey(process.env.API_PRIVATE_KEY);
	
const jwtGenerator = new JwtGenerator({
	appId: process.env.VIRGIL_APP_ID,
	apiKey: apiPrivateKey,
	apiKeyId: process.env.VIRGIL_API_KEY_ID,
	accessTokenSigner,
	millisecondsToLive: 20 * 60 * 1000
});
```

Next: [Learn more about our the different ways of initializing the Javascript SDK][js_guides_initialization] in our documentation.

## Documentation

Virgil Security has a powerful set of APIs, and the documentation is there to get you started today.

* [Get Started][js_getstarted] documentation
  * [Initialize the SDK][js_guides_initialize_root]
  * [Encrypted storage][js_getstarted_storage]
  * [Encrypted communication][js_getstarted_encrypted_comms]
  * [Data integrity][js_getstarted_data_integrity]
* [Guides][_guides]
  * [Virgil Cards][_guides_virgil_cards]
  * [Virgil Keys][_guides_virgil_keys]

Alternatively, head over to our [Reference documentaton](#reference_docs) for in-depth information about every SDK method, it's arguments and return types.

## License

This library is released under the [3-clause BSD License](LICENSE).

## Support

Our developer support team is here to help you. You can find us on [Twitter](https://twitter.com/virgilsecurity) and [email](support).

[support]: mailto:support@VirgilSecurity.com
[js_getstarted]: https://developer.virgilsecurity.com/docs/use-cases
[js_getstarted_encrypted_comms]: https://developer.virgilsecurity.com/docs/javascript/use-cases/v4/encrypted-communication
[js_getstarted_storage]: https://developer.virgilsecurity.com/docs/javascript/use-cases/v4/encrypted-storage
[js_getstarted_data_integrity]: https://developer.virgilsecurity.com/docs/javascript/use-cases/v4/data-integrity
[js_guides_initialization]: https://developer.virgilsecurity.com/docs/javascript/how-to/setup/v4/install-sdk
[js_guides_initialize_root]: https://developer.virgilsecurity.com/docs/how-to#sdk-configuration
[_guides]: https://developer.virgilsecurity.com/docs/how-to
[_guides_virgil_cards]: https://developer.virgilsecurity.com/docs/how-to#public-key-management
[_guides_virgil_keys]: https://developer.virgilsecurity.com/docs/how-to#cryptography
[npmjs]: https://www.npmjs.com/package/virgil-sdk
[glossary_virgil_card]: https://developer.virgilsecurity.com/docs/glossary#virgil-card
