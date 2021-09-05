const KoaRouter = require('koa-router');
const Hashids = require('hashids/cjs');

const index = require('./routes/index');
const groups = require('./routes/groups');
const announcements = require('./routes/announcements');
const announcementPostulations = require('./routes/announcement_postulations');
const groupPostulations = require('./routes/group_postulations');
const postulations = require('./routes/postulations');
const session = require('./routes/session');
const users = require('./routes/users');
const userMedia = require('./routes/user_media');
const groupMedia = require('./routes/group_media');
const searches = require('./routes/searches');
const api = require('./routes/api');

const hashids = new Hashids();

const router = new KoaRouter();

router.use(async (ctx, next) => {
  Object.assign(ctx.state, {
    currentUser: ctx.session.userId && await ctx.orm.user.findByPk(
      hashids.decode(ctx.session.userId)[0],
    ),
    newSessionPath: ctx.router.url('session.new'),
    destroySessionPath: ctx.router.url('session.destroy'),
  });
  return next();
});

router.use('/', index.routes());
router.use('/groups', groups.routes());
router.use('/groups/media', groupMedia.routes());
router.use('/announcements', announcements.routes());
router.use('/postulations', postulations.routes());
router.use('/session', session.routes());
router.use('/users', users.routes());
router.use('/users/media', userMedia.routes());
router.use('/announcements/:announcementId/postulations', announcementPostulations.routes());
router.use('/groups/:groupId/postulations', groupPostulations.routes());
router.use('/searches', searches.routes());
router.use('/api', api.routes());

module.exports = router;
