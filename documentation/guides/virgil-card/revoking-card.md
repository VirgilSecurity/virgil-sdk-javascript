# Revoking Card

This guide shows how to revoke a **Virgil Card** from Virgil Services.

Set up your project environment before you begin to revoke a Virgil Card, with the [getting started](/documentation/guides/configuration/client-configuration.md) guide.

In order to revoke a Virgil Card, we need to:

- Initialize the **Virgil SDK** and enter Application **credentials** (**App ID**, **App Key**, **App Key password**)

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

- Get Alice's Virgil Card by **ID** from **Virgil Services**
- Revoke Alice's Virgil Card from Virgil Services

```javascript
// get Virgil Card by ID
api.cards.get("[ALICE_CARD_ID]")
    .then(function (aliceCard) {
        // revoke Virgil Card
        return api.cards.revoke(aliceCard);
    })
    .then(function () {
        // Virgil Card revoked
    });
```
