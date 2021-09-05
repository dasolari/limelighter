/* eslint-disable no-plusplus */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';

const urls = require('../../../exports/safe_urls');


function safeUrl(url) {
  let safe = false;
  for (let i = 0; i < urls.safeUrls.length; i++) {
    if (url.toLowerCase().includes(urls.safeUrls[i])) {
      safe = true;
      break;
    }
  }
  return safe;
}

export default class AddMedia extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      video: false,
      videoUrl: '',
      closeColor: '#2f137ce5',
      invalidUrl: '',
    };
    this.showVideoForm = this.showVideoForm.bind(this);
    this.changeCloseColor = this.changeCloseColor.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
  }

  changeHandler(event) {
    const eventName = event.target.name;
    const eventValue = event.target.value;
    let err = '';
    if (eventName === 'videoUrl') {
      if (eventValue !== '' && !safeUrl(eventValue)) {
        err = <label id="warning-label">This is not a valid or an appropriate url!</label>;
      }
    }
    this.setState({ invalidUrl: err });
    this.setState({ [eventName]: eventValue });
  }

  showVideoForm() {
    const { video } = this.state;
    if (video) {
      this.setState({ video: false });
    } else {
      this.setState({ video: true });
    }
  }

  changeCloseColor(color) {
    this.setState({ closeColor: color });
  }

  render() {
    const {
      video, videoUrl, closeColor, invalidUrl,
    } = this.state;
    const { addMediaPath } = this.props;

    let videoInput = '';
    if (video) {
      videoInput = (
        <div className="field">
          <label className="add-media" htmlFor="videoTitle">
            Add a video:
            <MdClose
              color={closeColor}
              onClick={this.showVideoForm}
              onMouseEnter={() => this.changeCloseColor('gray')}
              onMouseLeave={() => this.changeCloseColor('#2f137ce5')}
              size={20}
            />
          </label>
          <input id="videoTitle" type="text" name="videoTitle" placeholder="Video title" required />
          <input id="videoUrl" type="text" name="videoUrl" value={videoUrl} placeholder="Paste URL here" onChange={this.changeHandler} required />
          {invalidUrl}
        </div>
      );
    } else {
      videoInput = (
        <div>
          <button className="btnShow" type="button" onClick={this.showVideoForm}>Add a Video</button>
          <input type="hidden" name="video" value="" />
        </div>
      );
    }

    let submitButton = '';
    if (video && !invalidUrl) {
      submitButton = (
        <div className="field">
          <input type="submit" name="create" value="Add Media" />
        </div>
      );
    }

    return (
      <form action={addMediaPath} method="post">
        {videoInput}
        {submitButton}
      </form>
    );
  }
}

AddMedia.propTypes = {
  addMediaPath: PropTypes.string.isRequired,
};
