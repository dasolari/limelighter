const KoaRouter = require('koa-router');
const { Op } = require('sequelize');

const router = new KoaRouter();

router.post('searches.users', '/user', async (ctx) => {
  let { searched } = ctx.request.body;
  const { searchCriteria } = ctx.request.body;
  searched = searched.toLowerCase();
  let users;
  if (ctx.state.currentUser) {
    users = await ctx.orm.user.findAll({ where: { id: { [Op.ne]: ctx.state.currentUser.id } } });
  } else {
    users = await ctx.orm.user.findAll();
  }
  users = users.filter((user) => {
    switch (searchCriteria) {
      case 'email':
        return `${user.email.toLowerCase()}`.includes(searched);
      case 'country':
        if (user.country) {
          return `${user.country.toLowerCase()}`.includes(searched);
        }
        return false;
      case 'city':
        if (user.city) {
          return `${user.city.toLowerCase()}`.includes(searched);
        }
        return false;
      case 'instruments':
        if (user.musician) {
          for (let i = 0; i < user.instruments.length; i += 1) {
            if (user.instruments[i].toLowerCase().includes(searched)) {
              return true;
            }
          }
        }
        return false;
      default:
        return `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`.includes(searched);
    }
  });
  await ctx.render('users/index', {
    users,
    showUserPath: (user) => ctx.router.url('users.show', { id: user.id }),
    searchUserPath: () => ctx.router.url('searches.users'),
    notice: ctx.flashMessage.notice,
  });
});

router.post('searches.groups', '/groups', async (ctx) => {
  let { searched } = ctx.request.body;
  const { searchCriteria } = ctx.request.body;
  searched = searched.toLowerCase();
  let myGroups; let notMyGroups;
  if (ctx.state.currentUser) {
    const myGroupsIds = await ctx.orm.usergroup
      .findAll({ where: { userId: ctx.state.currentUser.id } }).map((x) => x.groupId);
    const notMyGroupsIds = await ctx.orm.usergroup
      .findAll().map((x) => x.groupId).filter((num) => !myGroupsIds.includes(num));
    myGroups = await ctx.orm.group.findAll({ where: { id: myGroupsIds }, order: [['date', 'DESC'], ['rating', 'DESC'], ['allratings', 'DESC']] });
    notMyGroups = await ctx.orm.group.findAll({ where: { id: notMyGroupsIds } });
    notMyGroups.forEach((element) => {
      // eslint-disable-next-line no-param-reassign
      element.coincidence = element.compareInstruments(ctx.state.currentUser);
    });
    notMyGroups.sort((a, b) => b.coincidence - a.coincidence);
  } else {
    notMyGroups = await ctx.orm.group.findAll({ order: [['date', 'DESC'], ['rating', 'DESC'], ['allratings', 'DESC']] });
    myGroups = [];
  }
  let occupantsList = []; const occupantsPromiseList = [];
  let leaderList = []; const leaderPromiseList = [];
  notMyGroups.forEach((elem) => {
    leaderPromiseList.push(ctx.orm.user.findByPk(elem.leader_id));
    occupantsPromiseList.push(ctx.orm.usergroup.findAll({ where: { groupId: elem.id } }));
  });
  myGroups.forEach((elem) => {
    leaderPromiseList.push(ctx.orm.user.findByPk(elem.leader_id));
    occupantsPromiseList.push(ctx.orm.usergroup.findAll({ where: { groupId: elem.id } }));
  });
  await Promise.all(leaderPromiseList).then((leaders) => { leaderList = leaders; });
  await Promise.all(occupantsPromiseList)
    .then((occupants) => { occupantsList = occupants.map((x) => x.length); });
  myGroups = myGroups.filter((group, index) => {
    const groupLeader = leaderList
      .filter((leader) => leader.id === group.leader_id)[0];
    switch (searchCriteria) {
      case 'leader':
        return `${groupLeader.first_name.toLowerCase()} ${groupLeader.last_name.toLowerCase()}`.includes(searched);
      case 'genre':
        return `${group.genre.toLowerCase()}`.includes(searched);
      case 'vacancies':
        return group.avaincies - occupantsList[index + notMyGroups.length] >= searched;
      default:
        return `${group.name.toLowerCase()}`.includes(searched);
    }
  });
  notMyGroups = notMyGroups.filter((group, index) => {
    const groupLeader = leaderList
      .filter((leader) => leader.id === group.leader_id).shift();
    switch (searchCriteria) {
      case 'vacancies':
        return group.avaincies - occupantsList[index] >= searched;
      case 'leader':
        return `${groupLeader.first_name.toLowerCase()} ${groupLeader.last_name.toLowerCase()}`.includes(searched);
      case 'genre':
        return `${group.genre.toLowerCase()}`.includes(searched);
      default:
        return `${group.name.toLowerCase()}`.includes(searched);
    }
  });
  occupantsList = []; const filteredOccupantsPromiseList = [];
  leaderList = []; const filteredLeaderPromiseList = [];
  notMyGroups.forEach((elem) => {
    filteredLeaderPromiseList.push(ctx.orm.user.findByPk(elem.leader_id));
    filteredOccupantsPromiseList.push(ctx.orm.usergroup.findAll({ where: { groupId: elem.id } }));
  });
  myGroups.forEach((elem) => {
    filteredLeaderPromiseList.push(ctx.orm.user.findByPk(elem.leader_id));
    filteredOccupantsPromiseList.push(ctx.orm.usergroup.findAll({ where: { groupId: elem.id } }));
  });
  await Promise.all(filteredLeaderPromiseList).then((leaders) => { leaderList = leaders; });
  await Promise.all(filteredOccupantsPromiseList)
    .then((occupants) => { occupantsList = occupants.map((x) => x.length); });
  await ctx.render('groups/index', {
    notMyGroups,
    myGroups,
    occupantsList,
    leaderList,
    newGroupPath: ctx.router.url('groups.new'),
    newPostulationPath: (group) => ctx.router.url('group_postulations.new', { groupId: group.id }),
    showGroupPath: (group) => ctx.router.url('groups.show', { id: group.id }),
    editGroupPath: (group) => ctx.router.url('groups.edit', { id: group.id }),
    deleteGroupPath: (group) => ctx.router.url('groups.delete', { id: group.id }),
    searchGroupPath: () => ctx.router.url('searches.groups'),
    notice: ctx.flashMessage.notice,
  });
});

router.post('searches.announcements', '/announcement', async (ctx) => {
  let { searched } = ctx.request.body;
  const { searchCriteria } = ctx.request.body;
  searched = searched.toLowerCase();
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
  myAnnouncements = myAnnouncements.filter((announcement) => {
    const announcementUser = authorList
      .filter((author) => author.id === announcement.userId).shift();
    switch (searchCriteria) {
      case 'user':
        return `${announcementUser.first_name.toLowerCase()} ${announcementUser.last_name.toLowerCase()}`.includes(searched);
      default:
        return `${announcement.title.toLowerCase()}`.includes(searched);
    }
  });
  notMyAnnouncements = notMyAnnouncements.filter((announcement) => {
    const announcementUser = authorList
      .filter((author) => author.id === announcement.userId).shift();
    switch (searchCriteria) {
      case 'user':
        return `${announcementUser.first_name.toLowerCase()} ${announcementUser.last_name.toLowerCase()}`.includes(searched);
      default:
        return `${announcement.title.toLowerCase()}`.includes(searched);
    }
  });
  authorList = []; const filteredAuthorPromiseList = [];
  notMyAnnouncements.forEach((elem) => {
    filteredAuthorPromiseList.push(ctx.orm.user.findByPk(elem.userId));
  });
  myAnnouncements.forEach((elem) => {
    filteredAuthorPromiseList.push(ctx.orm.user.findByPk(elem.userId));
  });
  await Promise.all(filteredAuthorPromiseList).then((authors) => { authorList = authors; });
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
});

module.exports = router;
