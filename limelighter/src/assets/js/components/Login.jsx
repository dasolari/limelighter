/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';


function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export default class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    const { email } = this.props;
    this.state = {
      email,
      password: '',
      emailError: '',
    };
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(event) {
    const eventName = event.target.name;
    const eventValue = event.target.value;
    let err = '';
    if (eventName === 'email') {
      if (eventValue !== '' && !validateEmail(eventValue)) {
        err = <label id="warning-label">This must be an email</label>;
      }
    }
    this.setState({ emailError: err });
    this.setState({ [eventName]: eventValue });
  }

  render() {
    const {
      email, password, emailError,
    } = this.state;
    const { createSessionPath, newUserPath } = this.props;

    return (
      <form id="createForm" action={createSessionPath} method="post">
        <input type="hidden" name="_method" value="put" />
        <div className="field">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" value={email} onChange={this.changeHandler} required />
          {emailError}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={password} onChange={this.changeHandler} required />
        </div>
        <div className="buttons">
          <input type="submit" name="sign-in" value="Sign In" className="button" />
          <a href={newUserPath}><button type="button">Register</button></a>
        </div>
      </form>
    );
  }
}

LoginForm.propTypes = {
  createSessionPath: PropTypes.string.isRequired,
  newUserPath: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
};
