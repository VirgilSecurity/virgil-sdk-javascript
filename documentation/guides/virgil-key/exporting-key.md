# Exporting Virgil Key

This guide shows how to export a **Virgil Key** to the string representation.

Set up your project environment before you begin to export a Virgil Key, with the [getting started](/documentation/guides/configuration/client-side) guide.

In order to export the Virgil Key:

- Initialize **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Alice Generates a Virgil Key
- After Virgil Key generation, developers can export Alice's Virgil Key to a Base64 encoded string

```javascript
// generate Virgil Key
var key = api.keys.generate();
// export Virgil Key
var exportedKey = key.export("[OPTIONAL_KEY_PASSWORD]").toString("base64");
```

Developers also can extract Public Key from a Private Key using the Virgil CLI.
