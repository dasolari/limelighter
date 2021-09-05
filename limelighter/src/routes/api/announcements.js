const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('api.announcements.list', '/', async (ctx) => {
  const announcementsList = await ctx.orm.announcement.findAll();
  ctx.body = ctx.jsonSerializer('announcement', {
    attributes: ['title', 'description', 'date', 'userId', 'postulants'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.announcements.list')}`,
    },
    dataLinks: {
      self: (dataset, announcement) => `${ctx.origin}/api/announcements/${announcement.id}`,
    },
  }).serialize(announcementsList);
});

router.get('api.announcement.show', '/:id', async (ctx) => {
  const announcement = await ctx.orm.announcement.findByPk(ctx.params.id);
  ctx.body = ctx.jsonSerializer('announcement', {
    attributes: ['title', 'description', 'date', 'userId', 'postulants'],
    topLevelLinks: {
      self: `${ctx.origin}${ctx.router.url('api.announcement.show', { id: announcement.id })}`,
    },
  }).serialize(announcement);
});

module.exports = router;
