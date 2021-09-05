/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';

const urls = require('../../../exports/safe_urls');


function safeUrl(url) {
  let safe = false;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < urls.safeUrls.length; i++) {
    if (url.toLowerCase().includes(urls.safeUrls[i])) {
      safe = true;
      break;
    }
  }
  return safe;
}

export default class UserShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      instruments: false,
      instrument: '',
      links: false,
      link: '',
      closeColor: 'white',
      invalidUrl: '',
    };
    this.changeHandler = this.changeHandler.bind(this);
    this.showInstrumentsForm = this.showInstrumentsForm.bind(this);
    this.showLinksForm = this.showLinksForm.bind(this);
    this.changeCloseColor = this.changeCloseColor.bind(this);
  }

  changeHandler(event) {
    const eventName = event.target.name;
    let eventValue = event.target.value;
    let err = '';
    if (eventName === 'instrument') {
      const regexp = /^[A-Z]/;
      if (eventValue !== '' && !regexp.test(eventValue)) {
        eventValue = eventValue.charAt(0).toUpperCase() + eventValue.slice(1);
      }
    }
    if (eventName === 'link') {
      if (eventValue !== '' && !safeUrl(eventValue)) {
        err = <label id="warning-label">This is not a valid or an appropriate url!</label>;
      }
    }
    this.setState({ invalidUrl: err });
    this.setState({ [eventName]: eventValue });
  }

  showInstrumentsForm() {
    const { instruments } = this.state;
    if (instruments) {
      this.setState({ instruments: false });
    } else {
      this.setState({ instruments: true });
    }
  }

  showLinksForm() {
    const { links } = this.state;
    if (links) {
      this.setState({ links: false });
    } else {
      this.setState({ links: true });
    }
  }

  changeCloseColor(color) {
    this.setState({ closeColor: color });
  }

  render() {
    const {
      instruments, links, instrument, link, closeColor, invalidUrl,
    } = this.state;
    const { addInstrumentLinkPath } = this.props;

    let instrumentsInput = '';
    if (instruments) {
      instrumentsInput = (
        <div className="field">
          <label className="add-media" htmlFor="instrument">
            Name your instrument:
            <MdClose
              color={closeColor}
              onClick={this.showInstrumentsForm}
              onMouseEnter={() => this.changeCloseColor('#142850')}
              onMouseLeave={() => this.changeCloseColor('white')}
              size={20}
            />
          </label>
          <input id="instrument" type="text" name="instrument" value={instrument} onChange={this.changeHandler} />
        </div>
      );
    } else {
      instrumentsInput = (
        <div>
          <button className="btnShow" type="button" onClick={this.showInstrumentsForm}>Add an Instrument</button>
          <input type="hidden" name="instrument" value="" />
        </div>
      );
    }

    let linksInput = '';
    if (links) {
      linksInput = (
        <div className="field">
          <label className="add-media" htmlFor="link">
            Add a link:
            <MdClose
              color={closeColor}
              onClick={this.showLinksForm}
              onMouseEnter={() => this.changeCloseColor('#142850')}
              onMouseLeave={() => this.changeCloseColor('white')}
              size={20}
            />
          </label>
          <input id="linkName" type="text" name="linkName" placeholder="Link description" required />
          <input id="link" type="text" name="link" placeholder="Paste URL here" value={link} onChange={this.changeHandler} required />
          {invalidUrl}
        </div>
      );
    } else {
      linksInput = (
        <div>
          <button className="btnShow" type="button" onClick={this.showLinksForm}>Add a Link</button>
          <input type="hidden" name="link" value="" />
        </div>
      );
    }

    let submitButton = '';
    if ((links || instruments) && !invalidUrl) {
      submitButton = (
        <div className="field">
          <input type="submit" name="update" value="Update" />
        </div>
      );
    }

    return (
      <form action={addInstrumentLinkPath} method="post">
        <input type="hidden" name="_method" value="patch" />
        {instrumentsInput}
        {linksInput}
        {submitButton}
      </form>
    );
  }
}

UserShow.propTypes = {
  addInstrumentLinkPath: PropTypes.string.isRequired,
};
