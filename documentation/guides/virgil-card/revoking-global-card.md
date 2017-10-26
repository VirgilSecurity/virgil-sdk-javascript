# Revoking Global Card

This guide shows how to revoke a **Global Virgil Card**.

Set up your project environment before you begin to revoke a Global Virgil Card, with the [getting started](/documentation/guides/configuration/client-configuration.md) guide.

In order to revoke a Global Virgil Card, we need to:

-  Initialize the Virgil SDK

```javascript
var fs = require('fs');
var api = virgil.API({
    accessToken: "[YOUR_ACCESS_TOKEN_HERE]",
    appCredentials: {
        appId: "[YOUR_APP_ID_HERE]",
        appKeyData: fs.readFileSync("[YOUR_APP_KEY_FILEPATH_HERE]"),
        appKeyPassword: "[YOUR_APP_KEY_PASSWORD_HERE]",
    }
});
```

- Load Alice's **Virgil Key** from the secure storage provided by default
- Load Alice's Virgil Card from **Virgil Services**
- Initiate the Card's identity verification process
- Confirm the Card's identity using a **confirmation code**
- Revoke the Global Virgil Card from Virgil Services

```javascript
function onLoadKey(key) {
    // Get Virgil Card by Id
    return api.cards.get("[ALICE_CARD_ID]")
        .then(function (card) {
          return onGetCardAndKey(card, key);
        });
}

function onGetCardAndKey(card, key) {
    // Initiate identity verification process
    return card.checkIdentity()
        .then(function (confirmIdentity) {
            // confirm the identity
            return confirmIdentity("[CONFIRMATION_CODE]");
        })
        .then(function (token) {
            return onConfirmIdentity(card, key, token);
        });
}

function onConfirmIdentity(card, key, token) {
    // Revoke Virgil Card
    return api.cards.revokeGlobal(card, key, token);
}

// Load Virgil Key
api.keys.load("[KEY_NAME]", "[KEY_PASSWORD]")
  .then(onLoadKey)
  .then(function () {
      // Virgil Card is revoked
  });
```
