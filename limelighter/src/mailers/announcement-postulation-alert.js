module.exports = function sendAnnouncementPostulationEmail(
  ctx, { owner }, { user }, { postulation }, { announcement },
) {
  return ctx.sendMail('announcement-postulation-alert', { to: owner.email, subject: 'You have a new postulation for your announcement' }, { user, postulation, announcement });
};
