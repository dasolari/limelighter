/* eslint-disable import/extensions */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { FaPlus } from 'react-icons/fa';
import { countries } from '../../../exports/countries.js';
import { cityStates } from '../../../exports/cities.js';


function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function checkIfEmailExists(email, emails) {
  return emails.includes(email);
}

function validatePassword(password) {
  if (password) {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return re.test(String(password));
  }
  return true;
}

function validatePhone(phone) {
  if (phone) {
    const re = /^[+]+[0-9]{1,}$/;
    return re.test(String(phone));
  }
  return true;
}


export default class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    const { emails } = this.props;
    this.emails = JSON.parse(emails);
    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      country: '',
      state_region_province: '',
      city: '',
      address: '',
      phone_number: '',
      passwordError: '',
      emailError: '',
      passwordTip: '',
      phoneTip: '',
      continent: '',
      countriesByContinent: null,
      citiesByCountry: null,
      otherFields: false,
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.showMoreInfoForm = this.showMoreInfoForm.bind(this);
  }

  changeHandler(event) {
    const eventName = event.target.name;
    let eventValue = event.target.value;
    const { password, confirmPassword } = this.state;
    let passErr = '';
    let emailErr = '';
    let passTip = '';
    let phTip = '';
    if (eventName === 'first_name' || eventName === 'last_name') {
      const regexp = /^[A-Z]/;
      if (eventValue !== '' && !regexp.test(eventValue)) {
        eventValue = eventValue.charAt(0).toUpperCase() + eventValue.slice(1);
      }
    }
    if (eventName === 'email') {
      if (eventValue !== '' && !validateEmail(eventValue)) {
        emailErr = <label id="warning-label">This must be an email</label>;
      }
      if (eventValue !== '' && checkIfEmailExists(eventValue, this.emails)) {
        emailErr = <label id="warning-label">This email already exists</label>;
      }
    }
    if (eventName === 'password') {
      if (!validatePassword(eventValue)) {
        passTip = <label id="warning-label">Must be 8 characters minimum, have uppercase, lowercase and numbers</label>;
      }
      if (confirmPassword && eventValue !== confirmPassword) {
        passErr = <label id="warning-label">Passwords don`t match</label>;
      }
    }
    if (eventName === 'confirmPassword') {
      if (password && eventValue !== password) {
        passErr = <label id="warning-label">Passwords don`t match</label>;
      }
    }
    if (eventName === 'phone_number' && !validatePhone(eventValue)) {
      phTip = <label id="warning-label">Must have region identifier and no spaces between numbers</label>;
    }
    if (eventName === 'continent') {
      if (eventValue !== '') {
        this.setState({ countriesByContinent: countries[eventValue].split('|') });
      }
      this.setState({ country: '' });
      this.setState({ city: '' });
    }
    if (eventName === 'country') {
      if (eventValue !== '') {
        this.setState({ citiesByCountry: cityStates[eventValue].split('|') });
      }
      this.setState({ city: '' });
    }
    this.setState({ passwordTip: passTip });
    this.setState({ phoneTip: phTip });
    this.setState({ passwordError: passErr });
    this.setState({ emailError: emailErr });
    this.setState({ [eventName]: eventValue });
  }

  showMoreInfoForm() {
    const { otherFields } = this.state;
    if (otherFields) {
      this.setState({ otherFields: false });
    } else {
      this.setState({ otherFields: true });
    }
  }

  render() {
    const {
      first_name, last_name, email, password, confirmPassword, continent, country,
      city, state_region_province, address, phone_number, passwordError, emailError,
      passwordTip, phoneTip, countriesByContinent, citiesByCountry, otherFields,
    } = this.state;
    const { submitUserPath } = this.props;

    let header = <h2>Welcome</h2>;
    if (first_name) {
      header = <h2>{`Welcome ${first_name}`}</h2>;
      if (last_name) {
        header = <h2>{`Welcome ${first_name} ${last_name}`}</h2>;
      }
    }
    let countriesForm = '';
    if (continent) {
      countriesForm = (
        <div className="field">
          <label htmlFor="country">Country</label>
          <select name="country" value={country} onChange={this.changeHandler}>
            <option key="" value="">-- choose a country --</option>
            {countriesByContinent.map((elem) => (
              <option key={elem} value={elem}>{elem}</option>
            ))}
          </select>
        </div>
      );
    }

    let citiesForm = '';
    if (country) {
      citiesForm = (
        <div className="field">
          <label htmlFor="city">City</label>
          <select name="city" value={city} onChange={this.changeHandler}>
            <option key="" value="">-- choose a city --</option>
            {citiesByCountry.map((elem) => (
              <option key={elem} value={elem}>{elem}</option>
            ))}
          </select>
        </div>
      );
    }

    let additionalInfo = (
      <>
        <div className="more-info">
          <p>
            Want to tell us more about yourself? If not, you can do it later.
          </p>
          <FaPlus className="plus" size={15} onClick={this.showMoreInfoForm} />
        </div>
      </>
    );
    if (otherFields) {
      additionalInfo = (
        <>
          <div className="field">
            <label htmlFor="continent">Continent</label>
            <select name="continent" value={continent} onChange={this.changeHandler}>
              <option key="" value="">-- choose a continent --</option>
              {Object.entries(countries).map(([key]) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          {countriesForm}
          {citiesForm}
          <div className="field">
            <label htmlFor="state_region_province">State/Region/Province</label>
            <input type="text" name="state_region_province" value={state_region_province} onChange={this.changeHandler} />
          </div>
          <div className="field">
            <label htmlFor="address">Address</label>
            <input type="text" name="address" value={address} onChange={this.changeHandler} />
          </div>
          <div className="field">
            <label htmlFor="phone_number">Phone Number</label>
            <input type="tel" name="phone_number" value={phone_number} onChange={this.changeHandler} placeholder="e.g. +56983729458" />
            {phoneTip}
          </div>
        </>
      );
    }

    let submitInput = (
      <div className="field">
        <input type="submit" name="create" value="Create" />
      </div>
    );
    if (passwordError || emailError) {
      submitInput = (
        <div className="field">
          <input type="submit" name="create" value="Fix current problems" disabled />
        </div>
      );
    }

    return (
      <form id="createForm" action={submitUserPath} encType="multipart/form-data" method="post">
        {header}
        <div className="field">
          <label htmlFor="first_name">First Name</label>
          <input type="text" name="first_name" value={first_name} onChange={this.changeHandler} placeholder="Your first name..." required />
        </div>
        <div className="field">
          <label htmlFor="last_name">Last Name</label>
          <input type="text" name="last_name" value={last_name} onChange={this.changeHandler} placeholder="Your last name..." required />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" value={email} onChange={this.changeHandler} placeholder="e.g. your@email.com" required />
          {emailError}
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={password} onChange={this.changeHandler} required />
          {passwordTip}
        </div>
        <div className="field">
          <label htmlFor="confirmpass">Confirm Password</label>
          <input id="confirmpass" type="password" name="confirmPassword" value={confirmPassword} onChange={this.changeHandler} required />
          {passwordError}
        </div>
        <div className="field">
          <label htmlFor="image">Profile Picture (optional)</label>
          <input id="image" type="file" name="image" accept="image/png, image/jpeg, image/jpg" />
        </div>
        {additionalInfo}
        <div className="field">
          <input type="hidden" name="rating" value={0.0} />
        </div>
        <div className="field">
          <input type="hidden" name="date" value={Date(Date.now())} />
        </div>
        <div className="field">
          <input type="hidden" name="musician" value={false} />
        </div>
        {submitInput}
      </form>
    );
  }
}

RegisterForm.propTypes = {
  submitUserPath: PropTypes.string.isRequired,
  emails: PropTypes.string.isRequired,
};
