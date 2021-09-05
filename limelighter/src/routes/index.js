const KoaRouter = require('koa-router');

const router = new KoaRouter();
const jwt = require('jsonwebtoken');

router.get('/', async (ctx) => {
  const groupsList = await ctx.orm.group.findAll({
    order: [
      ['date', 'DESC'],
      ['rating', 'DESC'],
    ],
  });
  let occupantsList = []; const occupantsPromiseList = [];
  let leaderList = []; const leaderPromiseList = [];
  groupsList.forEach((elem) => {
    leaderPromiseList.push(ctx.orm.user.findByPk(elem.leader_id));
    occupantsPromiseList.push(ctx.orm.usergroup.findAll({ where: { groupId: elem.id } }));
  });
  const announcementsList = await ctx.orm.announcement.findAll();
  let authorList = []; const authorPromiseList = [];
  announcementsList.forEach((elem) => {
    authorPromiseList.push(ctx.orm.user.findByPk(elem.userId));
  });
  await Promise.all(leaderPromiseList).then((leaders) => { leaderList = leaders; });
  await Promise.all(occupantsPromiseList)
    .then((occupants) => { occupantsList = occupants.map((x) => x.length); });
  await Promise.all(authorPromiseList).then((authors) => { authorList = authors; });
  await ctx.render('index', {
    groupsList,
    occupantsList,
    leaderList,
    announcementsList,
    authorList,
    goToAnnouncementsPath: ctx.router.url('announcements.list'),
    goToGroupsPath: ctx.router.url('groups.list'),
    showGroupPath: (group) => ctx.router.url('groups.show', { id: group.id }),
    showAnnouncementPath: (announcement) => ctx.router.url('announcements.show', { id: announcement.id }),
  });
});

router.get('confirmation/:token', async (ctx) => {
  let email;
  try {
    const userId = jwt.verify(ctx.params.token, process.env.EMAIL_SECRET);
    const user = await ctx.orm.user.findByPk(userId.user);
    await user.update({ confirmed: true }, { fields: ['confirmed'] });
    ctx.flashMessage.notice = 'Authentication completed';
    email = user.email;
  } catch (error) {
    ctx.flashMessage.notice = 'Authentication failed';
    email = '';
  }
  return ctx.render('session/new', {
    email,
    createSessionPath: ctx.router.url('session.create'),
    newUserPath: ctx.router.url('users.new'),
    notice: ctx.flashMessage.notice,
  });
});

module.exports = router;
