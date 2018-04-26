/**
 * Copyright (C) 2015-2018 Virgil Security Inc.
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     (1) Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *     (2) Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *
 *     (3) Neither the name of the copyright holder nor the names of its
 *     contributors may be used to endorse or promote products derived from
 *     this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ''AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * Lead Maintainer: Virgil Security Inc. <support@virgilsecurity.com>
 */

import { IPrivateKey } from './IPrivateKey';
import { IPublicKey } from './IPublicKey';

/**
 * The `ICardCrypto` interface defines a list of methods that provide a signature generation and signature verification methods
 */
export interface ICardCrypto
{
	/**
	 * Generates the digital signature for the specified `inputBytes` using the specified `IPrivateKey`
	 * @param inputBytes - The input data for which to compute the signature.
	 * @param privateKey - The private key.
	 * @returns - The digital signature for the specified data.
	 */
	generateSignature(inputBytes: Buffer|string, privateKey: IPrivateKey): Buffer;

	/**
	 * Verifies that a digital signature is valid by checking the `signature` and provided `IPublicKey` and `inputBytes`.
	 * @param inputBytes - The input data for which the `signature` has been generated.
	 * @param signature - The digital signature for the `inputBytes`
	 * @param publicKey - The public key
	 * @returns
	 */
	verifySignature(inputBytes: Buffer|string, signature: Buffer|string, publicKey: IPublicKey): boolean;

	/**
	 * Generates the fingerprint(512-bit hash) for the specified `inputBytes`.
	 * @param inputBytes - The input data for which to compute the fingerprint.
	 * @returns - The fingerprint for specified data.
	 */
	generateSha512(inputBytes: Buffer|string): Buffer;

	/**
	 * Imports the public key from its material representation
	 * @param publicKeyBytes - The public key material representation bytes
	 * @returns - The instance of `IPublicKey` imported from `publicKeyBytes`.
	 */
	importPublicKey(publicKeyBytes: Buffer|string): IPublicKey;

	/**
	 * Exports the provided `IPublicKey` into material representation bytes.
	 * @param publicKey - The public key
	 * @returns - The public key material representation bytes.
	 */
	exportPublicKey(publicKey: IPublicKey): Buffer;
}
