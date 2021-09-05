if ($('.tips').length) {
  const container = document.getElementsByClassName('tips')[0];
  const user = JSON.parse(container.getAttribute('user'));
  const alwaysShow = container.getAttribute('show') === 'true';
  $('.tips').hide();
  if (!user.musician || alwaysShow) {
    setTimeout(() => {
      $('.tips').fadeIn('slow');
    }, 2000);
  }
  $('.tips-close').click(() => {
    $('.tips').fadeOut('slow');
  });
}
