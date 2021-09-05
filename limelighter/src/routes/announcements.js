const KoaRouter = require('koa-router');
const { Op } = require('sequelize');

const router = new KoaRouter();

async function loadAnnouncement(ctx, next) {
  ctx.state.announcement = await ctx.orm.announcement.findByPk(ctx.params.id);
  return next();
}

router.get('announcements.list', '/', async (ctx) => {
  let myAnnouncements; let notMyAnnouncements;
  if (ctx.state.currentUser) {
    myAnnouncements = await ctx.orm.announcement.findAll({ where: { userId: ctx.state.currentUser.id }, order: [['date', 'DESC']] });
    notMyAnnouncements = await ctx.orm.announcement.findAll({ where: { userId: { [Op.ne]: ctx.state.currentUser.id } }, order: [['date', 'DESC']] });
  } else {
    myAnnouncements = [];
    notMyAnnouncements = await ctx.orm.announcement.findAll({ order: [['date', 'DESC']] });
  }
  let authorList = []; const authorPromiseList = [];
  notMyAnnouncements.forEach((elem) => {
    authorPromiseList.push(ctx.orm.user.findByPk(elem.userId));
  });
  myAnnouncements.forEach((elem) => {
    authorPromiseList.push(ctx.orm.user.findByPk(elem.userId));
  });
  await Promise.all(authorPromiseList).then((authors) => { authorList = authors; });
  switch (ctx.accepts(['json', 'html'])) {
    case 'json':
      ctx.body = notMyAnnouncements.concat(myAnnouncements);
      break;
    case 'html':
      await ctx.render('announcements/index', {
        notMyAnnouncements,
        myAnnouncements,
        authorList,
        newAnnouncementPath: ctx.router.url('announcements.new'),
        newPostulationPath: (announcement) => ctx.router.url('announcement_postulations.new', { announcementId: announcement.id }),
        showAnnouncementPath: (announcement) => ctx.router.url('announcements.show', { id: announcement.id }),
        editAnnouncementPath: (announcement) => ctx.router.url('announcements.edit', { id: announcement.id }),
        deleteAnnouncementPath: (announcement) => ctx.router.url('announcements.delete', { id: announcement.id }),
        searchAnnouncementPath: () => ctx.router.url('searches.announcements'),
        notice: ctx.flashMessage.notice,
      });
      break;
    default:
      break;
  }
});

router.get('announcements.new', '/new', async (ctx) => {
  const announcement = ctx.orm.announcement.build();
  await ctx.render('announcements/new', {
    announcement,
    submitAnnouncementPath: ctx.router.url('announcements.create'),
  });
});

router.post('announcements.create', '/', async (ctx) => {
  const announcement = ctx.orm.announcement.build(ctx.request.body);
  try {
    if (ctx.state.currentUser) {
      announcement.userId = ctx.state.currentUser.id;
    }
    await announcement.save({ fields: ['title', 'description', 'date', 'userId', 'groupId'] });
    ctx.redirect(ctx.router.url('announcements.list'));
  } catch (validationError) {
    await ctx.render('courses.new', {
      announcement,
      errors: validationError.errors,
      submitAnnouncementPath: ctx.router.url('announcements.create'),
    });
  }
});

router.get('announcements.edit', '/:id/edit', loadAnnouncement, async (ctx) => {
  const { announcement } = ctx.state;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== announcement.userId) {
    ctx.redirect(ctx.router.url('announcements.show', { id: announcement.id }));
  }
  if (!ctx.state.currentUser) {
    ctx.redirect(ctx.router.url('session.new'));
  }
  await ctx.render('announcements/edit', {
    announcement,
    submitAnnouncementPath: ctx.router.url('announcements.update', { id: announcement.id }),
  });
});

router.patch('announcements.update', '/:id', loadAnnouncement, async (ctx) => {
  const { announcement } = ctx.state;
  try {
    const {
      title, description, date, userId, groupId,
    } = ctx.request.body;
    await announcement.update({
      title, description, date, userId, groupId,
    });
    ctx.redirect(ctx.router.url('announcements.list'));
  } catch (validationError) {
    await ctx.render('announcements/edit', {
      announcement,
      errors: validationError.errors,
      submitAnnouncementPath: ctx.router.url('announcements.update', { id: announcement.id }),
    });
  }
});

router.del('announcements.delete', '/:id', loadAnnouncement, async (ctx) => {
  const { announcement } = ctx.state;
  await announcement.destroy();
  ctx.redirect(ctx.router.url('announcements.list'));
});

router.get('announcements.show', '/:id', loadAnnouncement, async (ctx) => {
  const { announcement } = ctx.state;
  const user = await ctx.orm.user.findByPk(announcement.userId);
  let userannouncement;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== user.id) {
    await ctx.orm.userannouncement.findOne({
      where: {
        userId: ctx.state.currentUser.id,
        announcementId: announcement.id,
      },
    }).then((ua) => { userannouncement = ua; });
  }
  const postulants = []; const postulantsPromiseList = [];
  const postulationsList = await ctx.orm.postulation.findAll({
    where: {
      announcementId: announcement.id,
      status: 'Pending',
    },
  });
  postulationsList.forEach((element) => {
    postulantsPromiseList.push(ctx.orm.user.findByPk(element.userId)
      .then((postulant) => postulants.push(postulant)));
  });
  await Promise.all(postulantsPromiseList);
  await ctx.render('announcements/show', {
    announcement,
    userannouncement,
    postulationsList,
    postulants,
    user,
    backToAnnouncementsPath: ctx.router.url('announcements.list'),
    editAnnouncementPath: () => ctx.router.url('announcements.edit', { id: announcement.id }),
    deleteAnnouncementPath: () => ctx.router.url('announcements.delete', { id: announcement.id }),
    newPostulationPath: () => ctx.router.url('announcement_postulations.new', { announcementId: announcement.id }),
    rateAnnouncementPath: () => ctx.router.url('announcements.rate', { id: announcement.id }),
    deletePostulationPath: (postulation) => ctx.router.url('announcement_postulations.delete', { id: postulation.id, announcementId: announcement.id }),
    acceptPostulationPath: (postulation) => ctx.router.url('announcement_postulations.accept', { id: postulation.id, announcementId: announcement.id }),
    rejectPostulationPath: (postulation) => ctx.router.url('announcement_postulations.reject', { id: postulation.id, announcementId: announcement.id }),
  });
});

router.patch('announcements.rate', '/:id/rate', loadAnnouncement, async (ctx) => {
  const { rating } = ctx.request.body;
  const { announcement } = ctx.state;
  const user = await ctx.orm.user.findByPk(announcement.userId);
  let userannouncement;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== user.id) {
    await ctx.orm.userannouncement.findOne({
      where: {
        userId: ctx.state.currentUser.id,
        announcementId: announcement.id,
      },
    }).then((ua) => { userannouncement = ua; });
  } else {
    ctx.redirect(ctx.router.url('announcements.show', { id: announcement.id }));
  }
  const newAllRatings = user.allratings + 1;
  const newRating = ((user.rating * user.allratings) + Number(rating)) / (newAllRatings);
  user.rating = newRating;
  user.allratings = newAllRatings;
  await user.update({ rating: newRating, allratings: newAllRatings });
  await userannouncement.update({ rated: true }, { fields: ['rated'] });
  ctx.redirect(ctx.router.url('announcements.show', { id: announcement.id }));
});

module.exports = router;
