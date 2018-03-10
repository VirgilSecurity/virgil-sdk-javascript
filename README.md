# Virgil Security JavaScript SDK

[![GitHub license](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](https://github.com/VirgilSecurity/virgil/blob/master/LICENSE)
![npm](https://img.shields.io/npm/v/virgil-sdk.svg)

[SDK Features](#sdk-features) | [Installation](#installation) | [Initialization](#initialization) | [Usage Examples](#usage-examples) | [Docs](#docs) | [Support](#support)

<a href="https://virgilsecurity.com"><img width="230px" src="logo.png" align="left" hspace="10" vspace="6"></a> [Virgil Security](https://virgilsecurity.com) provides a set of APIs for adding security to any application. In a few simple steps you can encrypt communication, securely store data, provide passwordless login, and ensure data integrity.

The Virgil SDK allows developers to get up and running with Virgil API quickly and add full end-to-end security to their existing digital solutions to become HIPAA and GDPR compliant and more.

## SDK Features
- communicate with [Virgil Cards Service][_cards_service]
- manage users' Public Keys
- store private keys in secure local storage
- use Virgil [Crypto library][_virgil_crypto]

## Installation

This client can be used both __server-side__ in a Node application, and __client-side__ in a web browser.

This module requires node.js >= 4 and can be installed via NPM.

```sh
npm install virgil-sdk --save
```

> **Important!** You will need node.js version >= 4 to use virgil-sdk.  
If you have a different version you can use [nvm](https://github.com/creationix/nvm)
(or a similar tool) to install Node.js of supported version alongside your current installation.  
If you only intend to use virgil-sdk in a browser environment, you can ignore this warning.

The client-side SDK targets ECMAScript5+ compatible browsers.

```html
<script
src="https://cdn.virgilsecurity.com/packages/javascript/sdk/4.5.3/virgil-sdk.min.js"
crossorigin="anonymous"></script>
```

Alternatively [download the source code](https://github.com/VirgilSecurity/virgil-sdk-javascript/releases) into your application.

> __Warning:__
> Please note that in the browser environment we use Web Workers
to invoke some cryptographic operations. As a result, Chrome and Opera will raise an error unless the code is executed on an actual proper domain:

> `"Uncaught SecurityError: Script at '[blob url here]' cannot be accessed from origin 'null'."`


## Initialization

Be sure that you have already registered at the [Dev Portal](https://developer.virgilsecurity.com/account/signin) and created your application.

To initialize the SDK at the __Client Side__ you need only the __Access Token__ created for a client at Dev Portal. The Access Token helps to authenticate client's requests.

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

To initialize the SDK at the __Server Side__ you need the application credentials (__Access Token__, __App ID__, __App Key__ and __App Key Password__) you got during Application registration at the Dev Portal.

```javascript
var virgil = require("virgil-sdk");
var appKey = require("fs").readFileSync("/path/to/app/key");
var client = virgil.API({
    accessToken: "[ACCESS_TOKEN]",
    appCredentials: {
        appId: "[APP_ID]",
        appKeyData: appKey,
        appKeyPassword: "[APP_KEY_PASSWORD]"
    }
});
```

## Usage Examples

#### Generate and publish user's Cards with Public Keys inside on Cards Service
Use the following lines of code to create and publish a user's Card with Public Key inside on Virgil Cards Service:

```js
// generate and save Virgil Key in key storage on a device
var aliceKey = api.keys.generate();
aliceKey.save("[KEY_NAME]", "[KEY_PASSWORD]")
    .then(function () {
        // create a user's Virgil Card
        var aliceCard = api.cards.create("alice", aliceKey);
    });

// export the Virgil Card to a base64-encoded string
var exportedAliceCard = aliceCard.export();

// transmit the Card to your App Server
// import the Virgil Card from a string
var aliceCard = api.cards.import(exportedAliceCard);

// publish the Virgil Card on the Virgil Cards Service
api.cards.publish(aliceCard)
    .then(function () {
        // Virgil Card is published
    });
```

#### Sign then encrypt data

Virgil SDK lets you use a user's Private key and his or her Cards to sign, then encrypt any kind of data.

In the following example, we load a Private Key from a customized Key Storage and get recipient's Card from the Virgil Cards Services. Recipient's Card contains a Public Key on which we will encrypt the data and verify a signature.

```js
Promise.all([
    // load a Key from a key storage
    api.keys.load("[KEY_NAME]", "[KEY_PASSWORD]"),
    // search for Cards on Virgil Cards Service
    api.cards.find("bob")
]).then(function(results) {
    var aliceKey = results[0];
    var bobCards = results[1];
    // prepare a message
    var message = "Hey Bob, how's it going?";
    // sign then encrypt the message
    var encryptedData = aliceKey
      .signThenEncrypt(message, bobCards).toString("base64");
});
```

#### Decrypt then verify data
Once the Users receive the signed and encrypted message, they can decrypt it with their own Private Key and verify signature with a Sender's Card:

```js
Promise.all([
    // load a Key from a key storage
    api.keys.load("[KEY_NAME]", "[KEY_PASSWORD]"),
    // search for a Card on Virgil Cards Service
    api.cards.find("alice")
]).then(function(results) {
    var bobKey = results[0];
    var aliceCards = results[1];
    var alicePhoneCard = aliceCards.find(function (card) {
      return card.device === "iPhone7";
    });
    // decrypt the message
    var originalMessage = bobKey
      .decryptThenVerify(encryptedData, alicePhoneCard).toString();
});
```

## Docs
Virgil Security has a powerful set of APIs, and the documentation below can get you started today.

In order to use the Virgil SDK with your application, you will need to first configure your application. By default, the SDK will attempt to look for Virgil-specific settings in your application but you can change it during SDK configuration.

* [Configure the SDK][_configure_sdk] documentation
  * [Setup authentication][_setup_authentication] to make API calls to Virgil Services
  * [Setup Card Manager][_card_manager] to manage user's Public Keys
  * [Setup Card Verifier][_card_verifier] to verify signatures inside of user's Card
  * [Setup Key storage][_key_storage] to store Private Keys
* [More usage examples][_more_examples]
  * [Create & publish a Card][_create_card] that has a Public Key on Virgil Cards Service
  * [Search user's Card by user's identity][_search_card]
  * [Get user's Card by its ID][_get_card]
  * [Use Card for crypto operations][_use_card]
* [Reference API][_reference_api]

## License

This library is released under the [3-clause BSD License](LICENSE).

## Support

Our developer support team is here to help you.

You can find us on [Twitter](https://twitter.com/VirgilSecurity) or send us email support@VirgilSecurity.com.

Also, get extra help from our support team on [Slack](https://join.slack.com/t/VirgilSecurity/shared_invite/enQtMjg4MDE4ODM3ODA4LTc2OWQwOTQ3YjNhNTQ0ZjJiZDc2NjkzYjYxNTI0YzhmNTY2ZDliMGJjYWQ5YmZiOGU5ZWEzNmJiMWZhYWVmYTM).


[_virgil_crypto]: https://github.com/VirgilSecurity/virgil-crypto
[_cards_service]: https://developer.virgilsecurity.com/docs/api-reference/card-service/v4
[_use_card]: https://developer.virgilsecurity.com/docs/js/how-to/public-key-management/v4/use-card-for-crypto-operation
[_get_card]: https://developer.virgilsecurity.com/docs/js/how-to/public-key-management/v4/get-card
[_search_card]: https://developer.virgilsecurity.com/docs/js/how-to/public-key-management/v4/search-card
[_create_card]: https://developer.virgilsecurity.com/docs/js/how-to/public-key-management/v4/create-card
[_key_storage]: https://developer.virgilsecurity.com/docs/js/how-to/setup/v4/setup-key-storage
[_card_verifier]: https://developer.virgilsecurity.com/docs/js/how-to/setup/v4/setup-card-verifier
[_card_manager]: https://developer.virgilsecurity.com/docs/js/how-to/setup/v4/setup-card-manager
[_setup_authentication]: https://developer.virgilsecurity.com/docs/js/how-to/setup/v4/setup-authentication
[_services_reference_api]: https://developer.virgilsecurity.com/docs/api-reference
[_configure_sdk]: https://developer.virgilsecurity.com/docs/how-to#sdk-configuration
[_more_examples]: https://developer.virgilsecurity.com/docs/how-to#public-key-management
[_reference_api]: https://developer.virgilsecurity.com/docs/api-reference
