const KoaRouter = require('koa-router');

const router = new KoaRouter();

async function loadPostulation(ctx, next) {
  ctx.state.postulation = await ctx.orm.postulation.findByPk(ctx.params.id);
  return next();
}

async function loadUser(ctx, next) {
  ctx.state.user = await ctx.orm.user.findByPk(ctx.params.userId);
  return next();
}

router.get('postulations.list', '/', async (ctx) => {
  const postulationsList = await ctx.orm.postulation.findAll();
  switch (ctx.accepts(['json'])) {
    case 'json':
      ctx.body = postulationsList;
      break;
    default:
      break;
  }
});

router.get('postulations.user', '/:userId', loadUser, async (ctx) => {
  const { user } = ctx.state;
  if (ctx.state.currentUser) {
    if (ctx.state.currentUser.id === user.id) {
      const postulationsList = await ctx.orm.postulation.findAll({ where: { userId: user.id } });
      const postulatedTitleList = []; const postulatedTitlePromiseList = [];
      postulationsList.forEach((postulation) => {
        if (postulation.announcementId) {
          postulatedTitlePromiseList.push(ctx.orm.announcement.findByPk(postulation.announcementId)
            .then((announcement) => postulatedTitleList.push(announcement.title)));
        } else {
          postulatedTitlePromiseList.push(ctx.orm.group.findByPk(postulation.groupId)
            .then((group) => postulatedTitleList.push(group.name)));
        }
      });
      await Promise.all(postulatedTitlePromiseList);
      await ctx.render('postulations/index', {
        user,
        postulationsList,
        postulatedTitleList,
        deletePostulationPath: (postulation) => ctx.router.url('postulations.delete', { id: postulation.id, userId: user.id }),
      });
    }
  } else {
    ctx.redirect('/');
  }
});

router.del('postulations.delete', '/:id/:userId', loadPostulation, loadUser, async (ctx) => {
  const { postulation } = ctx.state;
  const { user } = ctx.state;
  if (ctx.state.currentUser.id !== user.id) ctx.redirect('/');
  let postulated = null;
  if (postulation.announcementId) {
    postulated = await ctx.orm.announcement.findByPk(postulation.announcementId);
  } else {
    postulated = await ctx.orm.group.findByPk(postulation.groupId);
  }
  const { postulants } = postulated;
  const postulantsList = postulants;
  if (postulation.status === 'Pending') {
    const index = postulantsList.indexOf(user.id);
    if (index > -1) {
      postulantsList.splice(index, 1);
    }
    await postulated.update({ postulants: postulantsList }, { fields: ['postulants'] });
  }
  await postulation.destroy();
  ctx.redirect(ctx.router.url('postulations.user', { userId: user.id }));
});

module.exports = router;
