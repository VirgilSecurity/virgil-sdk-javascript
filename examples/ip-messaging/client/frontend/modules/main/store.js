import { compose, createStore, applyMiddleware, } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import thunk from 'redux-thunk';
import { persistState } from 'redux-devtools';
import routes from './routes';
import DevTools from './components/dev-tools';
import reducer from './reducer';

const initialState = {
	routing: { routes: [], params: {}, location: {}, components: [] }
};

function configureStore ({ state = initialState, routes, reducer }) {
	return compose(
		applyMiddleware(thunk),
		applyMiddleware(routerMiddleware(browserHistory)),
		DevTools.instrument(),
		persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
	)(createStore)(reducer, state);
}

const store = configureStore({ routes, reducer });
export default store;
