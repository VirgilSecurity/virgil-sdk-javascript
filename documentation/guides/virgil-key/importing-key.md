# Importing Virgil Key

This guide shows how to export a **Virgil Key** from a Base64 encoded string representation.

Set up your project environment before you begin to import a Virgil Key, with the [getting started](/documentation/guides/configuration/client-configuration.md) guide.

In order to import a Virgil Key, we need to:

- Initialize **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Choose a Base64 encoded string
- Import the Virgil Key from the Base64 encoded string

```javascript
// import Virgil Key from base64-encoded string
var key = api.keys
    .import("[BASE64_ENCODED_VIRGIL_KEY]", "[OPTIONAL_KEY_PASSWORD]");

// OR
// Browsers
// var keyBuffer = new virgil.Buffer("[BASE64_ENCODED_VIRGIL_KEY]", "base64");
//// node.js
//// var keyBuffer = new Buffer("[BASE64_ENCODED_VIRGIL_KEY]", "base64");

// import Virgil Key from Buffer
// var key = api.keys.import(keyBuffer, "[OPTIONAL_KEY_PASSWORD]");
```
