(function () {
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    var isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.setAttribute(
      'aria-label',
      isOpen ? 'Close menu' : 'Open menu'
    );
  });

  document.addEventListener('click', function (e) {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();
