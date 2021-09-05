module.exports = function sendGroupPostulationEmail(
  ctx, { groupLeader }, { user }, { postulation }, { group },
) {
  return ctx.sendMail('group-postulation-alert', { to: groupLeader.email, subject: 'You have a new postulation for your group' }, { user, postulation, group });
};
