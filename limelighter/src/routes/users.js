const KoaRouter = require('koa-router');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const cloudinary = require('cloudinary');
const sendRegistrationEmail = require('../mailers/registration-alert');

const router = new KoaRouter();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

async function loadUser(ctx, next) {
  ctx.state.user = await ctx.orm.user.findByPk(ctx.params.id);
  const { user } = ctx.state;
  if (!user) {
    ctx.flashMessage.notice = 'This user does not exist (404)';
    return ctx.redirect(ctx.router.url('users.list'));
  }
  return next();
}

router.get('users.new', '/new', async (ctx) => {
  const user = ctx.orm.user.build();
  const emails = await ctx.orm.user.findAll().map((x) => x.email);
  await ctx.render('users/new', {
    user,
    emails,
    submitUserPath: ctx.router.url('users.create'),
    notice: ctx.flashMessage.notice,
  });
});

router.post('users.create', '/', async (ctx) => {
  const user = ctx.orm.user.build(ctx.request.body);
  const otherEmails = await ctx.orm.user.findAll({ where: { email: user.email } });
  if (!user.validateEmail(user.email) || otherEmails.length) {
    ctx.flashMessage.notice = 'Your email is not valid or already exists!';
    ctx.redirect(ctx.router.url('users.new'));
  } else if (!user.validatePassword(user.password)) {
    ctx.flashMessage.notice = 'Your entered an invalid password!';
    ctx.redirect(ctx.router.url('users.new'));
  } else if (user.phone_number && !user.validatePhone(user.phone_number)) {
    ctx.flashMessage.notice = 'You entered an invalid phone number!';
    ctx.redirect(ctx.router.url('users.new'));
  } else {
    try {
      let imageUrl = null;
      if (ctx.request.files.image.size) {
        const imageObj = await cloudinary.uploader.upload(ctx.request.files.image.path);
        imageUrl = imageObj.url;
      }
      await user.save({
        fields: ['first_name', 'last_name', 'email', 'password',
          'country', 'city', 'state_region_province', 'address',
          'phone_number', 'rating', 'musician', 'instruments', 'links'],
      });
      await user.update({ photo: imageUrl }, { fields: ['photo'] });
      try {
        const emailToken = jwt.sign(
          {
            user: user.id,
          },
          process.env.EMAIL_SECRET,
          {
            expiresIn: '1h',
          },
        );
        await sendRegistrationEmail(ctx, { user }, { emailToken });
      } catch (error) {
        ctx.flashMessage.notice = 'There was an error processing your mail! Please try another one.';
      }
      ctx.flashMessage.notice = 'Please confirm your email to login';
      ctx.redirect(ctx.router.url('session.new'));
    } catch (validationError) {
      const emails = await ctx.orm.user.findAll().map((x) => x.email);
      ctx.flashMessage.notice = 'There was an error processing your request! Please try again later.';
      await ctx.render('users/new', {
        user,
        emails,
        submitUserPath: ctx.router.url('users.create'),
        notice: ctx.flashMessage.notice,
      });
    }
  }
});

router.get('users.list', '/', async (ctx) => {
  let users;
  if (ctx.state.currentUser) {
    users = await ctx.orm.user.findAll({ where: { id: { [Op.ne]: ctx.state.currentUser.id } } });
  } else {
    users = await ctx.orm.user.findAll();
  }
  switch (ctx.accepts(['json', 'html'])) {
    case 'json':
      ctx.body = users;
      break;
    case 'html':
      await ctx.render('users/index', {
        users,
        showUserPath: (user) => ctx.router.url('users.show', { id: user.id }),
        searchUserPath: () => ctx.router.url('searches.users'),
        notice: ctx.flashMessage.notice,
      });
      break;
    default:
      break;
  }
});

router.get('users.edit', '/:id/edit', loadUser, async (ctx) => {
  const { user } = ctx.state;
  if (ctx.state.currentUser && ctx.state.currentUser.id !== user.id) {
    ctx.redirect(ctx.router.url('users.edit', { id: ctx.state.currentUser.id }));
  }
  if (!ctx.state.currentUser) {
    ctx.redirect(ctx.router.url('session.new'));
  }
  const strUser = JSON.stringify(user);
  await ctx.render('users/edit', {
    strUser,
    editUserPath: ctx.router.url('users.update', { id: user.id }),
    deleteUserPath: ctx.router.url('users.delete', { id: user.id }),
    notice: ctx.flashMessage.notice,
  });
});

router.patch('users.update', '/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const nameBefore = `${user.first_name} ${user.last_name}`;
  let imageUrl;
  if (ctx.request.files.image.size) {
    const imageObj = await cloudinary.uploader.upload(ctx.request.files.image.path);
    imageUrl = imageObj.url;
    if (user.photo) {
      const urlList = user.photo.split('/');
      const imageWithExtension = urlList[urlList.length - 1];
      const publicId = imageWithExtension.split('.').shift();
      await cloudinary.uploader.destroy(publicId);
    }
  } else {
    imageUrl = user.photo;
  }
  try {
    const {
      firstName, lastName, password, country, city, stateRegionProvince, address, phoneNumber,
    } = ctx.request.body;
    await user.update({
      first_name: firstName,
      last_name: lastName,
      password,
      country,
      city,
      state_region_province: stateRegionProvince,
      address,
      phone_number: phoneNumber,
    }, {
      fields: ['first_name', 'last_name', 'password', 'country', 'city', 'state_region_province', 'address', 'phone_number'],
    });
    await user.update({
      firstName, lastName, password, country, city, stateRegionProvince, address, phoneNumber,
    });
    await user.update({ photo: imageUrl }, { fields: ['photo'] });
    const nameAfter = `${user.first_name} ${user.last_name}`;
    if (nameBefore !== nameAfter) {
      const userMessages = await ctx.orm.chatmessage.findAll({ where: { userId: user.id } });
      userMessages.forEach(async (message) => {
        await message.update({ userName: nameAfter }, { fields: ['userName'] });
      });
    }
    ctx.redirect(ctx.router.url('users.show', { id: user.id }));
  } catch (validationError) {
    await ctx.render('users/edit', {
      user,
      errors: validationError.errors,
      editUserPath: ctx.router.url('users.update', { id: user.id }),
    });
  }
});

router.del('users.delete', '/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  if (user.photo) {
    const urlList = user.photo.split('/');
    const imageWithExtension = urlList[urlList.length - 1];
    const publicId = imageWithExtension.split('.').shift();
    await cloudinary.uploader.destroy(publicId);
  }
  const hisGroups = await ctx.orm.usergroup.findAll({
    where: { userId: user.id },
  }).map((ug) => ug.groupId);
  if (hisGroups) {
    hisGroups.forEach(async (groupId) => {
      const group = await ctx.orm.group.findByPk(groupId);
      await ctx.orm.usergroup.findOne({ where: { userId: { [Op.ne]: user.id }, groupId } })
        .then(async (usergroup) => {
          if (usergroup && group) {
            await group.update({ leader_id: usergroup.userId }, { fields: ['leader_id'] });
          } else if (group) {
            await group.destroy();
          }
        });
    });
  }
  await user.destroy();
  ctx.session = null;
  ctx.redirect(ctx.router.url('session.new'));
});

router.get('users.show', '/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const preUserSC = await ctx.orm.usersoundcloud.findAll({ where: { userId: user.id } });
  const preUserV = await ctx.orm.uservideo.findAll({ where: { userId: user.id } });
  const userSoundClouds = JSON.stringify(preUserSC);
  const userVideos = JSON.stringify(preUserV);
  const anyMedia = (preUserSC.length) || (preUserV.length);
  let isThisUser = false;
  if (ctx.state.currentUser && (ctx.state.currentUser.id === user.id)) isThisUser = true;
  await ctx.render('users/show', {
    user,
    isThisUser,
    userSoundClouds,
    userVideos,
    anyMedia,
    showMediaPath: ctx.router.url('user_media.show', { id: user.id }),
    addInstrumentLinkPath: () => ctx.router.url('users.addInstrumentsAndLinks', { id: user.id }),
    editUserPath: () => ctx.router.url('users.edit', { id: user.id }),
    removeLinkPath: (link) => ctx.router.url('users.removeLink', { id: user.id, link }),
    goToUserChat: () => ctx.router.url('users.chat', { id: user.id }),
    notice: ctx.flashMessage.notice,
  });
});

router.patch('users.addInstrumentsAndLinks', '/addIorL/:id', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const { linkName, instrument } = ctx.request.body;
  let { link } = ctx.request.body;
  let isThisUser = false;
  let instrumentList = [];
  let isMusician = user.musician;
  let linkList = [];
  if (ctx.state.currentUser) {
    if (ctx.state.currentUser.id === user.id) {
      isThisUser = true;
    }
  }
  try {
    if (instrument) {
      const { instruments } = user;
      if (instruments === null) {
        isMusician = true;
      } else {
        instrumentList = user.instruments;
      }
      instrumentList.push(instrument);
      if (isThisUser) {
        await user.update({ musician: isMusician, instruments: instrumentList }, { fields: ['musician', 'instruments'] });
      }
    }
    if (link) {
      link = link.replace(/(^\w+:|^)\/\//, '');
      const { links } = user;
      if (links) {
        linkList = links;
      }
      linkList.push(JSON.stringify({ linkName, link }));
      if (isThisUser) {
        await user.update({ links: linkList }, { fields: ['links'] });
      }
    }
    ctx.redirect(ctx.router.url('users.show', { id: user.id }));
  } catch (validationError) {
    ctx.redirect(ctx.router.url('users.show', { id: user.id }));
  }
});

router.get('users.removeLink', '/:id/removeLink/:link', loadUser, async (ctx) => {
  const { user } = ctx.state;
  const { link } = ctx.params;
  let isThisUser = false;
  let linkList = [];
  if (ctx.state.currentUser) {
    if (ctx.state.currentUser.id === user.id) {
      isThisUser = true;
      linkList = user.links;
    }
  }
  try {
    const index = linkList.indexOf(link);
    if (index > -1) {
      linkList.splice(index, 1);
    }
    if (isThisUser) {
      await user.update({ links: linkList }, { fields: ['links'] });
    }
    ctx.redirect(ctx.router.url('users.show', { id: user.id }));
  } catch (validationError) {
    ctx.redirect(ctx.router.url('users.show', { id: user.id }));
  }
});

router.get('users.chat', '/:id/chat', loadUser, async (ctx) => {
  const { user } = ctx.state;
  if (!ctx.state.currentUser) {
    ctx.redirect(ctx.router.url('users.show', { id: user.id }));
  }
  const { currentUser } = ctx.state;
  const chatId = (currentUser.id < user.id) ? `${currentUser.id}${user.id}` : `${user.id}${currentUser.id}`;
  const chatUser = {
    name: `${currentUser.first_name} ${currentUser.last_name}`,
    id: currentUser.id,
    chatId,
  };
  const messages = JSON.stringify(await ctx.orm.userchatmessage.findAll({
    where: { chatId },
    order: [
      ['date', 'ASC'],
    ],
  }));
  await ctx.render('users/chat', {
    user,
    chatUser,
    messages,
    newMessagePath: ctx.router.url('users.saveMessage'),
  });
});

router.post('users.saveMessage', '/newMessage', async (ctx) => {
  const userId = `${JSON.parse(ctx.request.body.chatId)}`.replace(`${ctx.state.currentUser.id}`, '');
  const messagesArray = JSON.parse(ctx.request.body.messages);
  const messagesPromiseList = [];
  messagesArray.forEach((messageObject) => {
    const userchatmessage = ctx.orm.userchatmessage.build(messageObject);
    messagesPromiseList.push(userchatmessage.save({ fields: ['content', 'userName', 'userId', 'chatId', 'date'] }));
  });
  await Promise.all(messagesPromiseList);
  if (userId) {
    ctx.redirect(ctx.router.url('users.show', { id: userId }));
  } else {
    ctx.redirect(ctx.router.url('users.list'));
  }
});

module.exports = router;
