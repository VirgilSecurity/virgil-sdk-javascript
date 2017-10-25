# Saving Key

This guide shows how to save a **Virgil Key** from the default storage after its [generation](/guides/virgil-key/generating).

Set up your project environment before you begin to generate a Virgil Key, with the [getting started](/documentation/guides/configuration/client-side) guide.

In order to save the Virgil Key we need to:

- Initialize the **Virgil SDK**:

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Save Alice's Virgil Key in the protected storage on the device

```javascript
// save Alice's Virgil Key in storage
aliceKey.save("[KEY_NAME]", "[KEY_PASSWORD]")
    .then(function () {
        // Alice's key is saved
    });
```

Developers can also change the Virgil Key storage directory as needed, during Virgil SDK initialization.
