module.exports = function sendRejectedGroupEmail(ctx, { user }, { postulation }, { group }) {
  return ctx.sendMail('rejected-group-alert', { to: user.email, subject: 'You postulation has been rejected' }, { user, postulation, group });
};
