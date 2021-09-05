/* eslint-disable jsx-a11y/label-has-associated-control */
import SpotifyPlayer from 'react-spotify-player';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MdClose } from 'react-icons/md';


export default function SpotifyMedia({
  albums, artists, tracks, isOwner, addPath, delPath,
}) {
  const spotifyAlbums = JSON.parse(albums);
  const spotifyArtists = JSON.parse(artists);
  const spotifyTracks = JSON.parse(tracks);
  const albumArtistSize = { width: '100%', height: 300 };
  const trackSize = { width: '100%', height: 80 };
  const view = 'list';
  const theme = 'black';
  const [uri, setUri] = useState('');
  const [toDelete, setToDelete] = useState(null);

  let albumsTitle = ''; let artistsTitle = ''; let tracksTitle = '';
  if (spotifyAlbums.length) albumsTitle = <h3 className="media-title">Spotify Albums</h3>;
  if (spotifyArtists.length) artistsTitle = <h3 className="media-title">Spotify Artists</h3>;
  if (spotifyTracks.length) tracksTitle = <h3 className="media-title">Spotify Tracks</h3>;

  let addUri = '';
  let submitButton = '';
  let deleteButton = '';
  if (isOwner) {
    addUri = (
      <div className="field spotify-uri">
        <label className="add-media">Add an Album, Artist or Track URI:</label>
        <input type="text" name="uri" value={uri} onChange={(e) => setUri(e.value)} placeholder="Album, Artist or Track URI" />
      </div>
    );
    submitButton = (
      <div className="field">
        <input type="submit" name="create" value="Add Spotify Media" />
      </div>
    );
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
    <form action={addPath} method="post">
      {albumsTitle}
      {spotifyAlbums.map((album) => (
        <div className="spotify-container" onMouseEnter={() => setToDelete(album.id)}>
          <SpotifyPlayer uri={album.uri} size={albumArtistSize} view={view} theme={theme} />
          {deleteButton}
        </div>
      ))}
      {artistsTitle}
      {spotifyArtists.map((artist) => (
        <div className="spotify-container" onMouseEnter={() => setToDelete(artist.id)}>
          <SpotifyPlayer uri={artist.uri} size={albumArtistSize} view={view} theme={theme} />
          {deleteButton}
        </div>
      ))}
      {tracksTitle}
      {spotifyTracks.map((track) => (
        <div className="spotify-container" onMouseEnter={() => setToDelete(track.id)}>
          <SpotifyPlayer uri={track.uri} size={trackSize} view={view} theme={theme} />
          {deleteButton}
        </div>
      ))}
      {addUri}
      {submitButton}
    </form>
  );
}

SpotifyMedia.propTypes = {
  albums: PropTypes.string.isRequired,
  artists: PropTypes.string.isRequired,
  tracks: PropTypes.string.isRequired,
  isOwner: PropTypes.bool.isRequired,
  addPath: PropTypes.string.isRequired,
  delPath: PropTypes.string.isRequired,
};
