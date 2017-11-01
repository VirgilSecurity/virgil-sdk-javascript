# Client Configuration

To use the Virgil Infrastructure, set up your client and implement the required mechanisms using the following guide.


## Install SDK

The Virgil Javascript SDK can be used both on the frontend in a web browser, and on the backend in a Node application with the same API.

The client-side SDK targets ECMAScript5+ compatible browsers.

```javascript
<script src="https://cdn.virgilsecurity.com/packages/javascript/sdk/4.5.0/virgil-sdk.min.js"
            crossorigin="anonymous"
            integrity="sha256-gPt3jqjIcK/2jbs3T/C/asLv34mPlMu3Yy510lHbFAM="></script>
```

## Obtain an Access Token
When users want to start sending and receiving messages in a browser or mobile device, Virgil can't trust them right away. Clients have to be provided with a unique identity, thus,  you'll need to give your users the Access Token that tells Virgil who they are and what they can do.

Each your client must send to you the Access Token request with their registration request. Then, your service that will be responsible for handling access requests must handle them in case of users successful registration on your Application server.

```
// an example of an Access Token representation
AT.7652ee415726a1f43c7206e4b4bc67ac935b53781f5b43a92540e8aae5381b14
```

## Initialize SDK

### With a Token
With the Access Token, we can initialize the Virgil PFS SDK on the client side to start doing fun stuff like sending and receiving messages. To initialize the **Virgil SDK** at the client side, you need to use the following code:

```javascript
var api = virgil.API("[YOUR_ACCESS_TOKEN_HERE]");
```

### Without a Token

In case of a **Global Virgil Card** creation you don't need to initialize the SDK with the Access Token. For more information about the Global Virgil Card creation check out the [Creating Global Card guide](/docs/guides/virgil-card/creating-global-card.md).

Use the following code to initialize the Virgil SDK without the Access Token.

```javascript
var api = virgil.API();
```
