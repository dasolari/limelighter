const KoaRouter = require('koa-router');

const sendGroupPostulationEmail = require('../mailers/group-postulation-alert');
const sendAcceptedGroupEmail = require('../mailers/accepted-group-alert');
const sendRejectedGroupEmail = require('../mailers/rejected-group-alert');

const router = new KoaRouter();

async function loadPostulation(ctx, next) {
  ctx.state.postulation = await ctx.orm.postulation.findByPk(ctx.params.id);
  return next();
}

async function loadGroup(ctx, next) {
  ctx.state.group = await ctx.orm.group.findByPk(ctx.params.groupId);
  return next();
}

router.get('group_postulations.new', '/new', loadGroup, async (ctx) => {
  const postulation = ctx.orm.postulation.build();
  const { group } = ctx.state;
  const occupants = await ctx.orm.usergroup.findAll({ where: { groupId: group.id } });
  if (group.postulants && ctx.state.currentUser) {
    if (group.postulants.includes(ctx.state.currentUser.id)) {
      ctx.flashMessage.notice = 'You already applied to this group!';
      ctx.redirect(ctx.router.url('groups.list'));
    }
  }
  if (occupants.length >= group.avaincies) {
    ctx.flashMessage.notice = 'This group is full!';
    ctx.redirect(ctx.router.url('groups.list'));
  }
  await ctx.render('postulations/new', {
    postulation,
    submitPostulationPath: ctx.router.url('group_postulations.create', { groupId: group.id }),
  });
});

router.post('group_postulations.create', '/', loadGroup, async (ctx) => {
  const postulation = ctx.orm.postulation.build(ctx.request.body);
  const { group } = ctx.state;
  const { postulants } = group;
  const user = ctx.state.currentUser;
  const groupLeader = await ctx.orm.user.findByPk(group.leader_id);
  let postulantsList = [];
  try {
    if (ctx.state.currentUser) {
      postulation.userId = ctx.state.currentUser.id;
    }
    postulation.groupId = group.id;
    await postulation.save({ fields: ['description', 'date', 'status', 'userId', 'groupId', 'announcementId'] });
    if (postulants !== null) {
      postulantsList = postulants;
    }
    postulantsList.push(ctx.state.currentUser.id);
    await group.update({ postulants: postulantsList }, { fields: ['postulants'] });
    await sendGroupPostulationEmail(ctx, { groupLeader }, { user }, { postulation }, { group });
    ctx.redirect(ctx.router.url('groups.list'));
  } catch (validationError) {
    await ctx.render('postulations/new', {
      postulation,
      errors: validationError.errors,
      submitPostulationPath: ctx.router.url('group_postulations.create', { groupId: group.id }),
    });
  }
});

router.post('group_postulations.accept', '/:id/accept', loadPostulation, loadGroup, async (ctx) => {
  const { postulation } = ctx.state;
  const { group } = ctx.state;
  const { instrument } = ctx.request.body;
  const userGroup = ctx.orm.usergroup.build();
  const user = await ctx.orm.user.findByPk(postulation.userId);
  await postulation.update({ status: 'Accepted' }, { fields: ['status'] });
  userGroup.userId = postulation.userId;
  userGroup.groupId = group.id;
  userGroup.instrument = instrument;
  await userGroup.save({ fields: ['userId', 'groupId', 'instrument'] });
  await sendAcceptedGroupEmail(ctx, { user }, { postulation }, { group });
  ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
});

router.get('group_postulations.reject', '/:id/reject', loadPostulation, loadGroup, async (ctx) => {
  const { postulation } = ctx.state;
  const { group } = ctx.state;
  const user = await ctx.orm.user.findByPk(postulation.userId);
  await postulation.update({ status: 'Rejected' }, { fields: ['status'] });
  await sendRejectedGroupEmail(ctx, { user }, { postulation }, { group });
  ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
});

router.del('group_postulations.delete', '/:id', loadPostulation, loadGroup, async (ctx) => {
  const { postulation } = ctx.state;
  const { group } = ctx.state;
  const { postulants } = group;
  const postulantsList = postulants;
  if (postulation.status === 'Pending') {
    const index = postulantsList.indexOf(ctx.state.currentUser.id);
    if (index > -1) {
      postulantsList.splice(index, 1);
    }
    await group.update({ postulants: postulantsList }, { fields: ['postulants'] });
  }
  await postulation.destroy();
  ctx.redirect(ctx.router.url('groups.show', { id: group.id }));
});


module.exports = router;
