import * as ActionTypes from '../action-types';

export function activeChannel (state = { name: null, userData: null, messages: [], members: [], isFetchLoopActive: false }, action) {
	switch (action.type) {
		case ActionTypes.START_JOIN_CHANNEL:
			return Object.assign({}, state, { userData: action.userData });

		case ActionTypes.JOIN_CHANNEL:
			return Object.assign({}, state, { name: action.channelName, identityToken: action.identityToken });

		case ActionTypes.FETCH_MESSAGES_SUCCESS:
			return Object.assign({}, state, { messages: action.messages });

		case ActionTypes.FETCH_MESSAGES_APPEND_SUCCESS:
			return Object.assign({}, state, { messages: state.messages.concat(action.messages) });

		case ActionTypes.FETCH_CHAT_MEMBERS_SUCCESS:
			return Object.assign({}, state, { members: action.members });

		case ActionTypes.FETCH_MEMBERS_CARDS_SUCCESS:
			return Object.assign({}, state, { cards: action.cards });

		case ActionTypes.START_FETCH_LOOP:
			return Object.assign({}, state, { isFetchLoopActive: true });

		case ActionTypes.STOP_FETCH_LOOP:
			return Object.assign({}, state, { isFetchLoopActive: false });

		default:
			return state;
	}
}
