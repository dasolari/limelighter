/* eslint-disable no-unused-vars */
const KoaRouter = require('koa-router');

const router = new KoaRouter();

async function loadUser(ctx, next) {
  ctx.state.user = await ctx.orm.user.findByPk(ctx.params.id);
  const { user } = ctx.state;
  if (!user) {
    ctx.flashMessage.notice = 'This user does not exist (404)';
    return ctx.redirect(ctx.router.url('users.list'));
  }
  return next();
}

async function loadVideoMedia(ctx, next) {
  ctx.state.uservideo = await ctx.orm.uservideo.findByPk(ctx.params.videoMediaId);
  return next();
}

async function loadSpotifyMedia(ctx, next) {
  ctx.state.spotifymediauser = await ctx.orm.spotifymediauser.findByPk(ctx.params.spotifyMediaId);
  return next();
}

router.get('user_media.show', '/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const userVideos = await ctx.orm.uservideo.findAll({ where: { userId: user.id } });
  const spotifyAlbums = await ctx.orm.spotifymediauser.findAll({
    where:
    { userId: user.id, type: 'album' },
  });
  const spotifyArtists = await ctx.orm.spotifymediauser.findAll({
    where:
    { userId: user.id, type: 'artist' },
  });
  const spotifyTracks = await ctx.orm.spotifymediauser.findAll({
    where:
    { userId: user.id, type: 'track' },
  });
  let isThisUser = false;
  if (ctx.state.currentUser && (ctx.state.currentUser.id === user.id)) isThisUser = true;
  const deleteSpotifyMediaPath = '/users/media/spotifyDelete';
  const deleteVideoMediaPath = '/users/media/videoDelete';
  await ctx.render('users/media', {
    user,
    isThisUser,
    userVideos,
    spotifyAlbums,
    spotifyArtists,
    spotifyTracks,
    addMediaPath: () => ctx.router.url('user_media.add', { id: user.id }),
    addSpotifyMediaPath: () => ctx.router.url('user_media.addSpotify', { id: user.id }),
    deleteSpotifyMediaPath,
    deleteVideoMediaPath,
    notice: ctx.flashMessage.notice,
  });
});

router.post('user_media.add', '/add/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const { videoTitle, videoUrl } = ctx.request.body;
  try {
    if (videoTitle) {
      const video = ctx.orm.uservideo.build();
      video.userId = user.id;
      video.title = videoTitle;
      video.videoUrl = videoUrl;
      await video.save({ fields: ['userId', 'title', 'videoUrl'] });
      ctx.flashMessage.notice = 'Video successfully added!';
    }
  } catch (validationError) {
    ctx.flashMessage.notice = 'There was an error adding your video.';
  }
  ctx.redirect(ctx.router.url('user_media.show', { id: user.id }));
});

router.post('user_media.addSpotify', '/SpotifyAdd/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const spotifyMediaUris = await ctx.orm.spotifymediauser.findAll({ where: { userId: user.id } })
    .map((x) => x.uri);
  const { uri } = ctx.request.body;
  let spotify; let type; let token;
  try {
    if (uri) {
      [spotify, type, token] = uri.split(':');
      if (!spotifyMediaUris.includes(uri)) {
        const media = ctx.orm.spotifymediauser.build();
        media.userId = user.id;
        media.uri = uri;
        media.type = type;
        await media.save({ fields: ['userId', 'uri', 'type'] });
        ctx.flashMessage.notice = `Spotify ${type} successfully added!`;
      } else {
        ctx.flashMessage.notice = `error:This ${type} already exists!`;
      }
    } else {
      ctx.flashMessage.notice = 'error:No URI provided, nothing was added.';
    }
  } catch (validationError) {
    ctx.flashMessage.notice = `error:There was an error adding your Spotify ${type}. (URI=${token})`;
  }
  ctx.redirect(ctx.router.url('user_media.show', { id: user.id }));
});

router.del('user_media.delete', '/spotifyDelete/:spotifyMediaId', loadSpotifyMedia, async (ctx) => {
  const { spotifymediauser } = ctx.state;
  await spotifymediauser.destroy();
  ctx.flashMessage.notice = `Spotify ${spotifymediauser.type} successfully deleted.`;
  ctx.redirect(ctx.router.url('user_media.show', { id: spotifymediauser.userId }));
});

router.del('user_media.delete', '/videoDelete/:videoMediaId', loadVideoMedia, async (ctx) => {
  const { uservideo } = ctx.state;
  await uservideo.destroy();
  ctx.flashMessage.notice = 'Media successfully deleted.';
  ctx.redirect(ctx.router.url('user_media.show', { id: uservideo.userId }));
});

module.exports = router;
