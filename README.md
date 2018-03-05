# Virgil Security JavaScript SDK

[![npm](https://img.shields.io/npm/v/virgil-sdk.svg)][npmjs]
[![Contact Support](https://img.shields.io/badge/contact-support-yellow.svg)][support]

[Installation](#installation) | [Encryption Example](#encryption-example) | [Initialization](#initialization) | [Documentation](#documentation) | [Support](#support)

[Virgil Security](https://virgilsecurity.com) provides a set of APIs for adding security to any application. In a few simple steps you can encrypt communication, securely store data, provide passwordless login, and ensure data integrity.

To initialize and use Virgil SDK, you need to have [Developer Account](https://dashboard.virgilsecurity.com).

## Installation

This module can be used both __server-side__ in a Node application, and __client-side__ in a web browser.

### On a server

This module can be installed via NPM.

```sh
npm install virgil-sdk --save
```

> **Important!** You will need node.js version >= 4 to use virgil-sdk.  
If you have a different version you can use [nvm](https://github.com/creationix/nvm) 
(or a similar tool) to install Node.js of supported version alongside your current installation.  
If you only intend to use virgil-sdk in a browser environment, you can ignore this warning.
__Next:__ [Get Started with the JS SDK][js_getstarted].

### In the browser

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

__Next:__ [Get Started with the JS SDK][js_getstarted].

## Encryption Example

Virgil Security makes it super easy to add encryption to any application. With our SDK you create a public [__Virgil Card__][glossary_virgil_card] for every one of your users and devices. With these in place you can easily encrypt any data in the client.

```js
// find Alice's card(s)
client.cards.find(["alice"])
  .then(function (cards) {
    // encrypt the message using Alice's cards
    var message = "Hello Alice!";
    var encryptedMessage = client.encryptFor(message, cards);
    // transmit the message with your preferred technology
    // this method must be implemented by the developer
    transmitMessage(encryptedMessage.toString("base64"));
  });
```

The receiving user then uses their stored __private key__ to decrypt the message.


```js
// load Alice's Key from storage.
client.keys.load("alices_key_1", "alices_password")
  .then(function (key) {
    // decrypt the message using the key
    var message = key.decrypt(transferData).toString();
  });
```

__Next:__ To [get you properly started][_guides_virgil_cards] you'll need to know how to create and publish Virgil Cards. Our [Get Started guide][_guides_virgil_cards] will get you there all the way.

__Also:__ [Encrypted communication][js_getstarted_encrypted_comms] is just one of the few things our SDK can do. Have a look at our guides on  [Encrypted Storage][js_getstarted_storage] and [Data Integrity][js_getstarted_data_integrity] for more information.


## Initialization

To use this SDK you need to [sign up for an account](https://dashboard.virgilsecurity.com/signup) and create your first __application__. 
Make sure the API version you select is V4. Also make sure to save the __app id__, __private key__ and it's __password__. After this, create an __application token__ for your application to make authenticated requests from your clients.

### In the browser

To initialize the SDK in a web browser you will only need the __access token__ you created.

```js
var client = virgil.API("[ACCESS_TOKEN]");
```

> __Note:__ this client will have limited capabilities. For example, it will be able to generate new __Cards__ but it will need a server-side client to transmit these to Virgil.

### On a server

To initialize the SDK on the server side we will need the __access token__, __app id__ and the __App Key__ you created on the [Developer Dashboard](https://developer.virgilsecurity.com/account/dashboard).

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
