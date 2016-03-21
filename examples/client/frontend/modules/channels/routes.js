import React from 'react';
import { Route, IndexRoute } from 'react-router';
import Join from './roots/join';
import Chat from './roots/chat';

export default (
	<Route path="channels">
		<Route component={Join} path="join" />
		<Route component={Chat} path="chat/:channelName" />
		<IndexRoute component={Join} />
	</Route>
);
