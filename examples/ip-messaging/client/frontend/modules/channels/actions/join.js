import * as ActionTypes from '../action-types';
import { virgil } from '../services/virgil';
import messagingService from '../services/messaging';
import { push } from 'react-router-redux';
import localforage from 'localforage';
import _ from 'lodash';

export function assertIdentity (email) {
	email = _.trim(email);

	return dispatch => {
		// Check if we have keypair for given email in localstorage
		localforage.getItem(email, (err, userData) => {
			if (userData) {
				return dispatch(startJoinChannel(userData));
			}

			dispatch(startConfirmation());
			// Verify your email through virgil identity service
			return virgil.identity.verify({
				type: 'email',
				value: email
			}).then(response => {
				// Generate new keypair
				let keyPair = virgil.crypto.generateKeyPair();
				dispatch(identityVerifySuccess(email, response.action_id, keyPair));
			});
		});
	}
}

const startConfirmation = () => ({ type: ActionTypes.START_CONFIRMATION });
const identityVerifySuccess = (email, actionId, keyPair) => ({
	type: ActionTypes.IDENTITY_VERIFY_SUCCESS,
	email,
	actionId,
	keyPair
});

export function confirmIdentity (confirmationCode) {
	return (dispatch, getState) => {
		const joinState = getState().channels.join;

		// Confirm identity
		return virgil.identity.confirm({
			action_id: joinState.actionId,
			confirmation_code: confirmationCode,
			token: {
				time_to_live: 60, // Seconds token will live
				count_to_live: 1  // How much times token could be used
			}
		})
		.then(response => {
			return virgil.cards.create({
				public_key: joinState.keyPair.publicKey,
				private_key: joinState.keyPair.privateKey,
				identity: response
			});
		})
		.then(response => {
			let userData = {
				virgilCard: response,
				keyPair: joinState.keyPair
			};
			localforage.setItem(joinState.email, userData);
			dispatch(startJoinChannel(userData));
		});
	}
}

const startJoinChannel = (userData) => ({ type: ActionTypes.START_JOIN_CHANNEL, userData });

export function joinChannel (channelName) {
	return (dispatch, getState) => {
		const userData = getState().channels.activeChannel.userData;
		return messagingService.joinChannel({
			channel_name: channelName,
			identifier: userData.virgilCard.identity.value
		}).then((res) => {
			dispatch({ type: ActionTypes.JOIN_CHANNEL, channelName, identityToken: res.identity_token });
			dispatch(push('/channels/chat/' + channelName));
		}).catch(console.error);
	}
}
