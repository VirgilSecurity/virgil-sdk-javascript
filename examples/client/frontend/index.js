import './styles/main.scss';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { syncHistoryWithStore } from 'react-router-redux';
import store from './modules/main/store';
import routes from './modules/main/routes';
import DevTools from './modules/main/components/dev-tools';

injectTapEventPlugin();

const history = syncHistoryWithStore(browserHistory, store);

class Root extends Component {
	render () {
		return (
			<Provider store={store}>
				<div>
					<Router history={history}>
						{routes}
					</Router>
					<DevTools />
				</div>
			</Provider>
		);
	}
}

render(<Root />, document.getElementById('mount'));
