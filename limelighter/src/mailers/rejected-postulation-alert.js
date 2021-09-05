module.exports = function sendRejectedPostulationEmail(
  ctx, { user }, { postulation }, { announcement },
) {
  return ctx.sendMail('rejected-postulation-alert', { to: user.email, subject: 'You postulation has been rejected' }, { user, postulation, announcement });
};
