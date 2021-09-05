module.exports = function sendAcceptedPostulationEmail(
  ctx, { user }, { postulation }, { announcement },
) {
  return ctx.sendMail('accepted-postulation-alert', { to: user.email, subject: 'You postulation has been accepted' }, { user, postulation, announcement });
};
