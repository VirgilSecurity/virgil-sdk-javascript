import React, { Component, PropTypes as PT } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as joinActions from '../actions/chat';

class Chat extends Component {
	constructor () {
		super();
		this.sendMessage = this.sendMessage.bind(this);
	}

	componentDidMount() {
		this.props.startFetchLoop();
	}

	componentWillUnmount () {
		this.props.stopFetchLoop();
	}

	sendMessage (e) {
		e.preventDefault();
		const message = this.refs.messageInput.value;
		this.props.sendMessage(message);
		this.refs.messageInput.value = '';
	}

	render () {
		return (
			<div className="chat">
				<div className="row">
					<div className="col col-sm-8 col-sm-offset-2 well">
						<div className="row messages">
							<div className="col col-sm-12">
								{this.props.messages.map((message, i) => (
									<div key={i} className="row">
										<div className="col col-sm-12">
											<span className="sender">{message.sender_identifier}</span>
											<span className="message">{message.message}</span>
										</div>
									</div>
								))}
							</div>
						</div>
						<br />
						<div className="row messages">
							<div className="col col-sm-12">
								<form className="input-group" onSubmit={this.sendMessage}>
									<input ref="messageInput" type="text" className="form-control" placeholder="Enter message..." />
									<span className="input-group-btn">
										<button onClick={this.sendMessage} className="btn btn-default" type="submit">send</button>
									</span>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

Chat.propTypes = {

};

function mapStateToProps (state) {
	return {
		channelName: state.channels.activeChannel.name,
		userData: state.channels.activeChannel.userData,
		messages: state.channels.activeChannel.messages
	};
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators(joinActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
