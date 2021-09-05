import React from 'react';
import PropTypes from 'prop-types';
import { FaStar } from 'react-icons/fa';


export default function ShowStars({ rating, allratings, displaySize }) {
  const roundedRating = Math.floor(rating);
  let totalRatings;
  if (allratings > 1) {
    totalRatings = 'Ratings';
  } else {
    totalRatings = 'Rating';
  }
  if (!allratings) return <div className="rating-container"><p>Not yet rated</p></div>;
  return (
    <div className="rating-container">
      {[...Array(roundedRating)].map(() => (
        <FaStar color="#ffc107" size={displaySize} />
      ))}
      {[...Array(5 - roundedRating)].map(() => (
        <FaStar color="#e4e5e9" size={displaySize} />
      ))}
      <p>
        {`${allratings} `}
        {totalRatings}
      </p>
    </div>
  );
}

ShowStars.propTypes = {
  rating: PropTypes.number.isRequired,
  allratings: PropTypes.number.isRequired,
  displaySize: PropTypes.number.isRequired,
};
