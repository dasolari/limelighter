const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('api.postulations.list', '/', async (ctx) => {
  const postulationsList = await ctx.orm.postulation.findAll();
  ctx.body = ctx.jsonSerializer('postulation', {
    attributes: ['description', 'date', 'status', 'userId', 'announcementId', 'groupId'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.postulations.list')}`,
    },
    dataLinks: {
      self: (dataset, postulation) => `${ctx.origin}/api/postulations/${postulation.id}`,
    },
  }).serialize(postulationsList);
});

module.exports = router;
