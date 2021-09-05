module.exports = function sendAcceptedGroupEmail(ctx, { user }, { postulation }, { group }) {
  return ctx.sendMail('accepted-group-alert', { to: user.email, subject: 'You postulation has been accepted' }, { user, postulation, group });
};
