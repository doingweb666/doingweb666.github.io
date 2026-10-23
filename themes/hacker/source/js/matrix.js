(function () {
  'use strict';

  var canvas = document.getElementById('matrix');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var config = {
    opacity: parseFloat(canvas.getAttribute('data-opacity')) || 0.15,
    fontSize: parseInt(canvas.getAttribute('data-font-size'), 10) || 16,
    speed: parseFloat(canvas.getAttribute('data-speed')) || 1,
    enabled: canvas.getAttribute('data-enabled') !== 'false'
  };

  var storageKey = 'hacker-matrix';
  var stored = null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch (e) {
    stored = null;
  }

  var forceOn = false;
  try {
    forceOn = new URLSearchParams(window.location.search).get('matrix') === 'on';
  } catch (e) {
    forceOn = false;
  }

  var enabled = config.enabled && (forceOn || (!reducedMotion && stored !== 'off'));
  var glyphs = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]<>/\\$#@%&*+=;:';
  var columns = 0;
  var drops = [];
  var speeds = [];
  var fontSize = config.fontSize;
  var dpr = 1;
  var width = 0;
  var height = 0;
  var lastFrame = 0;
  var frameId = 0;

  canvas.style.opacity = String(enabled ? config.opacity : 0);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (width < 640) {
      fontSize = 13;
    } else if (width < 1080) {
      fontSize = 15;
    } else {
      fontSize = config.fontSize;
    }

    columns = Math.ceil(width / fontSize);
    drops = new Array(columns);
    speeds = new Array(columns);

    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * -height / fontSize;
      speeds[i] = (0.55 + Math.random() * 0.9) * config.speed;
    }

    ctx.fillStyle = 'rgba(4, 7, 15, 0.35)';
    ctx.fillRect(0, 0, width, height);
    seed();
  }

  function seed() {
    ctx.font = fontSize + 'px "Cascadia Code", ui-monospace, Consolas, monospace';
    var count = Math.min(220, columns * 4);
    for (var i = 0; i < count; i++) {
      ctx.fillStyle = 'rgba(56, 189, 248, ' + (0.12 + Math.random() * 0.22).toFixed(3) + ')';
      ctx.fillText(glyphs.charAt(Math.floor(Math.random() * glyphs.length)), Math.random() * width, Math.random() * height);
    }
  }

  function draw(timestamp) {
    if (!enabled) {
      frameId = 0;
      return;
    }

    frameId = window.requestAnimationFrame(draw);

    if (document.hidden) return;
    if (timestamp - lastFrame < 55) return;
    lastFrame = timestamp;

    ctx.fillStyle = 'rgba(4, 7, 15, 0.09)';
    ctx.fillRect(0, 0, width, height);
    ctx.font = fontSize + 'px "Cascadia Code", ui-monospace, Consolas, monospace';

    for (var i = 0; i < columns; i++) {
      var char = glyphs.charAt(Math.floor(Math.random() * glyphs.length));
      var y = drops[i] * fontSize;
      var bright = Math.random() > 0.975;

      ctx.fillStyle = bright ? 'rgba(205, 240, 255, 0.95)' : 'rgba(56, 189, 248, 0.62)';
      ctx.fillText(char, i * fontSize, y);

      drops[i] += speeds[i];

      if (y > height && Math.random() > 0.975) {
        drops[i] = Math.random() * -18;
        speeds[i] = (0.55 + Math.random() * 0.9) * config.speed;
      }
    }
  }

  function start() {
    if (!frameId) {
      lastFrame = 0;
      frameId = window.requestAnimationFrame(draw);
    }
  }

  function stop() {
    if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
    ctx.clearRect(0, 0, width, height);
  }

  function setEnabled(value) {
    enabled = !!value;
    canvas.style.opacity = String(enabled ? config.opacity : 0);

    if (enabled) {
      start();
    } else {
      stop();
    }

    try {
      window.localStorage.setItem(storageKey, enabled ? 'on' : 'off');
    } catch (e) {
      /* storage may be unavailable */
    }

    window.dispatchEvent(new CustomEvent('matrix:change', { detail: { enabled: enabled } }));
  }

  window.matrixRain = {
    isEnabled: function () {
      return enabled;
    },
    setEnabled: setEnabled
  };

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resize();
      if (enabled) {
        lastFrame = 0;
      }
    }, 180);
  });

  document.addEventListener('visibilitychange', function () {
    lastFrame = 0;
  });

  resize();
  if (enabled) start();
})();
