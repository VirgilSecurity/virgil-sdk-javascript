# Validating Card

This guide shows how to validate a **Virgil Card** on a device. As previously noted, each Virgil Card contains a Digital signature that provides data integrity for the Virgil Card over its life cycle. Therefore, developers can verify the Digital Signature at any time.

During the validation process we verify, by default, two signatures:
- **from Virgil Card owner**
- **from Virgil Services**

Additionally, developers can verify the **signature of the application server**.

Set up your project environment before you begin to validate a Virgil Card, with the [getting started](/documentation/guides/configuration/client-side) guide.

In order to validate the signature of the Virgil Card owner, **Virgil Services**, and the Application Server, we need to:

```javascript
var appPublicKey = new Buffer("[YOUR_APP_PUBLIC_KEY_HERE]", "base64");

// initialize High Level Api with custom verifiers
var api = virgil.API({
    accessToken: "[YOUR_ACCESS_TOKEN_HERE]",
    cardVerifiers: [{
        cardId: "[YOUR_APP_CARD_ID_HERE]",
        publicKeyData: appPublicKey
    }]
});

api.cards.find("alice")
    .then(function (aliceCards) {
        // Alice's cards passed integrity checks
    });
```
