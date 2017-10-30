# Finding Card

This guide shows how to find a **Virgil Card**. As previously noted, all Virgil Cards are saved at **Virgil Services** after their publication. Thus, every user can find their own Virgil Card or another user's Virgil Card on Virgil Services. It should be noted that users' Virgil Cards will only be visible to application users. Global Virgil Cards will be visible to anybody.

Set up your project environment before you begin to find a Virgil Card, with the [getting started](/docs/guides/configuration/client.md) guide.


In order to search for an **Application** or **Global Virgil Card** you need to initialize the **Virgil SDK**:

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```


### Application Cards

There are two ways to find an Application Virgil Card on Virgil Services:

The first one allows developers to get the Virgil Card by its unique **ID**

```javascript
api.cards.get("[ALICE_CARD_ID]")
    .then(function (aliceCard) {
        // Do something with aliceCard
    });
```

The second one allows developers to find Virgil Cards by *identity* and *identityType*

```javascript
// search for all Virgil Cards.
api.cards.find("alice")
    .then(function(aliceCards) {
        // do something with Alice's Virgil Cards
    });

// Virgil cards with type 'member'
api.cards.find(["bob"], "member")
    .then(function(bobCards) {
        // do something with Bob's Virgil Cards
    });
```



### Global Cards

```javascript
// search for all Global Virgil Cards
api.cards.findGlobal("bob@virgilsecurity.com")
    .then(function(bobGlobalCards) {
        // do something with Bob's Global Virgil Cards
    });
// search for Application Virgil Card
api.cards.findGlobal("com.username.appname", virgil.IdentityType.APPLICATION)
    .then(function(appCards) {
        // do something with Application Virgil Cards
    });
```
