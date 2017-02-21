# Virgil Security JavaScript SDK
[![npm](https://img.shields.io/npm/v/virgil-sdk.svg)](npmjs)
[![Contact Support](https://img.shields.io/badge/contact-support-yellow.svg)][support]

[Installation](#installation) | [Get Started](#get-started) | [Initialization](#initialization)

VirgilSecurity provides a set of APIs for adding security to your applications. With a few simple API calls you can send encrypt communication, securely store data, provide passwordless login, and ensure data integrity.

For more details see the Javascript documentation on [virgilsecurity.com/docs/javascript](js_getstarted)

## Installation

This client can be used both server-side in a Node application, and client-side in a web browser. Initialization for each side is slightly different.

#### Server-side

This module requires Node 0.12+ and can be installed via NPM.

```sh
npm install virgil-sdk --save
```

__Next:__ [Get Started with the JS SDK](js_getstarted).

#### Client-side

The client-side SDK targets ECMAScript5+ compatible browsers.

```html
<script
src="https://cdn.virgilsecurity.com/packages/javascript/sdk/4.0.0/virgil-sdk.min.js"
crossorigin="anonymous"></script>
```

Alternatively [download the source code](https://github.com/VirgilSecurity/virgil-sdk-javascript/releases)

> __Warning:__
> Please note that in the browser environment we use Web Workers
to invoke some cryptographic operations. As a result, Chrome and Opera will raise an error unless the code is executed on an actual proper domain:
>
> `"Uncaught SecurityError: Script at '[blob url here]' cannot be accessed from origin 'null'."`

__Next:__ [Get Started with the JS SDK](js_getstarted).

## Getting Started

Virgil Security makes encryption super easy to add to any application. With our SDK you create a public __Virgil Card__ for each user. With these in place you can easily encrypt any data in the client.

```js
// find Alice's card(s)
virgil.cards.find(["alice"])
  .then(function (cards) {
    // encrypt the message using Alice's cards
    var message = "Hello Alice!";
    var encryptedMessage = virgil.encryptFor(message, cards);
    // transmit the message with your preferred technology
    transmitMessage(encryptedMessage.toString("base64"));
  });
```

On the receiving client decryption can be achieved with that user's stored key.


```js
// load Alice's Key from storage.
virgil.keys.load("alices_key_1", "mypassword")
  .then(function (key) {
    // decrypt the message using the key
    var data = key.decrypt(transferData).toString();
  });
```

__Next:__ Learn more about [encryption](js_getstarted_encryption), [storage](js_getstarted_storage), [data integrity](js_getstarted_data_integrity) and [passwordless login](js_getstarted_passwordless_login).


## Initialization

To use this SDK you first need to [sign up for an account ](https://developer.virgilsecurity.com/account/signup) and create your first __application__. Make sure to save your __private key__ for your application.

After the application is ready, create an __application token__. Your app will use this to make authenticated requests from your clients. A final thing to note down is your application's __app id__.

#### Browser Initialization

To initialize the SDK in a web browser we will only need the __access token__ we created.

```javascript
var client = virgil.client("[ACCESS_TOKEN]");
```

> __Note:__ this client will have limited capabilities. For example, it will be able to generate new __Cards__ but it will need a server side client to transmit these to Virgil.

#### Server-Side Initialization


```javascript
var Virgil = require("virgil-sdk");
var appKey = require("fs").readFileSync("/path/to/app/key");
var virgil = Virgil({
    accessToken: "[ACCESS_TOKEN]",
    appCredentials: {
        appId: "[APP_ID]",
        appKeyData: appKey,
        appKeyPassword: "[APP_KEY_PASSWORD]"
    }
});
```

Next: [Learn more about our initializing the Javascript SDK](js_guide_initialization) in our documentation.

## Documentation

Virgil Security has a powerful set of APIs and our documentation is here to get you started today.

* [Get Started](#get_started_root) documentation
  * [Initialize the SDK](#initialize_root)
  * [Encrypted storage](#encrypted_storage)
  * [Encrypted communication](#encrypted_comms)
  * [Data integrity](#data_integrity)
  * [Passwordless login](#passwordless_login)

Alternatively, head over to our [Reference documentaton](#reference_docs) for in-depth information about every SDK method, it's arguments and return types.

## License

This library is released under the [3-clause BSD License](LICENSE).

## Help

Our developer support team is here to help you. You can find us on [Twitter](https://twitter.com/virgilsecurity) and [email](support).


[support]: mailto:support@virgilsecurity.com
[js_getstarted]: https://virgilsecurity.com/docs/js/get_started
[js_getstarted_encryption]: https://virgilsecurity.com/docs/js/encryption
[js_getstarted_storage]: https://virgilsecurity.com/docs/js/storage
[js_getstarted_data_integrity]: https://virgilsecurity.com/docs/js/data_integrity
[js_getstarted_passwordless_login]: https://virgilsecurity.com/docs/js/passwordless_login
[js_guide_initialization]: https://virgilsecurity.com/docs/js/guides/initialization
[npmjs]: https://www.npmjs.com/package/virgil-sdk
