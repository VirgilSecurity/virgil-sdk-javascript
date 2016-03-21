import React, { Component } from 'react';

export default class App extends Component {
	render() {
		return (
			<div className="container container-fluid main-container">
				{this.props.children}
			</div>
		);
	}
}
