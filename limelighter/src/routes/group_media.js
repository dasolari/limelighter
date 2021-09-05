/* eslint-disable no-unused-vars */
const KoaRouter = require('koa-router');

const router = new KoaRouter();

async function loadGroup(ctx, next) {
  ctx.state.group = await ctx.orm.group.findByPk(ctx.params.id);
  const { group } = ctx.state;
  if (!group) {
    ctx.flashMessage.notice = 'This group does not exist (404), do not just write stuff in the url bar!';
    return ctx.redirect(ctx.router.url('groups.list'));
  }
  return next();
}

async function loadVideoMedia(ctx, next) {
  ctx.state.groupvideo = await ctx.orm.groupvideo.findByPk(ctx.params.videoMediaId);
  return next();
}

async function loadSpotifyMedia(ctx, next) {
  ctx.state.spotifymediauser = await ctx.orm.spotifymediauser.findByPk(ctx.params.spotifyMediaId);
  return next();
}

router.get('group_media.show', '/:id', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  const groupVideos = await ctx.orm.groupvideo.findAll({ where: { groupId: group.id } });
  const spotifyAlbums = await ctx.orm.spotifymediagroup.findAll({
    where:
    { groupId: group.id, type: 'album' },
  });
  const spotifyArtists = await ctx.orm.spotifymediagroup.findAll({
    where:
    { groupId: group.id, type: 'artist' },
  });
  const spotifyTracks = await ctx.orm.spotifymediagroup.findAll({
    where:
    { groupId: group.id, type: 'track' },
  });
  let isGroupLeader = false;
  if (ctx.state.currentUser && ctx.state.currentUser.id === group.leader_id) isGroupLeader = true;
  const deleteSpotifyMediaPath = '/groups/media/spotifyDelete';
  const deleteVideoMediaPath = '/groups/media/videoDelete';
  await ctx.render('groups/media', {
    group,
    isGroupLeader,
    groupVideos,
    spotifyAlbums,
    spotifyArtists,
    spotifyTracks,
    addMediaPath: () => ctx.router.url('group_media.add', { id: group.id }),
    addSpotifyMediaPath: () => ctx.router.url('group_media.addSpotify', { id: group.id }),
    deleteSpotifyMediaPath,
    deleteVideoMediaPath,
    notice: ctx.flashMessage.notice,
  });
});

router.post('group_media.add', '/add/:id', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  const { videoTitle, videoUrl } = ctx.request.body;
  try {
    if (videoTitle) {
      const video = ctx.orm.groupvideo.build();
      video.groupId = group.id;
      video.title = videoTitle;
      video.videoUrl = videoUrl;
      await video.save({ fields: ['groupId', 'title', 'videoUrl'] });
      ctx.flashMessage.notice = 'Video successfully added!';
    }
  } catch (validationError) {
    ctx.flashMessage.notice = 'error:There was an error adding your video, check your fields.';
  }
  ctx.redirect(ctx.router.url('group_media.show', { id: group.id }));
});

router.post('group_media.addSpotify', '/SpotifyAdd/:id', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  const spotifyMediaUris = await ctx.orm.spotifymediagroup.findAll({ where: { groupId: group.id } })
    .map((x) => x.uri);
  const { uri } = ctx.request.body;
  let spotify; let type; let token;
  try {
    if (uri) {
      [spotify, type, token] = uri.split(':');
      if (!spotifyMediaUris.includes(uri)) {
        const media = ctx.orm.spotifymediagroup.build();
        media.groupId = group.id;
        media.uri = uri;
        media.type = type;
        await media.save({ fields: ['groupId', 'uri', 'type'] });
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
  ctx.redirect(ctx.router.url('group_media.show', { id: group.id }));
});

router.del('group_media.delete', '/spotifyDelete/:spotifyMediaId', loadSpotifyMedia, async (ctx) => {
  const { spotifymediagroup } = ctx.state;
  await spotifymediagroup.destroy();
  ctx.flashMessage.notice = `Spotify ${spotifymediagroup.type} successfully deleted.`;
  ctx.redirect(ctx.router.url('group_media.show', { id: spotifymediagroup.groupId }));
});

router.del('group_media.delete', '/videoDelete/:videoMediaId', loadVideoMedia, async (ctx) => {
  const { groupvideo } = ctx.state;
  await groupvideo.destroy();
  ctx.flashMessage.notice = 'Media successfully deleted.';
  ctx.redirect(ctx.router.url('group_media.show', { id: groupvideo.groupId }));
});

module.exports = router;
