const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('api.groups.list', '/', async (ctx) => {
  const groupsList = await ctx.orm.group.findAll();
  ctx.body = ctx.jsonSerializer('group', {
    attributes: ['name', 'date', 'genre', 'description', 'rating'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.groups.list')}`,
    },
    dataLinks: {
      self: (dataset, group) => `${ctx.origin}/api/groups/${group.id}`,
    },
  }).serialize(groupsList);
});

router.get('api.group.show', '/:id', async (ctx) => {
  const group = await ctx.orm.group.findByPk(ctx.params.id);
  ctx.body = ctx.jsonSerializer('group', {
    attributes: ['name', 'date', 'genre', 'description', 'rating'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.group.show', { id: group.id })}`,
    },
  }).serialize(group);
});

module.exports = router;
