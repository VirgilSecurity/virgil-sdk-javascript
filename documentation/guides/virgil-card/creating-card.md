# Creating Card

This guide shows how to create a user's **Virgil Card** – the main entity of **Virgil Services**. Every user/device is represented by Virgil Card with all the necessary information to identify them.

Every developer can create a user's **Virgil Card** (visible within the Application) or **Global Virgil Card** (visible to anybody and not related to the Application).

See our [Use Cases](https://github.com/VirgilSecurity/virgil-sdk-javascript/tree/docs-review/documentation/get-started) to find out what you can do with Virgil Cards. If you need to create a Global Virgil Card, start with the guide, [Creating a Global Card](/guides/virgil-card/creating-global).

After a Virgil Card is created, it's published at Virgil Card Service, where an owner can find their Virgil Cards at any time.

Warning: You cannot change a Virgil Card's content after it is published.

Each Virgil Card contains a  permanent digital signature that provides data integrity for the Virgil Card over its life-cycle.



### Let's start to create a user's Virgil Card

Set up your project environment before you begin to create a user's Virgil Card, with the [getting started](/guides/configuration/client-side) guide.


The Virgil Card creation procedure is shown in the figure below.

![Virgil Card Generation](/documentation/img/Card_introduct.png "Create Virgil Card")


In order to create a Virgil Card:

1. Developers need to initialize the **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

Users' Virgil Card creation is carried out on the client side.

2. Once the SDK is ready, we can proceed to the next step:
  – Generate and save a **Virgil Key** (it's also necessary to enter the Virgil Key's name and password)
  – Create a Virgil Card using the recently generated Virgil Key


  ```javascript
  // generate and save Virgil Key
  var aliceKey = api.keys.generate();
  aliceKey.save("[KEY_NAME]", "[KEY_PASSWORD]")
      .then(function () {
          // create Virgil Card
          var aliceCard = api.cards.create("alice", aliceKey);
      });
  ```

The Virgil Key will be saved into default device storage. Developers can also change the Virgil Key's storage directory as needed during Virgil SDK initialization.

Warning: Virgil doesn't keep a copy of your Virgil Key. If you lose a Virgil Key, there is no way to recover it.

3. Developers have to transmit the Virgil Card to the App's server side where it will be signed, validated and then published on Virgil Services (this is necessary for further operations with the Virgil Card).

```javascript
// export Virgil Card to base64-encoded string
var exportedAliceCard = aliceCard.export();
```

#{ export "import_card" }
```javascript
// import Virgil Card
var aliceCard = api.cards.import(exportedAliceCard);
```

A user's Virgil Card is related to its Application, so the developer must identify their Application.

On the Application's Server Side, one must:

 - Initialize the Virgil SDK and enter the Application **credentials** (**App ID**, **App Key**, and **App Key password**).

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

-  Import a Virgil Card from its string representation.

```javascript
// import Virgil Card
var aliceCard = api.cards.import(exportedAliceCard);
```

-  Then publish a Virgil Card on Virgil Services.

```javascript
// publish Virgil Card
api.cards.publish(aliceCard)
    .then(function () {
        // Virgil Card is published
    });
```

Developers also can create a Virgil Card using the Virgil CLI.
