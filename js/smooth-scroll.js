(function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var navLinks = document.getElementById('navLinks');
      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
      }

      var offset =
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--banner-height'),
          10
        ) +
        parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height'),
          10
        );

      var top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top: top,
        behavior: 'smooth',
      });
    });
  });
})();
