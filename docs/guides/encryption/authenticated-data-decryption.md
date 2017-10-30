# Authenticated Data Decryption

This guide is short tutorial on how to decrypt and then verify data with Virgil Security.

This process is called **Authenticated Data Decryption**. During this procedure you work with encrypted and signed data, decrypting and verifying them. A recipient uses their **Virgil Key** (to decrypt the data) and **Virgil Card** (to verify data integrity).


Set up your project environment before you begin to work, with the [getting started](/docs/guides/configuration/client.md) guide.

The Authenticated Data Decryption procedure is shown in the figure below.

![Virgil Intro](/docs/img/Guides_introduction.png "Authenticated Data Decryption")

In order to decrypt and verify the message, Bob has to have:
 - His Virgil Key
 - Alice's Virgil Card

Let's review how to decrypt and verify data:

1. Developers need to initialize the **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

2. Then Bob has to:


 - Load his own Virgil Key from secure storage, defined by default
 - Search for Alice's Virgil Card on **Virgil Services**
 - Decrypt the message using his Virgil Key and verify it using Alice's Virgil Card

 ```javascript
 Promise.all([
     // load key
     api.keys.load("[KEY_NAME]", "[KEY_PASSWORD]"),
     // search for Card
     api.cards.find("alice")
 ]).then(function(results) {
     var bobKey = results[0];
     var aliceCards = results[1];
     var alicePhoneCard = aliceCards.find(function (card) {
       return card.device === "iPhone7";
     });
     // decrypt the message
     var originalMessage = bobKey
       .decryptThenVerify(encryptedData, alicePhoneCard).toString();
 });
 ```

To load a Virgil Key from a specific storage, developers need to change the storage path during Virgil SDK initialization.

To decrypt data, you will need Bob's stored Virgil Key. See the [Storing Keys](/docs/guides/virgil-key/saving-key.md) guide for more details.
