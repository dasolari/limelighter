const KoaRouter = require('koa-router');
const koaJWT = require('koa-jwt');

const authApi = require('./auth');
const groupsApi = require('./groups');
const usersApi = require('./users');
const announcementsApi = require('./announcements');
const postulationsApi = require('./postulations');

const router = new KoaRouter();

// unauthenticated endpoints
router.use('/auth', authApi.routes());

// JWT authentication without passthrough (error if not authenticated)
router.use(koaJWT({ secret: process.env.JWT_SECRET, key: 'authData' }));
router.use(async (ctx, next) => {
  if (ctx.state.authData.userId) {
    ctx.state.currentUser = await ctx.orm.user.findByPk(ctx.state.authData.userId);
  }
  return next();
});

// authenticated endpoints
router.use('/groups', groupsApi.routes());
router.use('/users', usersApi.routes());
router.use('/announcements', announcementsApi.routes());
router.use('/postulations', postulationsApi.routes());

module.exports = router;
