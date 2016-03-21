import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';
import channels from '../../channels/reducers';

export default combineReducers({
	routing: routerReducer,
	channels
});
