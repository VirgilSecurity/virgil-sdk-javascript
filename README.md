# Virgil Security JavaScript SDK

![npm](https://img.shields.io/npm/v/virgil-sdk.svg)
[![Contact Support](https://img.shields.io/badge/contact-support-yellow.svg)][support]

[Installation](#installation) | [Initialization](#initialization) | [Encryption / Decryption Example](#encryption-example) | [Documentation](#documentation) | [Support](#support)

[Virgil Security](https://virgilsecurity.com) provides a set of APIs for adding security to any application. In a few steps, you can encrypt communication, securely store data, provide passwordless authentication, and ensure data integrity.

To initialize and use Virgil SDK, you need to have [Developer Account](https://developer.virgilsecurity.com/account/signin).

## Installation

This client can be used both __server-side__ in a Node application, and __client-side__ in a web browser.

This module requires Node 4.0+ and can be installed via NPM.

```javascript
npm install virgil-sdk --save
```


The client-side SDK targets ECMAScript5+ compatible browsers.

```html
<script
src="https://cdn.virgilsecurity.com/packages/javascript/sdk/4.5.1/virgil-sdk.min.js"
crossorigin="anonymous"></script>
```

Alternatively [download the source code](https://github.com/VirgilSecurity/virgil-sdk-javascript/releases) into your application.

> __Warning:__
> Please note that in the browser environment we use Web Workers
to invoke some cryptographic operations. As a result, Chrome and Opera will raise an error unless the code is executed on an actual proper domain:

> `"Uncaught SecurityError: Script at '[blob url here]' cannot be accessed from origin 'null'."`


## Initialization

Be sure that you have already registered at the [Dev Portal](https://developer.virgilsecurity.com/account/signin) and created your application.

To initialize the SDK at the __Client Side__ you need only the __Access Token__ created for a client at [Dev Portal](https://developer.virgilsecurity.com/account/signin). The Access Token helps to authenticate client's requests.

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

To initialize the SDK at the __Server Side__ you need the application credentials (__Access Token__, __App ID__, __App Key__ and __App Key Password__) you got during Application registration at the [Dev Portal](https://developer.virgilsecurity.com/account/signin).

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

## Encryption / Decryption Example

Virgil Security simplifies adding encryption to any application. With our SDK you may create unique Virgil Cards for your all users and devices. With users' Virgil Cards, you can easily encrypt any data at Client Side.

```js
// find Alice's Virgil Card(s) at Virgil Services
client.cards.find(["alice"])
  .then(function (cards) {
    // encrypt the message using Alice's Virgil Cards
    var message = "Hello Alice!";
    var encryptedMessage = client.encryptFor(message, cards);
    // transmit the message with your preferred technology to Alice
    transmitMessage(encryptedMessage.toString("base64"));
  });
```

Alice uses her Virgil Private Key to decrypt the encrypted message.


```js
// load Alice's Private Virgil Key from local storage.
client.keys.load("alices_key_1", "mypassword")
  .then(function (key) {
    // decrypt the message using the Alice Private Virgil key
    var message = key.decrypt(transferData).toString();
  });
```

__Next:__ On the page below you can find configuration documentation and the list of our guides and use cases where you can see appliance of Virgil JS SDK


## Documentation

Virgil Security has a powerful set of APIs and the documentation to help you get started:

* [Get Started](/docs/get-started) documentation
  * [Encrypted storage](/docs/get-started/encrypted-storage.md)
  * [Encrypted communication](/docs/get-started/encrypted-communication.md)
  * [Data integrity](/docs/get-started/data-integrity.md)
* [Guides](/docs/guides)
  * [Virgil Cards](/docs/guides/virgil-card)
  * [Virgil Keys](/docs/guides/virgil-key)
  * [Encryption](/docs/guides/encryption)
  * [Signature](/docs/guides/signature)
* [Configuration](/docs/guides/configuration)
  * [Set Up Client Side](/docs/guides/configuration/client.md)
  * [Set Up Server Side](/docs/guides/configuration/server.md)

## License

This library is released under the [3-clause BSD License](LICENSE).

## Support

Our developer support team is here to help you. You can find us on [Twitter](https://twitter.com/virgilsecurity) and [email][support].

[support]: mailto:support@virgilsecurity.com
