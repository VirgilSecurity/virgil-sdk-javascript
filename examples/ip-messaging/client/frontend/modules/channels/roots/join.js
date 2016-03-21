import React, { Component, PropTypes as PT } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as joinActions from '../actions/join';
import * as StepTypes from '../join-step-types';

class Join extends Component {
	constructor () {
		super();
		this.assertIdentity = this.assertIdentity.bind(this);
		this.submitConfirmation = this.submitConfirmation.bind(this);
		this.joinChannel = this.joinChannel.bind(this);
	}

	assertIdentity (e) {
		e.preventDefault();
		let email = this.refs.email.value;

		if (!email) {
			return alert('Enter valid email!');
		}

		this.props.assertIdentity(email);
	}

	submitConfirmation (e) {
		e.preventDefault();
		let confirmationCode = this.refs.confirmationCode.value;

		if (!confirmationCode) {
			return alert('Enter confirmation code!');
		}

		this.props.confirmIdentity(confirmationCode);
	}

	joinChannel (e) {
		e.preventDefault();
		let channelName = this.refs.channelName.value;

		if (!channelName) {
			return alert('Enter channel name!');
		}

		this.props.joinChannel(channelName);
	}

	render () {
		const enterEmail = (
			<form className="input-group" onSubmit={this.assertIdentity}>
				<input ref="email" type="email" className="form-control" placeholder="Enter email..." />
				<span className="input-group-btn">
					<button onClick={this.assertIdentity} className="btn btn-default" type="button">submit</button>
				</span>
			</form>
		);

		const enterConfirmation = (
			<div>
				<div className="row">
					<div className="col col-sm-12 text-center">
						<h5>Check your email for confirmation code</h5>
					</div>
				</div>
				<br/>
				<div className="row">
					<div className="col col-sm-12">
						<form className="input-group" onSubmit={this.submitConfirmation}>
							<input ref="confirmationCode" type="text" className="form-control" placeholder="Enter confirmation code..." />
							<span className="input-group-btn">
								<button onClick={this.submitConfirmation} className="btn btn-default" type="button">submit</button>
							</span>
						</form>
					</div>
				</div>
			</div>
		);
 
		const enterChannel = (
			<form className="input-group" onSubmit={this.joinChannel}>
				<input ref="channelName" type="text" className="form-control" placeholder="Enter channel name..." />
				<span className="input-group-btn">
					<button onClick={this.joinChannel} className="btn btn-default" type="button">submit</button>
				</span>
			</form>
		);

		return (
			<div className="join-form">
				<div className="row">
					<div className="col col-sm-4 col-sm-offset-4 well">
						{this.props.step === StepTypes.EMAIL ? enterEmail : null}
						{this.props.step === StepTypes.CONFIRMATION ? enterConfirmation : null}
						{this.props.step === StepTypes.CHANNEL ? enterChannel : null}
					</div>
				</div>
			</div>
		);
	}
}

Join.propTypes = {

};

function mapStateToProps (state) {
	return {
		step: state.channels.join.step
	};
}

function mapDispatchToProps (dispatch) {
	return bindActionCreators(joinActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Join);
