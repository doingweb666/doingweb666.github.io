(function () {
  'use strict';

  var doc = document;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- glitch text ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('.glitch'), function (el) {
    if (!el.getAttribute('data-text')) {
      el.setAttribute('data-text', (el.textContent || '').trim());
    }
  });

  /* ---------- mobile navigation ---------- */
  var navToggle = doc.getElementById('nav-toggle');
  var siteNav = doc.getElementById('site-nav');

  if (navToggle && siteNav) {
    var setNav = function (open) {
      siteNav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    };

    navToggle.addEventListener('click', function () {
      setNav(!siteNav.classList.contains('is-open'));
    });

    siteNav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setNav(false);
    });

    doc.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteNav.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });
  }

  /* ---------- typed terminal command ---------- */
  var typed = doc.querySelector('[data-type]');
  var typedOut = doc.querySelector('[data-whoami]');

  var revealOutput = function () {
    if (typedOut) typedOut.classList.add('is-on');
  };

  if (typed) {
    var command = typed.getAttribute('data-type') || '';

    if (reducedMotion || !command) {
      typed.textContent = command;
      revealOutput();
    } else {
      typed.textContent = '';
      var index = 0;

      var typeNext = function () {
        typed.textContent = command.slice(0, index + 1);
        index += 1;

        if (index < command.length) {
          window.setTimeout(typeNext, 72 + Math.random() * 55);
        } else {
          window.setTimeout(revealOutput, 200);
        }
      };

      window.setTimeout(typeNext, 700);
    }
  }

  /* ---------- copy code ---------- */
  var copyText = function (text, button) {
    var done = function () {
      button.textContent = 'COPIED';
      button.classList.add('is-copied');
      window.setTimeout(function () {
        button.textContent = 'COPY';
        button.classList.remove('is-copied');
      }, 1600);
    };

    var fallback = function () {
      var area = doc.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      doc.body.appendChild(area);
      area.select();

      try {
        doc.execCommand('copy');
        done();
      } catch (e) {
        /* ignore */
      }

      doc.body.removeChild(area);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  };

  Array.prototype.forEach.call(doc.querySelectorAll('figure.highlight'), function (figure) {
    var code = figure.querySelector('.code pre') || figure.querySelector('pre');
    if (!code) return;

    var lang = 'code';
    Array.prototype.forEach.call(figure.classList, function (name) {
      if (name !== 'highlight' && name !== 'js' && lang === 'code') lang = name;
    });

    var head = doc.createElement('div');
    head.className = 'code-head';

    var label = doc.createElement('span');
    label.className = 'code-lang';
    label.textContent = lang;

    var button = doc.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'COPY';

    button.addEventListener('click', function () {
      copyText(code.innerText.replace(/\n$/, ''), button);
    });

    head.appendChild(label);
    head.appendChild(button);
    figure.insertBefore(head, figure.firstChild);
  });

  Array.prototype.forEach.call(doc.querySelectorAll('.prose > pre'), function (pre) {
    if (pre.closest('figure.highlight')) return;

    var plainText = pre.innerText.replace(/\n$/, '');
    var button = doc.createElement('button');
    button.type = 'button';
    button.className = 'code-copy code-copy--float';
    button.textContent = 'COPY';

    button.addEventListener('click', function () {
      copyText(plainText, button);
    });

    pre.classList.add('plain-pre');
    pre.appendChild(button);
  });

  /* ---------- reading progress + back to top ---------- */
  var progress = doc.getElementById('progress');
  var toTop = doc.getElementById('to-top');
  var scrollQueued = false;

  var updateScroll = function () {
    var y = window.scrollY || window.pageYOffset;
    var docHeight = doc.documentElement.scrollHeight - window.innerHeight;

    if (progress) {
      var ratio = docHeight > 0 ? Math.min(Math.max(y / docHeight, 0), 1) : 0;
      progress.style.width = (ratio * 100).toFixed(2) + '%';
    }

    if (toTop) {
      toTop.classList.toggle('is-visible', y > 620);
    }

    scrollQueued = false;
  };

  var requestScroll = function () {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateScroll);
    }
  };

  window.addEventListener('scroll', requestScroll, { passive: true });
  updateScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- table of contents highlight ---------- */
  var tocLinks = Array.prototype.slice.call(doc.querySelectorAll('.toc-list a[href^="#"]'));

  if (tocLinks.length && 'IntersectionObserver' in window) {
    var linkMap = {};
    var headings = [];

    tocLinks.forEach(function (link) {
      var id = '';

      try {
        id = decodeURIComponent(link.getAttribute('href').slice(1));
      } catch (e) {
        id = link.getAttribute('href').slice(1);
      }

      var heading = doc.getElementById(id);
      if (heading) {
        linkMap[id] = link;
        headings.push(heading);
      }
    });

    var setActive = function (id) {
      tocLinks.forEach(function (link) {
        link.classList.remove('is-active');
      });
      if (linkMap[id]) linkMap[id].classList.add('is-active');
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-12% 0px -72% 0px', threshold: 0 });

    headings.forEach(function (heading) {
      observer.observe(heading);
    });
  }

  /* ---------- matrix rain toggle ---------- */
  var matrixButton = doc.getElementById('matrix-toggle');

  if (matrixButton) {
    if (window.matrixRain) {
      var paintMatrixButton = function () {
        var on = window.matrixRain.isEnabled();
        matrixButton.textContent = 'MATRIX: ' + (on ? 'ON' : 'OFF');
        matrixButton.setAttribute('aria-pressed', on ? 'true' : 'false');
      };

      paintMatrixButton();

      matrixButton.addEventListener('click', function () {
        window.matrixRain.setEnabled(!window.matrixRain.isEnabled());
        paintMatrixButton();
      });
    } else {
      matrixButton.style.display = 'none';
    }
  }
})();
