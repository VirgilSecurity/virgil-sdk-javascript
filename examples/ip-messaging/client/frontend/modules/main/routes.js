import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import App from './roots/app';
import channelsRoutes from '../channels/routes';

export default (
	<Route component={App} path="/">
		{channelsRoutes}
		<IndexRedirect to="/channels/join" />
	</Route>
);
