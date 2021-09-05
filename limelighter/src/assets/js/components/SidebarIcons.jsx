import React from 'react';
import PropTypes from 'prop-types';
import { FaCompass, FaCheck } from 'react-icons/fa';
import { RiGroupLine, RiUserSearchLine } from 'react-icons/ri';
import { BsPersonFill } from 'react-icons/bs';
import { MdAnnouncement } from 'react-icons/md';
import { GiMusicalNotes } from 'react-icons/gi';


export default function Sidebar({
  logged, musician, userId, photo,
}) {
  let musicianAccount;
  if (musician) {
    musicianAccount = (
      <li id="musicianNav">
        <div className="left-icon">
          <GiMusicalNotes size={17} />
        </div>
        Musician
        <div className="right-icon">
          <GiMusicalNotes size={17} />
        </div>
      </li>
    );
  } else {
    musicianAccount = '';
  }
  let userPhoto = (
    <div className="icon">
      <BsPersonFill size={17} />
    </div>
  );
  if (photo) {
    userPhoto = (<img src={photo} alt="ProfileImage" className="userImgIcon" />);
  }
  if (logged) {
    return (
      <>
        {musicianAccount}
        <a href="/">
          <li>
            <div className="icon">
              <FaCompass size={17} />
            </div>
            Discover
          </li>
        </a>
        <a href="/groups">
          <li>
            <div className="icon">
              <RiGroupLine size={17} />
            </div>
            Groups
          </li>
        </a>
        <a href="/announcements">
          <li>
            <div className="icon">
              <MdAnnouncement size={17} />
            </div>
            Announcements
          </li>
        </a>
        <a href="/users/">
          <li>
            <div className="icon">
              <RiUserSearchLine size={17} />
            </div>
            Users
          </li>
        </a>
        <a href={`/postulations/${userId}`}>
          <li>
            <div className="icon">
              <FaCheck size={17} />
            </div>
            My Applications
          </li>
        </a>
        <a href={`/users/${userId}`}>
          <li>
            {userPhoto}
            Your Profile
          </li>
        </a>
      </>
    );
  }
  return (
    <>
      <a href="/">
        <li>
          <div className="icon">
            <FaCompass size={17} />
          </div>
          Discover
        </li>
      </a>
      <a href="/groups">
        <li>
          <div className="icon">
            <RiGroupLine size={17} />
          </div>
          Groups
        </li>
      </a>
      <a href="/announcements">
        <li>
          <div className="icon">
            <MdAnnouncement size={17} />
          </div>
          Announcements
        </li>
      </a>
      <a href="/users/">
        <li>
          <div className="icon">
            <RiUserSearchLine size={17} />
          </div>
          Users
        </li>
      </a>
    </>
  );
}

Sidebar.propTypes = {
  logged: PropTypes.bool.isRequired,
  musician: PropTypes.bool.isRequired,
  userId: PropTypes.number,
  photo: PropTypes.string,
};

Sidebar.defaultProps = {
  userId: 0,
  photo: '',
};
