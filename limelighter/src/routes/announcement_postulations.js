const KoaRouter = require('koa-router');

const sendAnnouncementPostulationEmail = require('../mailers/announcement-postulation-alert');
const sendAcceptedPostulationEmail = require('../mailers/accepted-postulation-alert');
const sendRejectedPostulationEmail = require('../mailers/rejected-postulation-alert');

const router = new KoaRouter();

async function loadPostulation(ctx, next) {
  ctx.state.postulation = await ctx.orm.postulation.findByPk(ctx.params.id);
  return next();
}

async function loadAnnouncement(ctx, next) {
  ctx.state.announcement = await ctx.orm.announcement.findByPk(ctx.params.announcementId);
  return next();
}

router.get('announcement_postulations.new', '/new', loadAnnouncement, async (ctx) => {
  const postulation = ctx.orm.postulation.build();
  const { announcement } = ctx.state;
  if (announcement.postulants && announcement.postulants.includes(ctx.state.currentUser.id)) {
    ctx.flashMessage.notice = 'You already applied to this announcement!';
    ctx.redirect(ctx.router.url('announcements.list'));
  }
  await ctx.render('postulations/new', {
    postulation,
    submitPostulationPath: ctx.router.url('announcement_postulations.create', { announcementId: announcement.id }),
  });
});

router.post('announcement_postulations.create', '/', loadAnnouncement, async (ctx) => {
  const postulation = ctx.orm.postulation.build(ctx.request.body);
  const { announcement } = ctx.state;
  const { postulants } = announcement;
  const user = ctx.state.currentUser;
  const owner = await ctx.orm.user.findByPk(announcement.userId);
  let postulantsList = [];
  try {
    if (ctx.state.currentUser) {
      postulation.userId = ctx.state.currentUser.id;
    }
    postulation.announcementId = announcement.id;
    await postulation.save({ fields: ['description', 'date', 'status', 'userId', 'groupId', 'announcementId'] });
    if (postulants !== null) {
      postulantsList = postulants;
    }
    postulantsList.push(ctx.state.currentUser.id);
    await announcement.update({ postulants: postulantsList }, { fields: ['postulants'] });
    await sendAnnouncementPostulationEmail(
      ctx, { owner }, { user }, { postulation }, { announcement },
    );
    ctx.redirect(ctx.router.url('announcements.list'));
  } catch (validationError) {
    await ctx.render('postulations/new', {
      postulation,
      errors: validationError.errors,
      submitPostulationPath: ctx.router.url('announcement_postulations.create', { announcementId: announcement.id }),
    });
  }
});

router.get('announcement_postulations.accept', '/:id/accept', loadPostulation, loadAnnouncement, async (ctx) => {
  const { postulation } = ctx.state;
  const { announcement } = ctx.state;
  const userannouncement = ctx.orm.userannouncement.build();
  const user = await ctx.orm.user.findByPk(postulation.userId);
  await postulation.update({ status: 'Accepted' }, { fields: ['status'] });
  userannouncement.userId = postulation.userId;
  userannouncement.announcementId = announcement.id;
  await userannouncement.save({ fields: ['userId', 'announcementId'] });
  await sendAcceptedPostulationEmail(ctx, { user }, { postulation }, { announcement });
  ctx.redirect(ctx.router.url('announcements.show', { id: announcement.id }));
});

router.get('announcement_postulations.reject', '/:id/reject', loadPostulation, loadAnnouncement, async (ctx) => {
  const { postulation } = ctx.state;
  const { announcement } = ctx.state;
  const user = await ctx.orm.user.findByPk(postulation.userId);
  await postulation.update({ status: 'Rejected' }, { fields: ['status'] });
  await sendRejectedPostulationEmail(ctx, { user }, { postulation }, { announcement });
  ctx.redirect(ctx.router.url('announcements.show', { id: announcement.id }));
});

router.del('announcement_postulations.delete', '/:id', loadPostulation, loadAnnouncement, async (ctx) => {
  const { postulation } = ctx.state;
  const { announcement } = ctx.state;
  const { postulants } = announcement;
  const postulantsList = postulants;
  if (postulation.status === 'Pending') {
    const index = postulantsList.indexOf(ctx.state.currentUser.id);
    if (index > -1) {
      postulantsList.splice(index, 1);
    }
    await announcement.update({ postulants: postulantsList }, { fields: ['postulants'] });
  }
  await postulation.destroy();
  ctx.redirect(ctx.router.url('announcements.show', { id: announcement.id }));
});


module.exports = router;
