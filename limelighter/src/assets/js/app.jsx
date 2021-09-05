import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import GroupForm from './components/GroupForm';
import GroupEdit from './components/GroupEdit';
import LoginForm from './components/Login';
import RegisterForm from './components/Register';
import UserShow from './components/UserShow';
import UserEdit from './components/UserEdit';
import AnnouncementRate from './components/AnnouncementRate';
import GroupRate from './components/GroupRate';
import ShowStars from './components/Stars';
import Sidebar from './components/SidebarIcons';
import AddMedia from './components/AddMedia';
import ShowMedia from './components/ShowMedia';
import AcceptPostulation from './components/AcceptPostulation';
import SpotifyMedia from './components/SpotifyMedia';


const reactAppContainer = document.getElementById('react-app');

if (reactAppContainer) {
  ReactDOM.render(<App />, reactAppContainer);
}

const groupFormContainer = document.getElementById('group-form');

if (groupFormContainer) {
  const path = groupFormContainer.getAttribute('submitPath');
  const genresList = groupFormContainer.getAttribute('genres');
  ReactDOM.render(<GroupForm submitPath={path} genresList={genresList} />, groupFormContainer);
}

const groupEditContainer = document.getElementById('group-edit');

if (groupEditContainer) {
  const path = groupEditContainer.getAttribute('submitPath');
  const genresList = groupEditContainer.getAttribute('genres');
  const group = groupEditContainer.getAttribute('group');
  const occupants = groupEditContainer.getAttribute('occupants');
  ReactDOM.render(<GroupEdit
    submitPath={path}
    genresList={genresList}
    group={group}
    occupants={occupants}
  />, groupEditContainer);
}

const loginFormContainer = document.getElementById('login-form');

if (loginFormContainer) {
  const path = loginFormContainer.getAttribute('createSessionPath');
  const path2 = loginFormContainer.getAttribute('newUserPath');
  const email = loginFormContainer.getAttribute('email');
  ReactDOM.render(<LoginForm
    createSessionPath={path}
    newUserPath={path2}
    email={email}
  />, loginFormContainer);
}

const registerFormContainer = document.getElementById('register-form');

if (registerFormContainer) {
  const path = registerFormContainer.getAttribute('submitUserPath');
  const emails = registerFormContainer.getAttribute('allEmails');
  ReactDOM.render(<RegisterForm submitUserPath={path} emails={emails} />, registerFormContainer);
}

const userShowContainer = document.getElementById('user-show');

if (userShowContainer) {
  const path = userShowContainer.getAttribute('addInstrumentLinkPath');
  ReactDOM.render(<UserShow addInstrumentLinkPath={path} />, userShowContainer);
}

const userEditContainer = document.getElementById('edit-form');

if (userEditContainer) {
  const path = userEditContainer.getAttribute('editUserPath');
  const user = userEditContainer.getAttribute('user');
  ReactDOM.render(<UserEdit editUserPath={path} user={user} />, userEditContainer);
}

const rateAnnouncementContainer = document.getElementById('rate-announcement');

if (rateAnnouncementContainer) {
  const path = rateAnnouncementContainer.getAttribute('ratingPath');
  const userAnnouncement = rateAnnouncementContainer.getAttribute('userannouncement');
  ReactDOM.render(<AnnouncementRate ratingPath={path} userAnnouncement={userAnnouncement} />,
    rateAnnouncementContainer);
}

const acceptPostulationContainer = document.getElementsByClassName('accept-postulant');

if (acceptPostulationContainer) {
  acceptPostulationContainer.forEach((apc) => {
    const path = apc.getAttribute('path');
    const postulant = apc.getAttribute('postulant');
    const group = apc.getAttribute('group');
    ReactDOM.render(
      <AcceptPostulation acceptPostulationPath={path} postulant={postulant} group={group} />, apc,
    );
  });
}

const rateGroupContainer = document.getElementById('rate-group');

if (rateGroupContainer) {
  const path = rateGroupContainer.getAttribute('ratingPath');
  const userGroup = rateGroupContainer.getAttribute('usergroup');
  ReactDOM.render(<GroupRate ratingPath={path} userGroup={userGroup} />, rateGroupContainer);
}

const starsContainer = document.getElementsByClassName('stars-rating-container');

if (starsContainer) {
  if (starsContainer.length === 1) {
    const rating = Number(starsContainer[0].getAttribute('rating'));
    const allRatings = Number(starsContainer[0].getAttribute('all'));
    ReactDOM.render(<ShowStars
      rating={rating}
      allratings={allRatings}
      displaySize={25}
    />, starsContainer[0]);
  } else {
    starsContainer.forEach((sc) => {
      const rating = Number(sc.getAttribute('rating'));
      const allRatings = Number(sc.getAttribute('all'));
      ReactDOM.render(<ShowStars rating={rating} allratings={allRatings} displaySize={15} />, sc);
    });
  }
}

const sidebarIconsContainerIn = document.getElementById('sidebar-icons-logged');

if (sidebarIconsContainerIn) {
  const musician = (sidebarIconsContainerIn.getAttribute('musician') === 'true');
  const userId = Number(sidebarIconsContainerIn.getAttribute('userId'));
  const photo = sidebarIconsContainerIn.getAttribute('photo');
  ReactDOM.render(<Sidebar
    logged
    musician={musician}
    userId={userId}
    photo={photo}
  />, sidebarIconsContainerIn);
}

const sidebarIconsContainerOut = document.getElementById('sidebar-icons-logged-out');

if (sidebarIconsContainerOut) {
  ReactDOM.render(<Sidebar logged={false} />, sidebarIconsContainerOut);
}

const addMediaContainer = document.getElementById('add-media');

if (addMediaContainer) {
  const path = addMediaContainer.getAttribute('addMediaPath');
  ReactDOM.render(<AddMedia addMediaPath={path} />, addMediaContainer);
}

const mediaContainer = document.getElementsByClassName('media');

if (mediaContainer) {
  mediaContainer.forEach((mc) => {
    const video = mc.getAttribute('video');
    const isOwner = mc.getAttribute('isOwner') === 'true';
    const delPath = mc.getAttribute('delPath');
    ReactDOM.render(<ShowMedia videos={video} isOwner={isOwner} delPath={delPath} />, mc);
  });
}

const spotifyMedia = document.getElementsByClassName('spotify-media');

if (spotifyMedia) {
  spotifyMedia.forEach((sm) => {
    const albums = sm.getAttribute('albums');
    const artists = sm.getAttribute('artists');
    const tracks = sm.getAttribute('tracks');
    const isOwner = sm.getAttribute('isOwner') === 'true';
    const addPath = sm.getAttribute('addPath');
    const delPath = sm.getAttribute('delPath');
    ReactDOM.render(<SpotifyMedia
      albums={albums}
      artists={artists}
      tracks={tracks}
      isOwner={isOwner}
      addPath={addPath}
      delPath={delPath}
    />, sm);
  });
}
