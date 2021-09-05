/* eslint-disable import/extensions */
/* eslint-disable camelcase */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { countries } from '../../../exports/countries.js';
import { cityStates } from '../../../exports/cities.js';


function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key].split('|').includes(value));
}

function getValueByKey(object, value) {
  return object[value].split('|');
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

export default class UserEdit extends React.Component {
  constructor(props) {
    super(props);
    const { user } = this.props;
    this.user = JSON.parse(user);
    this.user.continent = getKeyByValue(countries, this.user.country);
    this.state = {
      firstName: this.user.first_name,
      lastName: this.user.last_name,
      password: '',
      confirmPassword: '',
      continent: this.user.continent,
      country: this.user.country,
      city: this.user.city,
      stateRegionProvince: this.user.state_region_province,
      address: this.user.address,
      phoneNumber: this.user.phone_number,
      countriesByContinent: [],
      citiesByCountry: [],
      passwordTip: '',
      phoneTip: '',
      passwordError: '',
      passwordChange: false,
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.showPasswordForm = this.showPasswordForm.bind(this);
  }

  changeHandler(event) {
    const eventName = event.target.name;
    let eventValue = event.target.value;
    const { password, confirmPassword } = this.state;
    let passErr = '';
    let passTip = '';
    let phTip = '';
    if (eventName === 'firstName' || eventName === 'lastName') {
      const regexp = /^[A-Z]/;
      if (eventValue !== '' && !regexp.test(eventValue)) {
        eventValue = eventValue.charAt(0).toUpperCase() + eventValue.slice(1);
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
    if (eventName === 'continent') {
      if (eventValue !== '') {
        this.setState({ countriesByContinent: getValueByKey(countries, eventValue) });
      }
      this.setState({ country: '' });
      this.setState({ city: '' });
    }
    if (eventName === 'country') {
      if (eventValue !== '') {
        this.setState({ citiesByCountry: getValueByKey(cityStates, eventValue) });
      }
      this.setState({ city: '' });
    }
    if (eventName === 'phoneNumber' && !validatePhone(eventValue)) {
      phTip = <label id="warning-label">Must have region identifier and no spaces between numbers</label>;
    }
    this.setState({ passwordTip: passTip });
    this.setState({ passwordError: passErr });
    this.setState({ phoneTip: phTip });
    this.setState({ [eventName]: eventValue });
  }

  showPasswordForm() {
    this.setState({ passwordChange: true });
  }

  render() {
    const {
      firstName, lastName, password, confirmPassword, continent, country,
      city, stateRegionProvince, address, phoneNumber, passwordTip, phoneTip,
      passwordError, passwordChange,
    } = this.state;
    let { countriesByContinent, citiesByCountry } = this.state;
    const { editUserPath } = this.props;

    let header = <h2>Editing User</h2>;
    if (firstName) {
      header = <h2>{`Editing ${firstName}`}</h2>;
      if (lastName) {
        header = <h2>{`Editing ${firstName} ${lastName}`}</h2>;
      }
    } else {
      header = <h2>Editing User</h2>;
    }

    let passwordForm = (
      <div className="buttons">
        <button type="button" onClick={this.showPasswordForm}>Change Password</button>
        <input type="hidden" name="password" value={this.user.password} />
      </div>
    );
    if (passwordChange) {
      passwordForm = (
        <div>
          <div className="field">
            <label htmlFor="password">New Password</label>
            <input id="password" type="password" name="password" value={password} onChange={this.changeHandler} required />
            {passwordTip}
          </div>
          <div className="field">
            <label htmlFor="confirmpass">Confirm Password</label>
            <input id="confirmpass" type="password" name="confirmPassword" value={confirmPassword} onChange={this.changeHandler} required />
            {passwordError}
          </div>
        </div>
      );
    }

    let countriesForm = <input type="hidden" name="country" value={this.user.country} />;
    if (continent) {
      if (!countriesByContinent.length) {
        countriesByContinent = getValueByKey(countries, continent);
      }
      countriesForm = (
        <div className="field">
          <label htmlFor="country">Country</label>
          <select id="country" name="country" value={country} onChange={this.changeHandler}>
            <option key="" value="">-- remove country --</option>
            {countriesByContinent.map((elem) => (
              <option key={elem} value={elem}>{elem}</option>
            ))}
          </select>
        </div>
      );
    } else { countriesForm = ''; }

    let citiesForm = <input type="hidden" name="city" value={this.user.city} />;
    if (country) {
      if (!citiesByCountry.length) {
        citiesByCountry = getValueByKey(cityStates, country);
      }
      citiesForm = (
        <div className="field">
          <label htmlFor="city">City</label>
          <select id="city" name="city" value={city} onChange={this.changeHandler}>
            <option key="" value="">-- remove city --</option>
            {citiesByCountry.map((elem) => (
              <option key={elem} value={elem}>{elem}</option>
            ))}
          </select>
        </div>
      );
    } else { citiesForm = ''; }

    let submitButton = <input type="submit" name="update" value="Update" />;
    if (passwordError) {
      submitButton = <input type="submit" name="update" value="Fix current problems" disabled />;
    }

    return (
      <form action={editUserPath} id="createForm" encType="multipart/form-data" method="post">
        <input type="hidden" name="_method" value="patch" />
        {header}
        <div className="field">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" name="firstName" value={firstName} onChange={this.changeHandler} required />
        </div>
        <div className="field">
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" name="lastName" value={lastName} onChange={this.changeHandler} required />
        </div>
        {passwordForm}
        <div className="field">
          <label htmlFor="image">Profile Picture</label>
          <input id="image" type="file" name="image" accept="image/png, image/jpeg, image/jpg" />
        </div>
        <div className="field">
          <label htmlFor="continent">Continent</label>
          <select id="continent" name="continent" value={continent} onChange={this.changeHandler}>
            <option key="" value="">-- remove continent --</option>
            {Object.entries(countries).map(([key]) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
        {countriesForm}
        {citiesForm}
        <div className="field">
          <label htmlFor="stateRegionProvince">State/Region/Province</label>
          <input id="stateRegionProvince" type="text" name="stateRegionProvince" value={stateRegionProvince} onChange={this.changeHandler} />
        </div>
        <div className="field">
          <label htmlFor="address">Address</label>
          <input id="address" type="text" name="address" value={address} onChange={this.changeHandler} />
        </div>
        <div className="field">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input id="phoneNumber" type="tel" name="phoneNumber" value={phoneNumber} onChange={this.changeHandler} placeholder="e.g. +56983729458" />
          {phoneTip}
        </div>
        <div className="field">
          {submitButton}
        </div>
      </form>
    );
  }
}

UserEdit.propTypes = {
  user: PropTypes.string.isRequired,
  editUserPath: PropTypes.string.isRequired,
};
