# Exporting Card

This guide shows how to export a **Virgil Card** to the string representation.

Set up your project environment before you begin to export a Virgil Card, with the [getting started](https://github.com/VirgilSecurity/virgil-sdk-javascript/blob/docs-review/documentation/guides/configuration/client-side) guide.

In order to export a Virgil Card, we need to:

- Initialize the **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Use the code below to export the Virgil Card to its string representation.

```javascript
// export Virgil Card to base64-encoded string
var exportedAliceCard = aliceCard.export();
```

The same mechanism works for **Global Virgil Card**.
