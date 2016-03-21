import { combineReducers } from 'redux';
import { join } from './join';
import { activeChannel } from './active-channel';

export default combineReducers({
	join,
	activeChannel
});
