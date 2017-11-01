# Creating Signature

This guide is a short tutorial on how to create a **Digital Signature** with Virgil Security. A valid digital signature gives a recipient reason to believe that the message was created by a known sender, that the sender cannot deny having sent the message, and that the message was not altered in transit. It can be used with any kind of message – whether it is encrypted or not.

See our [Use Cases](/docs/get-started) to find out what you can do with Digital Signature.

Set up your project environment before starting to create a Digital Signature, with the [getting started](/docs/guides/configuration/client.md) guide.

The **Signature Creation** procedure is shown in the figure below.

![Virgil Signature Intro](/docs/img/Signature_introduction.png "Create Signature")

To create a Digital Signature and sign the message, Alice needs her **Virgil Key**.


Let's review the **Digital Signature** creation process:

- Developers need to initialize the **Virgil SDK**

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

- Load Alice's Virgil Key from the protected storage and enter the Virgil Key password;

```javascript
// load Virgil Key
api.keys.load("[KEY_NAME]", "[KEY_PASSWORD]")
  .then(function (key) {

  });
```

To load the Virgil Key from a specific storage, developers need to change the storage path during Virgil SDK initialization.

Then Alice has to:
- Prepare the information for the message to Bob
- Sign the message using her Virgil Key

```javascript
// prepare message
var message = "Hey Bob, hope you are doing well.";

// generate signature
var signature = aliceKey.sign(message);
```

See our guide on [Loading Keys](/docs/guides/virgil-key/loading-key.md) for more examples.

Alice can now send a signed message to Bob.
