const KoaRouter = require('koa-router');

const router = new KoaRouter();

const Hashids = require('hashids/cjs');

const hashids = new Hashids();


router.get('session.new', '/new', (ctx) => {
  if (ctx.state.currentUser) {
    ctx.redirect('/');
  }
  const email = '';
  return ctx.render('session/new', {
    email,
    createSessionPath: ctx.router.url('session.create'),
    newUserPath: ctx.router.url('users.new'),
    notice: ctx.flashMessage.notice,
  });
});

router.put('session.create', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.user.findOne({ where: { email } });
  if (user) {
    if (!user.confirmed) {
      ctx.flashMessage.notice = 'Please confirm your email to login';
      return ctx.render('session/new', {
        email,
        createSessionPath: ctx.router.url('session.create'),
        newUserPath: ctx.router.url('users.new'),
        notice: ctx.flashMessage.notice,
      });
    }
    const isPasswordCorrect = user && await user.checkPassword(password);
    if (isPasswordCorrect) {
      ctx.session.userId = hashids.encode(user.id);
      return ctx.redirect('/');
    }
  }
  ctx.flashMessage.notice = 'Incorrect e-mail or password! If you do not have an account, create one below.';
  return ctx.render('session/new', {
    email,
    createSessionPath: ctx.router.url('session.create'),
    newUserPath: ctx.router.url('users.new'),
    notice: ctx.flashMessage.notice,
  });
});

router.delete('session.destroy', '/', (ctx) => {
  ctx.session = null;
  ctx.redirect(ctx.router.url('session.new'));
});


module.exports = router;
