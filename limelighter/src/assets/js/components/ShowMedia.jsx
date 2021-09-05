/* eslint-disable jsx-a11y/label-has-associated-control */
import ReactPlayer from 'react-player';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';


export default function ShowMedia({ videos, isOwner, delPath }) {
  const videosArray = JSON.parse(videos);
  const [toDelete, setToDelete] = useState(null);
  let deleteButton = '';
  if (isOwner) {
    deleteButton = (
      <form action={`${delPath}/${toDelete}`} className="hide-submit" method="post">
        <input type="hidden" name="_method" value="delete" />
        <label>
          <input type="submit" />
          <MdClose
            className="delete-media"
            size={20}
          />
        </label>
      </form>
    );
  }
  return (
    <div>
      {videosArray.map((elem) => (
        <div className="player-wrapper" onMouseEnter={() => setToDelete(elem.id)}>
          <h5>
            {elem.title}
            {deleteButton}
          </h5>
          <ReactPlayer
            className="react-player"
            width="auto"
            url={elem.videoUrl}
            controls
            playing
          />
        </div>
      ))}
    </div>
  );
}

ShowMedia.propTypes = {
  videos: PropTypes.string,
  isOwner: PropTypes.bool.isRequired,
  delPath: PropTypes.string.isRequired,
};

ShowMedia.defaultProps = {
  videos: '',
};
