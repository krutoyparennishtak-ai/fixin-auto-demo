(function () {
  const wheel = document.getElementById('heroWheel');
  const hero = document.getElementById('hero');
  const scrollIndicator = document.querySelector('.hero__scroll-indicator');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateAnimations);
  }

  function updateAnimations() {
    const scrollY = window.scrollY;
    const heroH = hero.offsetHeight;

    if (scrollY < heroH * 1.2) {
      const rotation = scrollY * 0.35;
      const parallaxY = scrollY * 0.15;
      const opacity = Math.max(0, 1 - scrollY / (heroH * 0.8));

      wheel.style.transform =
        'rotate(' + rotation + 'deg) translateY(' + parallaxY + 'px)';
      wheel.style.opacity = opacity * 0.25;

      if (scrollIndicator) {
        var indicatorOpacity = Math.max(0, 1 - scrollY / (heroH * 0.25));
        scrollIndicator.style.opacity = indicatorOpacity;
      }
    }

    ticking = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Count-up animation for stats
  var statNumbers = document.querySelectorAll('.stat__number[data-target]');
  if (statNumbers.length > 0) {
    var statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      statsObserver.observe(el);
    });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var duration = 1500;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('en-US') + '+';
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('en-US') + '+';
      }
    }

    requestAnimationFrame(step);
  }

  // Stagger reveal for service cards and price cards
  var staggerContainers = ['.services__grid', '.prices__grid'];
  staggerContainers.forEach(function (selector) {
    var container = document.querySelector(selector);
    if (!container) return;
    var cards = container.querySelectorAll('.reveal');
    cards.forEach(function (card, i) {
      card.style.transitionDelay = i * 100 + 'ms';
    });
  });
})();
