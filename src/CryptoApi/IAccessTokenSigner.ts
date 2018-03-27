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
 * The IAccessTokenSigner provides interface to sign access token and verify its signature using `IPrivateKey` and `IPublicKey`.
 */
export interface IAccessTokenSigner
{
	/**
	 * Represents used signature algorithm
	 */
	getAlgorithm(): string;

	/**
	 * Generates the digital signature for the specified `tokenBytes` using the specified `IPrivateKey`
	 * @param tokenBytes - The material representation bytes of access token for which to compute the signature.
	 * @param privateKey - The private key
	 * @returns - The digital signature for the material representation bytes of access token.
	 */
	generateTokenSignature(tokenBytes: Buffer, privateKey: IPrivateKey): Buffer;

	/**
	 * Verifies that a digital signature is valid by checking the <paramref name="signature"/> and
	 * provided `IPublicKey` and `tokenBytes`
	 * @param signature - The digital signature for the `tokenBytes`
	 * @param tokenBytes - The material representation bytes of access token `signature` has been generated
	 * @param publicKey - The public key
	 * @returns - True if signature is valid, False otherwise
	 */
	verifyTokenSignature(signature: Buffer, tokenBytes: Buffer, publicKey: IPublicKey): boolean;
}
