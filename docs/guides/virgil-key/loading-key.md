# Loading Key

This guide shows how to load a private **Virgil Key**, which is stored on the device. The key must be loaded when Alice wants to **sign** some data, **decrypt** any encrypted content, and perform cryptographic operations.

Set up your project environment before you begin to load a Virgil Key, with the [getting started](/docs/guides/configuration/client.md) guide.

In order to load the Virgil Key from the default storage:

- Initialize the **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Alice has to load her Virgil Key from the protected storage and enter the Virgil Key's password

```javascript
// load Alice's Virgil Key from storage
api.keys.load("[KEY_NAME]", "[KEY_PASSWORD]")
    .then(function (aliceKey) {
        // use aliceKey
    });
```

To load a Virgil Key from a specific storage, developers need to change the storage path during Virgil SDK initialization.
