import * as ActionTypes from '../action-types';
import * as StepTypes from '../join-step-types';

export function join (state = { step: StepTypes.EMAIL, email: null, actionId: null }, action) {
	switch (action.type) {
		case ActionTypes.START_EMAIL: {
			return Object.assign({}, state, { step: StepTypes.EMAIL });
		}

		case ActionTypes.START_CONFIRMATION: {
			return Object.assign({}, state, { step: StepTypes.CONFIRMATION });
		}

		case ActionTypes.START_JOIN_CHANNEL: {
			return Object.assign({}, state, { step: StepTypes.CHANNEL });
		}

		case ActionTypes.IDENTITY_VERIFY_SUCCESS: {
			return Object.assign({}, state, {
				email: action.email,
				actionId: action.actionId,
				keyPair: action.keyPair
			});
		}

		default:
			return state;
	}
}
