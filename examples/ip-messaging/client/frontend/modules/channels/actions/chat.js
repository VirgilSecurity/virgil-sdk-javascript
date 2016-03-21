import Promise from 'bluebird';
import { push } from 'react-router-redux';
import _ from 'lodash';
import * as ActionTypes from '../action-types';
import { virgil } from '../services/virgil';
import messagingService from '../services/messaging';

export function startFetchLoop () {
	return dispatch => {
		dispatch({type: ActionTypes.START_FETCH_LOOP});
		return dispatch(assertUserDataAndFetchMessages());
	}
}

export function stopFetchLoop () {
	return {type: ActionTypes.STOP_FETCH_LOOP};
}

export function assertUserDataAndFetchMessages () {
	return (dispatch, getState) => {
		const activeChannel = getState().channels.activeChannel;

		if (!activeChannel.name || !activeChannel.userData || ! activeChannel.identityToken) {
			return dispatch(push('/channels/join'));
		}

		return dispatch(fetchMessages());
	}
}

function fetchMessages () {
	return (dispatch, getState) => {
		const activeChannel = getState().channels.activeChannel;
		const userData = activeChannel.userData;

		let params = {
			channel_name: activeChannel.name,
			identity_token: activeChannel.identityToken
		};

		if (activeChannel.messages.length) {
			params.last_message_id = activeChannel.messages[activeChannel.messages.length - 1].id;
		}

		return messagingService.getChannelMessages(params)
			.map(verifyAndDecrypt, { concurrency: 4 })
			.filter(Boolean)
			.then(dispatchApropriateAction)
			.then(continueFetchLoop)
			.catch(error => console.error('fetch messages error', error))

		function verifyAndDecrypt (message) {
			var payload = JSON.parse(message.message);
			var encryptedMessage = new virgil.crypto.Buffer(payload.message, 'base64');
			var sign = new virgil.crypto.Buffer(payload.sign, 'base64');

			return findCardsByEmail(message.sender_identifier)
				// Verify through all cards
				.reduce((result, card) => {
					console.log('verify %s', message.id);
					return virgil.crypto.verifyAsync(encryptedMessage, card.public_key.public_key, sign).then(isOk => result = result || isOk);
				}, false)
				.then(isVerified => {
					if (!isVerified) {
						throw new Error('Message could not be verified id:' + message.id);
					}

					console.log('verified %s', message.id);
					return virgil.crypto.decryptAsync(encryptedMessage, userData.virgilCard.id, userData.keyPair.privateKey)
						.then(decryptedMessageBuffer => ({
							id: message.id,
							message: decryptedMessageBuffer.toString('utf8'),
							sender_identifier: message.sender_identifier
						}))
						.catch(() => ({
							id: message.id,
							message: '-- can not decrypt message --',
							sender_identifier: message.sender_identifier
						}))
				});
		}

		function dispatchApropriateAction (messages) {
			if (activeChannel.messages.length) {
				dispatch({type: ActionTypes.FETCH_MESSAGES_APPEND_SUCCESS, messages})
			} else {
				dispatch({type: ActionTypes.FETCH_MESSAGES_SUCCESS, messages})
			}
		}

		function continueFetchLoop () {
			if (activeChannel.isFetchLoopActive) {
				setTimeout(() => dispatch(fetchMessages()), 5000)
			}
		}
	}
}

export function sendMessage (message) {
	return (dispatch, getState) => {
		const activeChannel = getState().channels.activeChannel;

		// Get channel members
		return getChannelRecipients()
			.then(encryptMessageForAllMembersAndSend)
			.then(messages => dispatch({ type: ActionTypes.SEND_MESSAGE_SUCCESS, messages }))
			.catch(error => console.log('send message error', error));

		function encryptMessageForAllMembersAndSend (recipients) {
			const privateKey = activeChannel.userData.keyPair.privateKey;

			// Encrypt and sign data
			const encryptedMessage = virgil.crypto.encrypt(message, recipients);
			const sign = virgil.crypto.sign(encryptedMessage, privateKey);

			console.log('encrypted message');

			// Send message
			return messagingService.sendMessageToChannel({
				channel_name: activeChannel.name,
				identity_token: activeChannel.identityToken,
				message: JSON.stringify({
					message: encryptedMessage.toString('base64'),
					sign: sign.toString('base64')
				})
			})
		}

		function getChannelRecipients () {
			// 1. Fetch all channel members
			// 2. Search for virgil cards of all members
			// 3. Format recipients array
			return messagingService.getChannelMembers({ channel_name: activeChannel.name })
				.tap(members => console.log('fetched channel members', members))
				.map(member => findCardsByEmail(member.identifier), { concurrency: 1 })
				.tap(cards => console.log('fetched members\' cards', cards))
				.tap(cards => dispatch(fetchMembersCardsSuccess(cards)))
				.then(cards => _.flatten(cards))
				.map(card => ({
					recipientId: card.id,
					publicKey: card.public_key.public_key
				}))
				.tap(recipients => console.log('got channel recipients list', recipients));
		}
	}
}

const fetchChatMembersSuccess = (members) => ({ type: ActionTypes.FETCH_CHANNEL_MEMBERS_SUCCESS, members });
const fetchMembersCardsSuccess = (cards) => ({type: ActionTypes.FETCH_MEMBERS_CARDS_SUCCESS, cards: _.flatten(cards) });

let cardsCache = {};
function findCardsByEmail (email) {
	// Cache cards to speed up processing
	if (cardsCache[email]) {
		return Promise.resolve(cardsCache[email]);
	}

	return virgil.cards.search({ value: email, type: 'email' })
		.tap(cards => cardsCache[email] = cards);
}
