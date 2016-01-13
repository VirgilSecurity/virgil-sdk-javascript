# Tutorial Javascript Crypto Library

- [Install](#install)
- [Generate Keys](#generate-keys)
- [Encrypt Data](#encrypt-data)
- [Sign Data](#sign-data)
- [Verify Data](#verify-data)
- [Decrypt Data](#decrypt-data)
- [See Also](#see-also)

##Install
Use npm to install `virgil-crypto` package, running the command:

```
npm install virgil-crypto
```

## Generate Keys

The following code example creates a new public/private key pair.

```javascript
var crypto = require('virgil-crypto');
var keyPair = crypto.generateKeyPair();
```

You can also generate a key pair with an encrypted private key just using one of the overloaded constructors.

```csharp
var password = "TafaSuf4";
var keyPair = crypto.generateKeyPair(password);
```

In the example below you can see a simply generated public/private keypair without a password.

```
-----BEGIN PUBLIC KEY-----
MIGbMBQGByqGSM49AgEGCSskAwMCCAEBDQOBggAEWIH2SohavmLdRwEJ/VWbFcWr
rU+g7Z/BkI+E1L5JF7Jlvi1T1ed5P0/JCs+K0ZBM/0hip5ThhUBKK2IMbeFjS3Oz
zEsWKgDn8j3WqTb8uaKIFWWG2jEEnU/8S81Bgpw6CyxbCTWoB+0+eDYO1pZesaIS
Tv6dTclx3GljHpFRdZQ=
-----END PUBLIC KEY-----

-----BEGIN EC PRIVATE KEY-----
MIHaAgEBBEAaKrInIcjTeBI6B0mX+W4gMpu84iJtlPxksCQ1Dv+8iM/lEwx3nWWf
ol6OvLkmG/qP9RqyXkTSCW+QONiN9JCEoAsGCSskAwMCCAEBDaGBhQOBggAEWIH2
SohavmLdRwEJ/VWbFcWrrU+g7Z/BkI+E1L5JF7Jlvi1T1ed5P0/JCs+K0ZBM/0hi
p5ThhUBKK2IMbeFjS3OzzEsWKgDn8j3WqTb8uaKIFWWG2jEEnU/8S81Bgpw6Cyxb
CTWoB+0+eDYO1pZesaISTv6dTclx3GljHpFRdZQ=
-----END EC PRIVATE KEY-----
```

Here is what an encrypted private key looks like:

```
-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIBKTA0BgoqhkiG9w0BDAEDMCYEIJjDIF2KRj7u86Up1ZB4yHHKhqMg5C/OW2+F
mG5gpI+3AgIgAASB8F39JXRBTK5hyqEHCLcCTbtLKijdNH3t+gtCrLyMlfSfK49N
UTREjF/CcojkyDVs9M0y5K2rTKP0S/LwUWeNoO0zCT6L/zp/qIVy9wCSAr+Ptenz
MR6TLtglpGqpG4bhjqLNR2I96IufFmK+ZrJvJeZkRiMXQSWbPavepnYRUAbXHXGB
a8HWkrjKPHW6KQxKkotGRLcThbi9cDtH+Cc7FvwT80O7qMyIFQvk8OUJdY3sXWH4
5tol7pMolbalqtaUc6dGOsw6a4UAIDaZhT6Pt+v65LQqA34PhgiCxQvJt2UOiPdi
SFMQ8705Y2W1uTexqw==
-----END ENCRYPTED PRIVATE KEY-----
```

See a working example [here...](https://github.com/VirgilSecurity/virgil-net/blob/master/Examples/Crypto/GenerateKeyPair.cs)

## Encrypt Data

The procedure for encrypting and decrypting the data is simple. For example:

If you want to encrypt the data to Bob, you encrypt it using Bob's public key (which you can get from the Public Keys Service), and Bob decrypts it with his private key. If Bob wants to encrypt some data to you, he encrypts it using your public key, and you decrypt it with your private key.

Crypto Library allows to encrypt the data for several types of recipient's user data like public key and password. This means that you can encrypt the data with some password or with a public key generated with the Crypto Library. 

Encrypt the text with a password:

```javascript
var textToEncrypt = "Encrypt me, Please!!!";
var password = "TafaSuf4";

var encryptedText = crypto.encrypt(textToEncrypt, password);
```

Encrypt the text with a public key:

```javascript
var keyPair = crypto.generateKeyPair();
var encryptedText = crypto.Encrypt(textToEncrypt, "RecipientID", password);
```

And of course you can mix these types as well, see how it works in the example below:

# TODO
```csharp
var textToEncrypt = "Encrypt me, Please!!!";
byte[] cipherData;

using (var cipher = new VirgilCipher())
{
	    cipher.AddPasswordRecipient(password);
	        cipher.AddKeyRecipient(keyRecepinet.Id, keyRecepinet.PublicKey);

	            cipherData = cipher.Encrypt(Encoding.UTF8.GetBytes(textToEncrypt), true);
}
```

## Sign Data

Cryptographic digital signatures use public key algorithms to provide data integrity. When you sign the data with a digital signature, someone else can verify the signature and can prove that the data originated from you and was not altered after you had signed it.

The following example applies a digital signature to a public key identifier.

```javascript
var originalText = "Sign me, Please!!!";
var sign = crypto.sign(originalText, keyPair.privateKey);
```

## Verify Data

To verify that the data was signed by a particular party, you need the following information:

*   the public key of the party that signed the data;
*   the digital signature;
*   the data that was signed.

The following example verifies a digital signature which was signed by the sender.

```javascript
var isValid = crypto.verify(originalText, keyPair.publicKey, sign);
```

## Decrypt Data

The following example illustrates decryption of the encrypted data with a recipient's private key.

```javascript
var decryptedText = crypto.decrypt(encryptedText, "RecipientId", keyPair.privateKey);
```

Use a password to decrypt the data.

```csharp
var decryptedText = crypto.decrypt(encryptedText, password);
```

## See Also

* [Quickstart](quickstart.md)
* [Tutorial Keys SDK](public-keys.md)
* [Tutorial Private Keys SDK](private-keys.md)
