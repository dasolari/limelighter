/* eslint-disable no-param-reassign */
const KoaRouter = require('koa-router');

const router = new KoaRouter();

const cloudinary = require('cloudinary');
const { genresList } = require('../exports/genres_list.js');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function loadGroup(ctx, next) {
  ctx.state.group = await ctx.orm.group.findByPk(ctx.params.id);
  const { group } = ctx.state;
  if (!group) {
    ctx.flashMessage.notice = 'This group does not exist (404), do not just write stuff in the url bar!';
    return ctx.redirect(ctx.router.url('groups.list'));
  }
  return next();
}

async function loadUser(ctx, next) {
  ctx.state.user = await ctx.orm.user.findByPk(ctx.params.userId);
  const { user } = ctx.state;
  if (!user) {
    ctx.flashMessage.notice = 'This user does not exist (404), do not just write stuff in the url bar!';
    return ctx.redirect(ctx.router.url('groups.list'));
  }
  return next();
}


router.get('groups.list', '/', async (ctx) => {
  let myGroups; let notMyGroups;
  // Sorts array by instruments coincidence if user is logged in
  if (ctx.state.currentUser) {
    const myGroupsIds = await ctx.orm.usergroup
      .findAll({ where: { userId: ctx.state.currentUser.id } }).map((x) => x.groupId);
    const notMyGroupsIds = await ctx.orm.usergroup
      .findAll().map((x) => x.groupId).filter((num) => !myGroupsIds.includes(num));
    myGroups = await ctx.orm.group.findAll({ where: { id: myGroupsIds }, order: [['date', 'DESC'], ['rating', 'DESC'], ['allratings', 'DESC']] });
    notMyGroups = await ctx.orm.group.findAll({ where: { id: notMyGroupsIds } });
    notMyGroups.forEach((element) => {
      element.coincidence = element.compareInstruments(ctx.state.currentUser);
    });
    notMyGroups.sort((a, b) => b.coincidence - a.coincidence);
  } else {
    notMyGroups = await ctx.orm.group.findAll({ order: [['date', 'DESC'], ['rating', 'DESC'], ['allratings', 'DESC']] });
    myGroups = [];
  }
  // Gets all the members and leaders of each group
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
  switch (ctx.accepts(['json', 'html'])) {
    case 'json':
      ctx.body = notMyGroups.concat(myGroups);
      break;
    case 'html':
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
      break;
    default:
      break;
  }
});

router.get('groups.new', '/new', async (ctx) => {
  const group = ctx.orm.group.build();
  await ctx.render('groups/new', {
    group,
    genresList,
    submitGroupPath: ctx.router.url('groups.create'),
  });
});

router.post('groups.create', '/', async (ctx) => {
  const group = ctx.orm.group.build(ctx.request.body);
  if (!Array.isArray(ctx.request.body.instruments)) {
    const instrumentArray = [];
    instrumentArray.push(ctx.request.body.instruments);
    group.instruments = instrumentArray;
  }
  const userGroup = ctx.orm.usergroup.build();
  if (!group.validateVancancies(group.avaincies)) {
    await ctx.render('groups/new', {
      group,
      genresList,
      submitGroupPath: ctx.router.url('groups.create'),
      error: 'Your vacancies are not valid',
    });
  } else {
    try {
      let imageUrl = null;
      if (ctx.request.files.image.size) {
        const imageObj = await cloudinary.uploader.upload(ctx.request.files.image.path);
        imageUrl = imageObj.url;
      }
      if (ctx.state.currentUser) {
        group.leader_id = ctx.state.currentUser.id;
        await group.save({ fields: ['name', 'date', 'instruments', 'genre', 'description', 'avaincies', 'leader_id', 'rating'] });
        await group.update({ photo: imageUrl }, { fields: ['photo'] });
      }
      if (ctx.state.currentUser) {
        userGroup.userId = ctx.state.currentUser.id;
        userGroup.groupId = group.id;
        await userGroup.save({ fields: ['userId', 'groupId'] });
      }
      ctx.redirect(ctx.router.url('groups.list'));
    } catch (validationError) {
      await ctx.render('groups/new', {
        group,
        genresList,
        errors: validationError.errors,
        submitGroupPath: ctx.router.url('groups.create'),
      });
    }
  }
});

router.get('groups.edit', '/:id/edit', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== group.leader_id) {
    ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
  }
  if (!ctx.state.currentUser) {
    ctx.redirect(ctx.router.url('session.new'));
  }
  const strGroup = JSON.stringify(group);
  const occupants = await ctx.orm.usergroup.findAll({ where: { groupId: group.id } });
  await ctx.render('groups/edit', {
    strGroup,
    occupants,
    genresList,
    submitGroupPath: ctx.router.url('groups.update', { id: group.id }),
  });
});

router.patch('groups.update', '/:id', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  let imageUrl;
  if (ctx.request.files.image.size) {
    const imageObj = await cloudinary.uploader.upload(ctx.request.files.image.path);
    imageUrl = imageObj.url;
    if (group.photo) {
      const urlList = group.photo.split('/');
      const imageWithExtension = urlList[urlList.length - 1];
      const publicId = imageWithExtension.split('.').shift();
      await cloudinary.uploader.destroy(publicId);
    }
  } else {
    imageUrl = group.photo;
  }
  try {
    const {
      name, date, instruments, genre, description, avaincies,
    } = ctx.request.body;
    let instrumentArray = [];
    if (!Array.isArray(instruments)) {
      instrumentArray.push(instruments);
    } else {
      instrumentArray = instruments;
    }
    await group.update({
      name, date, genre, description, avaincies,
    });
    await group.update({ photo: imageUrl, instruments: instrumentArray }, { fields: ['photo', 'instruments'] });
    ctx.redirect(ctx.router.url('groups.list'));
  } catch (validationError) {
    const strGroup = JSON.stringify(group);
    const occupants = await ctx.orm.usergroup.findAll({ where: { groupId: group.id } });
    await ctx.render('groups/edit', {
      group,
      strGroup,
      occupants,
      genresList,
      errors: validationError.errors,
      submitGroupPath: ctx.router.url('groups.update', { id: group.id }),
    });
  }
});

router.del('groups.delete', '/:id', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  if (group.photo) {
    const urlList = group.photo.split('/');
    const imageWithExtension = urlList[urlList.length - 1];
    const publicId = imageWithExtension.split('.').shift();
    await cloudinary.uploader.destroy(publicId);
  }
  await group.destroy();
  ctx.redirect(ctx.router.url('groups.list'));
});

router.get('groups.remove', '/:id/remove/:userId', loadGroup, loadUser, async (ctx) => {
  const { group } = ctx.state;
  const { user } = ctx.state;
  await ctx.orm.usergroup.findAll({
    limit: 1,
    where: { userId: user.id, groupId: group.id },
  }).then(async (member) => { await member[0].destroy(); });

  ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
});

router.get('groups.show', '/:id', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  const groupLeader = await ctx.orm.user.findByPk(group.leader_id);
  const occupants = await ctx.orm.usergroup.findAll({ where: { groupId: group.id } });
  const groupMembers = []; const groupMembersPromiseList = [];
  const postulants = []; const postulantsPromiseList = [];
  // Get the usergroup corresponding to the current user
  let usergroup;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== groupLeader.id) {
    await ctx.orm.usergroup.findOne({
      where: {
        userId: ctx.state.currentUser.id,
        groupId: group.id,
      },
    }).then((ug) => { usergroup = ug; });
  }
  // Get all postulations for this group
  let postulationsList = await ctx.orm.postulation.findAll({
    where: { groupId: group.id, status: 'Pending' },
  });
  // Get all postulating users and resolve promises
  postulationsList.forEach((element) => {
    postulantsPromiseList.push(ctx.orm.user.findByPk(element.userId)
      .then((postulant) => postulants.push(postulant)));
  });
  await Promise.all(postulantsPromiseList);
  // If group is full, reject all remaining postulations
  if (group.avaincies - occupants.length <= 0) {
    postulationsList.forEach(async (postulation) => {
      await postulation.update({ status: 'Rejected' }, { fields: ['status'] });
    });
    postulationsList = [];
  }
  // Get all group members
  occupants.forEach((occupant) => {
    groupMembersPromiseList.push(ctx.orm.user.findByPk(occupant.userId)
      .then((member) => groupMembers.push(member)));
  });
  await Promise.all(groupMembersPromiseList);
  // Check if currentUser is member
  let isMember = false;
  groupMembers.forEach((member) => {
    if (ctx.state.currentUser && (ctx.state.currentUser.id === member.id)) isMember = true;
  });
  // Get wanted instruments
  const occupiedInstruments = await ctx.orm.usergroup.findAll({ where: { groupId: group.id } })
    .map((x) => x.instrument);
  const wantedInstruments = group.instruments.filter((x) => !occupiedInstruments.includes(x));
  await ctx.render('groups/show', {
    group,
    usergroup,
    groupLeader,
    occupants,
    wantedInstruments,
    postulationsList,
    postulants,
    groupMembers,
    isMember,
    backToGroupsPath: ctx.router.url('groups.list'),
    showMediaPath: ctx.router.url('group_media.show', { id: group.id }),
    editGroupPath: () => ctx.router.url('groups.edit', { id: group.id }),
    deleteGroupPath: () => ctx.router.url('groups.delete', { id: group.id }),
    newPostulationPath: () => ctx.router.url('group_postulations.new', { groupId: group.id }),
    rateGroupPath: () => ctx.router.url('groups.rate', { id: group.id }),
    removeFromGroupPath: (member) => ctx.router.url('groups.remove', { id: group.id, userId: member.id }),
    deletePostulationPath: (postulation) => ctx.router.url('group_postulations.delete', { id: postulation.id, groupId: group.id }),
    acceptPostulationPath: (postulation) => ctx.router.url('group_postulations.accept', { id: postulation.id, groupId: group.id }),
    rejectPostulationPath: (postulation) => ctx.router.url('group_postulations.reject', { id: postulation.id, groupId: group.id }),
    goToGroupChat: () => ctx.router.url('groups.chat', { id: group.id }),
    notice: ctx.flashMessage.notice,
  });
});

router.patch('groups.rate', '/:id/rate', loadGroup, async (ctx) => {
  const { rating } = ctx.request.body;
  const { group } = ctx.state;
  const groupLeader = await ctx.orm.user.findByPk(group.leader_id);
  let usergroup;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== groupLeader.id) {
    await ctx.orm.usergroup.findOne({
      where: {
        userId: ctx.state.currentUser.id,
        groupId: group.id,
      },
    }).then((ug) => { usergroup = ug; });
  } else {
    ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
  }
  if (!usergroup) ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
  const newAllRatings = group.allratings + 1;
  const newRating = ((group.rating * group.allratings) + Number(rating)) / (newAllRatings);
  group.rating = newRating;
  group.allratings = newAllRatings;
  await group.update({ rating: newRating, allratings: newAllRatings });
  await usergroup.update({ rated: true }, { fields: ['rated'] });
  ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
});

router.get('groups.chat', '/:id/chat', loadGroup, async (ctx) => {
  const { group } = ctx.state;
  const occupants = await ctx.orm.usergroup.findAll({ where: { groupId: group.id } });
  const groupMembers = []; const groupMembersPromiseList = [];
  let chatUser = null;
  let strUser = null;
  let messages = null;
  occupants.forEach((occupant) => {
    groupMembersPromiseList.push(ctx.orm.user.findByPk(occupant.userId)
      .then((member) => groupMembers.push(member.id)));
  });
  await Promise.all(groupMembersPromiseList);
  if (ctx.state.currentUser && groupMembers.includes(ctx.state.currentUser.id)) {
    chatUser = {
      name: `${ctx.state.currentUser.first_name} ${ctx.state.currentUser.last_name}`,
      id: ctx.state.currentUser.id,
      groupId: String(group.id),
    };
    strUser = JSON.stringify(chatUser);
    messages = JSON.stringify(await ctx.orm.chatmessage.findAll({
      where: { groupId: group.id },
      order: [
        ['date', 'ASC'],
      ],
    }));
    await ctx.render('groups/chat', {
      chatUser,
      strUser,
      messages,
      group,
      newMessagePath: ctx.router.url('groups.saveMessage'),
    });
  } else {
    ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
  }
});

router.post('groups.saveMessage', '/newMessage', async (ctx) => {
  const groupId = Number(JSON.parse(ctx.request.body.groupId));
  const messagesArray = JSON.parse(ctx.request.body.messages);
  const messagesPromiseList = [];
  messagesArray.forEach((messageObject) => {
    const chatmessage = ctx.orm.chatmessage.build(messageObject);
    messagesPromiseList.push(chatmessage.save({ fields: ['content', 'userName', 'userId', 'groupId', 'date'] }));
  });
  await Promise.all(messagesPromiseList);
  if (groupId) {
    ctx.redirect(ctx.router.url('groups.show', { id: groupId }));
  } else {
    ctx.redirect(ctx.router.url('groups.list'));
  }
});

module.exports = router;
