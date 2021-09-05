module.exports = function sendRegistrationEmail(ctx, { user }, { emailToken }) {
  return ctx.sendMail('registration-alert', { to: user.email, subject: 'You have created an account in Limelighter' }, { user, emailToken });
};
