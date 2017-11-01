# Creating Global Card

This guide demonstrates how to create a **Global Virgil Card**. The main feature of Global Virgil Cards is that these Cards contain an identity, which must be confirmed by a user/device. For these cases, Virgil Security has a **Virgil Identity Service** responsible for user identities **validation**. Validating a user occurs after another service – **Virgil RA Service**  authorizes the creation of Global Virgil Cards.

After a Global Virgil Card's creation, it's published at the Virgil Card Service, where an owner can find their Cards at any time.

**Warning**: You can not change a Global Virgil Card's content after its publishing.

Each Virgil Card contains a permanent digital signature that provides data integrity for the Virgil Card over its life-cycle.

### Let's start to create a Global Virgil Card

Set up your project environment before you begin to create a Global Virgil Card, with the [getting started](/docs/guides/configuration/client.md) guide.

The Global Virgil Card creation procedure is shown in the figure below.

![Card Intro](/docs/img/Card_intro.png "Create Global Virgil Card")

To create a Global Virgil Card:

1. Developers need to initialize the **Virgil SDK**

```javascript
var api = virgil.API();
```

2. Once the SDK is ready we can proceed to the next step:


- Generate and save the **Virgil Key** (it's also necessary to enter the Virgil Key's name and password).
- Create a Global Virgil Card using their recently generated Virgil Key (they will need to enter some identifying information).


```javascript
// generate and save Virgil Key
var aliceKey = api.keys.generate();
aliceKey.save("[KEY_NAME]", "[KEY_PASSWORD]")
    .then(function () {
        // create Virgil Card
        var aliceCard = api.cards.createGlobal(
            "alice@virgilsecurity.com",
            aliceKey,
            virgil.IdentityType.EMAIL
        );
    });
```

The Virgil Key will be saved into default device storage. Developers can also change the Virgil Key storage directory as needed, during Virgil SDK initialization.

**Warning**: Virgil doesn't keep a copy of your Virgil Key. If you lose a Virgil Key, there is no way to recover it.

3. Now, developers can initiate an identity verification process.
4. A User has to confirm a Virgil Card's identity using a **confirmation code** received by email.
5. Finally, developers must publish the User's Global Virgil Card on Virgil Services.

```javascript
// initiate verification
aliceCard.checkIdentity()
   .then(function (confirmIdentity) {
        // confirm identity
        return confirmIdentity("[CONFIRMATION_CODE]");
   })
   .then(function (token) {
        // publish the Virgil Card
        return api.cards.publishGlobal(aliceCard, token);
   })
   .then(function () {
        // Alice's card is published
   });
```
