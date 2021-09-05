/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';

function getTimeRemaining(endtime, begtime) {
  const t = Date.parse(endtime) - Date.parse(begtime);
  const seconds = Math.floor((t / 1000) % 60);
  const minutes = Math.floor((t / 1000 / 60) % 60);
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    total: t,
    days,
    hours,
    minutes,
    seconds,
  };
}

export default class GroupRate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showStars: false,
      rating: 0,
      hover: null,
      rateError: '',
    };
    this.timeSpan = 4; // in days
    this.showForm = this.showForm.bind(this);
    this.setRating = this.setRating.bind(this);
    this.setHover = this.setHover.bind(this);
  }

  setRating(value) {
    this.setState({ rating: value });
  }

  setHover(value) {
    this.setState({ hover: value });
  }

  showForm() {
    const { userGroup } = this.props;
    const parsedUG = JSON.parse(userGroup);
    const end = new Date(parsedUG.createdAt); end.setDate(end.getDate() + this.timeSpan);
    const timeSinceCreation = (new Date() - new Date(parsedUG.createdAt)) / (1000 * 60 * 60 * 24);
    const difference = getTimeRemaining(end, new Date());
    if (timeSinceCreation >= this.timeSpan) {
      this.setState({ showStars: true });
    } else {
      // eslint-disable-next-line react/jsx-one-expression-per-line
      this.setState({ rateError: <lable id="warning-label">You can rate this group in {difference.days} days, {difference.hours} hours, {difference.minutes} minutes and {difference.seconds} seconds...</lable> });
      setTimeout(() => {
        this.setState({ rateError: '' });
      }, 5000);
    }
  }

  render() {
    const { showStars, rateError } = this.state;
    const { ratingPath } = this.props;
    const { hover, rating } = this.state;

    let inputText = '';
    if (showStars) {
      inputText = (
        <form action={ratingPath} id="rateForm" method="post">
          <input type="hidden" name="_method" value="patch" />
          <label htmlFor="rating">Rate this Group:</label>
          <div className="stars-container">
            {[...Array(5)].map((star, i) => {
              const ratingValue = i + 1;
              return (
                <label>
                  <input type="radio" name="rating" value={ratingValue} onClick={() => this.setRating(ratingValue)} />
                  <FaStar
                    className="star"
                    color={ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                    size={35}
                    onMouseEnter={() => this.setHover(ratingValue)}
                    onMouseLeave={() => this.setHover(null)}
                  />
                </label>
              );
            })}
          </div>
          <div className="field">
            <input type="submit" name="rate" value="Submit Rating" />
          </div>
        </form>
      );
    } else {
      inputText = (
        <>
          <div className="buttons">
            <button className="btnShow" type="button" onClick={this.showForm}>Rate this Group</button>
          </div>
          <div className="warning-container">
            {rateError}
          </div>
        </>
      );
    }

    return (
      <>
        {inputText}
      </>
    );
  }
}

GroupRate.propTypes = {
  ratingPath: PropTypes.string.isRequired,
  userGroup: PropTypes.string.isRequired,
};
