const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('api.users.list', '/', async (ctx) => {
  const usersList = await ctx.orm.user.findAll();
  ctx.body = ctx.jsonSerializer('user', {
    attributes: ['first_name', 'last_name', 'email', 'country', 'city', 'state_region_province', 'address', 'phone_number', 'rating', 'musician'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.users.list')}`,
    },
    dataLinks: {
      self: (dataset, user) => `${ctx.origin}/api/users/${user.id}`,
    },
  }).serialize(usersList);
});

router.get('api.user.show', '/:id', async (ctx) => {
  const user = await ctx.orm.user.findByPk(ctx.params.id);
  ctx.body = ctx.jsonSerializer('user', {
    attributes: ['first_name', 'last_name', 'email', 'country', 'city', 'state_region_province', 'address', 'phone_number', 'rating', 'musician'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.user.show', { id: user.id })}`,
    },
  }).serialize(user);
});

module.exports = router;
