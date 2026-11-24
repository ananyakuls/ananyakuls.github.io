/* Reveal on scroll, one hero moment, and the section index. */
(function () {
  // The header sky interpolates through the day: night navy, dawn rose, morning blue,
  // golden amber, dusk violet, back to night. Every hour is a blend of the two nearest
  // stops. The text stays dark through the bright hours and light through the rest.
  var SKY = [
    [0,   '#0A1124', '#171E3A'],
    [4,   '#070C1A', '#10162C'],
    [5,   '#1E1528', '#33202F'],
    [6,   '#3A2334', '#4E2C3E'],
    [7,   '#714657', '#815464'],
    [8,   '#C79FB2', '#D8B6C6'],
    [9,   '#DCEBF4', '#B8D4E6'],
    [11,  '#D6E9F4', '#A9CCE4'],
    [14.5,'#D6E9F4', '#A9CCE4'],
    [16,  '#F6B24A', '#E08A2E'],
    [17.5,'#F2A63C', '#DC8428'],
    [18,  '#D99A5A', '#B87C46'],
    [19,  '#7C4F60', '#5A3A52'],
    [20,  '#4A3550', '#3A2A42'],
    [21,  '#141C38', '#232C52'],
    [24,  '#0A1124', '#171E3A']
  ];
  function mixColor(from, to, t) {
    var A = parseInt(from.slice(1), 16), B = parseInt(to.slice(1), 16), out = 0;
    for (var s = 16; s >= 0; s -= 8) {
      var a = (A >> s) & 255, b = (B >> s) & 255;
      out |= Math.round(a + (b - a) * t) << s;
    }
    return '#' + ('00000' + out.toString(16)).slice(-6);
  }
  var root = document.documentElement;
  function localHour() { return new Date().getHours(); }
  function paintSky(hour) {
    var i = 0;
    while (i < SKY.length - 2 && hour >= SKY[i + 1][0]) i++;
    var A = SKY[i], B = SKY[i + 1], t = (hour - A[0]) / (B[0] - A[0]);
    root.style.setProperty('--sky-a', mixColor(A[1], B[1], t));
    root.style.setProperty('--sky-b', mixColor(A[2], B[2], t));
    // Dark text through the bright hours, light text through night, dawn and dusk.
    root.style.setProperty('--sky-ink', hour >= 8 && hour <= 18 ? '#1B1216' : '#F4EDE1');
    // Lavender streaks peak at golden hour and are gone by dusk.
    root.style.setProperty('--streak', (hour < 15 || hour > 19 ? 0 : 1 - Math.abs(hour - 17) / 2).toFixed(2));
  }
  // Starts on the visitor's own clock and follows it as hours pass.
  paintSky(localHour());
  setInterval(function () { paintSky(localHour()); }, 60000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) paintSky(localHour());
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  var heroTitle = document.querySelector('.hero__title');

  if (reduce) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    if (heroTitle) heroTitle.classList.add('is-in');
  } else {
    if (heroTitle) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { heroTitle.classList.add('is-in'); });
      });
    }

    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.01, rootMargin: '0px 0px 8% 0px' });

      reveals.forEach(function (el) { revealObserver.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* Active section in the rail. */
  var railLinks = {};
  document.querySelectorAll('[data-rail]').forEach(function (link) {
    railLinks[link.getAttribute('data-rail')] = link;
  });

  var sections = document.querySelectorAll('[data-section]');
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('data-section');
        Object.keys(railLinks).forEach(function (key) {
          railLinks[key].classList.toggle('is-active', key === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }
})();

/* ============================================================
   Section weather
   One small canvas per section, behind the content.
   petal shower · rain · Instagram hearts · snow + salt ·
   gold motes · cells · sparks
   ============================================================ */
(function sectionWeather() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvases = Array.prototype.slice.call(document.querySelectorAll('canvas.weather'));
  if (!canvases.length) return;

  var DPR_CAP = 1.5;

  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function sheet(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  /* ---------- sprites ---------- */

  var PETAL_COLORS = [
    ['#F8C6D6', '#E283A2', '#FFF7EF'],
    ['#E5C6EF', '#AE6FC4', '#FCF3FF'],
    ['#FFF3D6', '#DFBC6E', '#FFFFFF'],
    ['#C4E4D9', '#5E9A8D', '#F3FCF7'],
    ['#D6E1F4', '#7C9AC8', '#FAFDFF'],
    ['#F7C6B4', '#C56755', '#FFF1E7']
  ];

  function petalPath(g, r, c) {
    var grd = g.createLinearGradient(-r, -r, r, r);
    grd.addColorStop(0, c[2]);
    grd.addColorStop(.45, c[0]);
    grd.addColorStop(1, c[1]);
    g.fillStyle = grd;
    g.beginPath();
    g.moveTo(0, -r);
    g.bezierCurveTo(r * .95, -r * .52, r * .82, r * .5, 0, r);
    g.bezierCurveTo(-r * .82, r * .5, -r * .95, -r * .52, 0, -r);
    g.closePath();
    g.fill();
    g.strokeStyle = rgba(c[1], .5);
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(0, -r * .82);
    g.quadraticCurveTo(r * .11, 0, 0, r * .78);
    g.stroke();
  }

  function petalSprite(c) {
    var S = 160, cv = sheet(S, S);
    var g = cv.getContext('2d');
    g.translate(S / 2, S / 2);
    g.filter = 'blur(0.9px)';
    g.shadowColor = 'rgba(70,42,26,.32)';
    g.shadowBlur = 11;
    petalPath(g, S * .36, c);
    g.shadowBlur = 0;
    g.globalAlpha = .3;
    g.fillStyle = c[2];
    g.beginPath();
    g.ellipse(S * .04, -S * .02, S * .15, S * .07, .15, 0, Math.PI * 2);
    g.fill();
    return cv;
  }

  function bloomSprite(c) {
    var S = 240, cv = sheet(S, S);
    var g = cv.getContext('2d');
    g.translate(S / 2, S / 2);
    g.filter = 'blur(1.05px)';
    g.shadowColor = 'rgba(70,42,26,.3)';
    g.shadowBlur = 13;
    for (var i = 0; i < 6; i++) {
      g.save();
      g.rotate(i * Math.PI / 3 + (i % 2 ? .22 : -.16));
      g.translate(0, -32);
      petalPath(g, 32 + (i % 3) * 8, c);
      g.restore();
    }
    g.shadowBlur = 0;
    g.filter = 'none';
    g.globalAlpha = .85;
    g.fillStyle = '#C08A2E';
    g.beginPath();
    g.arc(0, 0, 11, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = .65;
    g.fillStyle = '#F4DC93';
    g.beginPath();
    g.arc(0, 0, 4.5, 0, Math.PI * 2);
    g.fill();
    return cv;
  }

  function heartSprite(fill, outline) {
    var S = 140, cv = sheet(S, S);
    var g = cv.getContext('2d');
    g.translate(S / 2, S / 2);
    g.filter = 'blur(0.55px)';
    g.shadowColor = 'rgba(10,5,5,.2)';
    g.shadowBlur = 9;
    g.beginPath();
    g.moveTo(0, -12);
    g.bezierCurveTo(-8, -38, -48, -30, -38, -4);
    g.bezierCurveTo(-30, 18, -8, 30, 0, 44);
    g.bezierCurveTo(8, 30, 30, 18, 38, -4);
    g.bezierCurveTo(48, -30, 8, -38, 0, -12);
    g.closePath();
    if (outline) {
      g.strokeStyle = fill;
      g.lineWidth = 7;
      g.stroke();
    } else {
      g.fillStyle = fill;
      g.fill();
      g.globalAlpha = .35;
      g.fillStyle = '#FFFFFF';
      g.beginPath();
      g.ellipse(-12, -14, 9, 5, -.5, 0, Math.PI * 2);
      g.fill();
    }
    return cv;
  }

  function rainSprite() {
    var S = 64, cv = sheet(S, S);
    var g = cv.getContext('2d');
    var grd = g.createLinearGradient(0, 0, 0, S);
    grd.addColorStop(0, 'rgba(232,246,250,0)');
    grd.addColorStop(.3, 'rgba(232,246,250,.6)');
    grd.addColorStop(.8, 'rgba(232,246,250,.8)');
    grd.addColorStop(1, 'rgba(232,246,250,0)');
    g.fillStyle = grd;
    g.filter = 'blur(0.6px)';
    g.fillRect(S / 2 - 2, 0, 4, S);
    return cv;
  }

  function snowSprite() {
    var S = 80, cv = sheet(S, S);
    var g = cv.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(.45, 'rgba(255,255,255,.85)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
    g.fill();
    return cv;
  }

  function saltSprite() {
    var S = 48, cv = sheet(S, S);
    var g = cv.getContext('2d');
    g.translate(S / 2, S / 2);
    g.rotate(Math.PI / 4);
    g.filter = 'blur(0.35px)';
    g.fillStyle = 'rgba(255,255,255,.92)';
    g.fillRect(-5, -5, 10, 10);
    g.fillStyle = 'rgba(255,255,255,.55)';
    g.fillRect(-2.5, -2.5, 5, 5);
    return cv;
  }

  function moteSprite(c) {
    var S = 64, cv = sheet(S, S);
    var g = cv.getContext('2d');
    var grd = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    grd.addColorStop(0, rgba(c, 1));
    grd.addColorStop(.4, rgba(c, .75));
    grd.addColorStop(1, rgba(c, 0));
    g.fillStyle = grd;
    g.beginPath();
    g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2);
    g.fill();
    return cv;
  }

  function cellSprite(c) {
    var S = 96, cv = sheet(S, S);
    var g = cv.getContext('2d');
    g.translate(S / 2, S / 2);
    g.filter = 'blur(0.7px)';
    g.fillStyle = rgba(c, .18);
    g.beginPath();
    g.arc(0, 0, 32, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = rgba(c, .55);
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(0, 0, 30, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = rgba(c, .7);
    g.beginPath();
    g.arc(8, -6, 6, 0, Math.PI * 2);
    g.fill();
    return cv;
  }

  function sparkSprite(c) {
    var S = 64, cv = sheet(S, S);
    var g = cv.getContext('2d');
    g.translate(S / 2, S / 2);
    g.filter = 'blur(0.4px)';
    g.fillStyle = rgba(c, .95);
    g.beginPath();
    g.moveTo(0, -26);
    g.quadraticCurveTo(4, -4, 26, 0);
    g.quadraticCurveTo(4, 4, 0, 26);
    g.quadraticCurveTo(-4, 4, -26, 0);
    g.quadraticCurveTo(-4, -4, 0, -26);
    g.fill();
    g.fillStyle = rgba(c, .7);
    g.beginPath();
    g.arc(0, 0, 4, 0, Math.PI * 2);
    g.fill();
    return cv;
  }

  var SPRITES = {
    petals: {
      petals: PETAL_COLORS.map(petalSprite),
      blooms: PETAL_COLORS.map(bloomSprite)
    },
    hearts: ['#FFFFFF', '#FFD3E0', '#F39BB6', '#E4586F']
      .map(function (c) { return heartSprite(c, false); })
      .concat([heartSprite('#FFFFFF', true), heartSprite('#F39BB6', true)]),
    snow: { snow: snowSprite(), salt: saltSprite() },
    rain: rainSprite(),
    motes: ['#F7EFD6', '#E8D6A8', '#B290B8', '#933B5B'].map(moteSprite),
    cells: ['#F7EFD6', '#E8A6A6', '#B290B8', '#BFD6CE'].map(cellSprite),
    sparks: ['#F7EFD6', '#FFD9C4', '#FFFFFF'].map(sparkSprite)
  };

  /* ---------- particles ---------- */

  function makeParticle(theme, W, H, scale) {
    if (theme === 'petals') {
      var bloom = Math.random() < .32;
      var c = (Math.random() * PETAL_COLORS.length) | 0;
      return {
        sprite: bloom ? SPRITES.petals.blooms[c] : SPRITES.petals.petals[c],
        size: (bloom ? rand(92, 168) : rand(26, 66)) * scale,
        x: Math.random() * W, y: Math.random() * H,
        vy: (bloom ? rand(22, 50) : rand(32, 70)) * Math.max(.7, scale),
        vx: rand(-8, 8), sway: rand(8, 24), freq: rand(.4, 1.4), phase: Math.random() * 6.283,
        rot: Math.random() * 6.283, spin: rand(-.35, .35),
        alpha: rand(.5, .85), pad: 180 * scale
      };
    }
    if (theme === 'hearts') {
      return {
        sprite: pick(SPRITES.hearts), size: rand(18, 46) * scale,
        x: Math.random() * W, y: Math.random() * H,
        vy: rand(26, 62) * Math.max(.7, scale),
        vx: rand(-6, 6), sway: rand(12, 30), freq: rand(.5, 1.2), phase: Math.random() * 6.283,
        rot: rand(-.3, .3), spin: rand(-.5, .5),
        alpha: rand(.6, .95), pad: 60
      };
    }
    if (theme === 'snow') {
      var salt = Math.random() < .32;
      return {
        sprite: salt ? SPRITES.snow.salt : SPRITES.snow.snow,
        size: (salt ? rand(4, 10) : rand(5, 15)) * scale,
        x: Math.random() * W, y: Math.random() * H,
        vy: (salt ? rand(38, 85) : rand(18, 52)) * Math.max(.7, scale),
        vx: rand(-6, 6), sway: salt ? rand(2, 8) : rand(6, 24),
        freq: rand(.4, 1.2), phase: Math.random() * 6.283,
        rot: Math.random() * 6.283, spin: salt ? rand(-.6, .6) : rand(-.2, .2),
        alpha: salt ? rand(.6, .95) : rand(.6, .95), pad: 50
      };
    }
    if (theme === 'rain') {
      return {
        sprite: SPRITES.rain, size: rand(22, 54) * Math.max(.7, scale),
        x: Math.random() * W, y: Math.random() * H,
        vy: rand(380, 720), vx: rand(24, 54), sway: rand(0, 4),
        freq: rand(.4, 1), phase: Math.random() * 6.283,
        rot: 0, spin: 0, alpha: rand(.16, .4), pad: 60
      };
    }
    if (theme === 'motes') {
      return {
        sprite: pick(SPRITES.motes), size: rand(3, 9) * Math.max(.8, scale),
        x: Math.random() * W, y: Math.random() * H,
        vy: rand(-12, 8), vx: rand(-4, 4), sway: rand(10, 30),
        freq: rand(.3, 1), phase: Math.random() * 6.283,
        rot: 0, spin: 0, alpha: rand(.25, .55), pad: 30
      };
    }
    if (theme === 'cells') {
      return {
        sprite: pick(SPRITES.cells), size: rand(12, 34) * Math.max(.7, scale),
        x: Math.random() * W, y: Math.random() * H,
        vy: rand(-8, 10), vx: rand(-4, 4), sway: rand(8, 20),
        freq: rand(.2, .8), phase: Math.random() * 6.283,
        rot: Math.random() * 6.283, spin: rand(-.15, .15),
        alpha: rand(.25, .5), pad: 50
      };
    }
    return {
      sprite: pick(SPRITES.sparks), size: rand(6, 16) * Math.max(.7, scale),
      x: Math.random() * W, y: Math.random() * H,
      vy: rand(30, 90), vx: rand(-8, 8), sway: rand(8, 24),
      freq: rand(.4, 1.2), phase: Math.random() * 6.283,
      rot: Math.random() * 6.283, spin: rand(-2, 2),
      alpha: rand(.5, .9), pad: 50
    };
  }

  var COUNTS = {
    petals: [60, 40],
    hearts: [46, 28],
    snow: [84, 54],
    rain: [90, 54],
    motes: [42, 30],
    cells: [26, 18],
    sparks: [40, 26]
  };

  /* ---------- one canvas per section ---------- */

  canvases.forEach(function (canvas) {
    var theme = canvas.dataset.weather;
    if (!COUNTS[theme]) return;
    var section = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    var W = 0, H = 0, particles = [];
    var raf = 0, running = false, visible = false, last = 0, freeTimer = 0;

    function resize() {
      W = Math.max(1, section.clientWidth);
      H = Math.max(1, section.clientHeight);
      if (!running) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function build() {
      var scale = W < 640 ? .58 : W < 900 ? .8 : 1;
      var n = COUNTS[theme][W < 640 ? 1 : 0];
      particles = [];
      for (var i = 0; i < n; i++) particles.push(makeParticle(theme, W, H, scale));
    }

    function frame(now) {
      if (!running) return;
      if (document.hidden) {
        last = now;
        raf = requestAnimationFrame(frame);
        return;
      }
      var dt = Math.min(.05, (now - last) / 1000) || .016;
      last = now;

      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y += p.vy * dt;
        p.x += (p.vx + Math.sin(now / 1000 * p.freq + p.phase) * p.sway) * dt;
        p.rot += p.spin * dt;

        if (p.vy >= 0 && p.y > H + p.pad) { p.y = -p.pad; p.x = Math.random() * W; }
        if (p.vy < 0 && p.y < -p.pad) { p.y = H + p.pad; p.x = Math.random() * W; }
        if (p.x < -p.pad) p.x = W + p.pad;
        if (p.x > W + p.pad) p.x = -p.pad;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      clearTimeout(freeTimer);
      visible = true;
      if (running) return;
      running = true;
      resize();
      if (!particles.length) build();
      canvas.classList.add('is-on');
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      visible = false;
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      canvas.classList.remove('is-on');
      clearTimeout(freeTimer);
      freeTimer = setTimeout(function () {
        if (running) return;
        canvas.width = 0;
        canvas.height = 0;
        particles = [];
      }, 1200);
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { if (running) resize(); }).observe(section);
    } else {
      window.addEventListener('resize', function () { if (running) resize(); });
    }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) start();
        else if (visible) stop();
      });
    }, { threshold: .02 }).observe(section);
  });
})();

/* ============================================================
   Ambient fireworks, left margin
   Sparse, low-poly bursts in the free space beside the centred
   chapters. One canvas, no DPR scaling, paused when idle.
   ============================================================ */
(function skyworks() {
  var canvas = document.querySelector('.skyworks');
  if (!canvas || window.innerWidth < 1200) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var palette = [
    [246, 237, 225], [246, 178, 74], [182, 90, 124],
    [172, 130, 180], [156, 199, 192], [206, 33, 24]
  ];
  var sparks = [], rockets = [], flashes = [];
  var w = 0, h = 0, raf = 0, timer = 0, last = 0;

  function random(min, max) { return min + Math.random() * (max - min); }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function enabled() {
    return !reduce.matches && !document.hidden && window.innerWidth >= 1200;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    sparks = []; rockets = []; flashes = [];
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  function maxX() {
    var head = document.querySelector('.chapter__head');
    var left = head ? head.getBoundingClientRect().left : w * 0.2;
    return Math.min(Math.max(90, left - 48), w * 0.26);
  }

  function explode(rocket) {
    var scale = Math.min(Math.max(Math.min(w, h) / 820, 0.65), 1.35);
    var count = Math.round(random(52, 82));
    var base = random(1.8, 3.3);
    var kind = Math.random();
    if (kind < 0.18) {
      count = Math.round(random(34, 48));
      base = random(1.6, 2.2);
    } else if (kind < 0.34) {
      count = Math.round(random(50, 70));
      base = random(1.1, 2.1);
    }
    for (var i = 0; i < count; i++) {
      var angle = (kind < 0.18)
        ? (i / count) * Math.PI * 2 + random(-0.03, 0.03)
        : random(0, Math.PI * 2);
      var speed = random(0.55, 1.35) * base;
      sparks.push({
        x: rocket.x, y: rocket.y,
        vx: Math.cos(angle) * speed * scale,
        vy: Math.sin(angle) * speed * scale,
        life: random(50, 110), maxLife: 110,
        color: (Math.random() < 0.25 && rocket.color2) ? rocket.color2 : rocket.color,
        gravity: 0.035 * random(0.8, 1.2),
        size: random(0.5, 1.7) * scale
      });
    }
    if (sparks.length > 220) sparks = sparks.slice(-220);
    flashes.push({ x: rocket.x, y: rocket.y, life: 1, color: rocket.color });
  }

  function launch() {
    if (!enabled()) { schedule(6000); return; }
    if (!w || !h) resize();
    var limit = maxX();
    if (limit < 90) { schedule(6000); return; }
    var color = pick(palette);
    rockets.push({
      x: random(36, limit),
      y: h * 0.94,
      vx: random(-0.2, 0.2),
      vy: -random(4.2, 6.4),
      targetY: random(h * 0.18, h * 0.55),
      color: color,
      color2: Math.random() < 0.5 ? pick(palette) : null
    });
    if (Math.random() < 0.22) {
      rockets.push({
        x: random(36, limit),
        y: h * 0.94,
        vx: random(-0.2, 0.2),
        vy: -random(4.2, 6.4),
        targetY: random(h * 0.18, h * 0.52),
        color: pick(palette),
        color2: null
      });
    }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
    schedule(random(5500, 12000));
  }

  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(launch, delay);
  }

  function frame(now) {
    var dt = Math.min(now - last, 48);
    last = now;
    var step = Math.min(dt / 16.667, 2);

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (var r = 0; r < rockets.length; r++) {
      var rocket = rockets[r];
      rocket.x += rocket.vx * step;
      rocket.y += rocket.vy * step;
      ctx.strokeStyle = rgba([246, 237, 225], 0.34);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rocket.x, rocket.y + 13);
      ctx.lineTo(rocket.x, rocket.y + 2);
      ctx.stroke();
      ctx.fillStyle = rgba([246, 237, 225], 0.9);
      ctx.beginPath();
      ctx.arc(rocket.x, rocket.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    var burst = rockets.filter(function (rocket) { return rocket.y <= rocket.targetY; });
    rockets = rockets.filter(function (rocket) { return rocket.y > rocket.targetY; });
    for (var b = 0; b < burst.length; b++) explode(burst[b]);

    for (var s = 0; s < sparks.length; s++) {
      var spark = sparks[s];
      spark.vx *= Math.pow(0.99, step);
      spark.vy = spark.vy * Math.pow(0.99, step) + spark.gravity * step;
      spark.x += spark.vx * step;
      spark.y += spark.vy * step;
      spark.life -= step;
      var alpha = Math.max(0, spark.life / spark.maxLife);
      ctx.strokeStyle = rgba(spark.color, alpha * 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(spark.x - spark.vx * 2.2, spark.y - spark.vy * 2.2);
      ctx.lineTo(spark.x, spark.y);
      ctx.stroke();
      ctx.fillStyle = rgba(spark.color, alpha * 0.9);
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
    }
    sparks = sparks.filter(function (spark) { return spark.life > 0 && spark.y < h + 30; });

    for (var f = 0; f < flashes.length; f++) {
      var flash = flashes[f];
      flash.life -= 0.06 * step;
      ctx.fillStyle = rgba(flash.color, flash.life * 0.1);
      ctx.beginPath();
      ctx.arc(flash.x, flash.y, 14 + (1 - flash.life) * 46, 0, Math.PI * 2);
      ctx.fill();
    }
    flashes = flashes.filter(function (flash) { return flash.life > 0; });

    ctx.globalCompositeOperation = 'source-over';
    if (rockets.length || sparks.length || flashes.length) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
      ctx.clearRect(0, 0, w, h);
    }
  }

  resize();
  window.addEventListener('resize', function () {
    resize();
    if (!timer) schedule(2500);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      sparks = []; rockets = []; flashes = [];
      ctx.clearRect(0, 0, w, h);
    } else {
      schedule(1800);
    }
  });
  reduce.addEventListener('change', function () {
    if (reduce.matches) {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      sparks = []; rockets = []; flashes = [];
      ctx.clearRect(0, 0, w, h);
    } else {
      schedule(1800);
    }
  });

  schedule(2400);
})();
