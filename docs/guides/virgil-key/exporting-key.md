# Exporting Virgil Key

This guide shows how to export a **Virgil Key** to the string representation.

Before you begin to export a Virgil Key, set up your project environment with the [getting started](/docs/guides/configuration/client-configuration) guide.

To export the Virgil Key:

- Initialize **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Alice Generates a Virgil Key
- After Virgil Key generated, developers can export Alice's Virgil Key to the Base64 encoded string

```javascript
// generate Virgil Key
var key = api.keys.generate();
// export Virgil Key
var exportedKey = key.export("[OPTIONAL_KEY_PASSWORD]").toString("base64");
```

Developers also can extract Public Key from a Private Key using the Virgil CLI.
