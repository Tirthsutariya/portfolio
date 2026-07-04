/* ============================================================
   TIRTH SUTARIYA — PORTFOLIO JS v4
   Scroll-reactive background · B&W · Witty tagline
   ============================================================ */

/* ══════════════════════════════
   SCROLL-REACTIVE BACKGROUND CANVAS
   A fixed dot-grid that morphs/breathes as you scroll.
   Each dot oscillates using sin/cos waves; the phase
   offset is driven by window.scrollY so the animation
   visibly reacts to every scroll event.
══════════════════════════════ */
(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  let targetScrollY = 0, lastScroll = 0, scrollVel = 0;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 150;   // max distance to draw a connecting line

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    build();
  }

  function build() {
    const n = Math.min(130, Math.round(W * H / 13000));
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r:  Math.random() * 1.7 + 1.1,
      });
    }
  }

  function draw() {
    /* scroll velocity → gives particles a push while scrolling */
    scrollVel += ((targetScrollY - lastScroll) - scrollVel) * 0.1;
    lastScroll = targetScrollY;

    const isLight = document.body.classList.contains('light');
    const rgb   = isLight ? '0,0,0' : '255,255,255';
    const dotA  = isLight ? 0.5  : 0.62;
    const lineA = isLight ? 0.14 : 0.20;

    ctx.clearRect(0, 0, W, H);

    /* move */
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy + scrollVel * 0.02;   // scroll drags the field

      if (p.x < -30) p.x = W + 30;
      if (p.x > W + 30) p.x = -30;
      if (p.y < -30) p.y = H + 30;
      if (p.y > H + 30) p.y = -30;

      /* repel from cursor */
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const md = Math.hypot(dx, dy);
      if (md < 130 && md > 0) {
        const f = (130 - md) / 130 * 1.8;
        p.x += (dx / md) * f;
        p.y += (dy / md) * f;
      }
    }

    /* links between particles */
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / LINK) * lineA})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    /* links to the cursor (brighter) */
    if (mouse.x > -9000) {
      for (const p of particles) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${rgb},${(1 - d / LINK) * lineA * 1.8})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }

    /* particles */
    ctx.fillStyle = `rgba(${rgb},${dotA})`;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    /* very light vignette so text stays readable at centre */
    const bg = isLight ? '242,242,242' : '8,8,8';
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.38, W / 2, H / 2, H * 0.98);
    vg.addColorStop(0, `rgba(${bg},0)`);
    vg.addColorStop(1, `rgba(${bg},0.4)`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    requestAnimationFrame(draw);
  }

  window.addEventListener('scroll', () => { targetScrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });

  resize();
  requestAnimationFrame(draw);
})();


/* ══════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════ */
(function () {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const total = document.body.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / total * 100) + '%';
  }, { passive: true });
})();


/* ══════════════════════════════
   TYPING ANIMATION
══════════════════════════════ */
(function () {
  const el = document.getElementById('typeEl');
  if (!el) return;
  const words = [
    'Spring Boot',
    'Kafka',
    'Elasticsearch',
    'PostgreSQL',
    'Python & LangChain',
    'REST APIs',
    'Redis',
    'Spring Security',
  ];
  let wi = 0, ci = 0, del = false;

  function tick() {
    const w = words[wi];
    el.textContent = del ? w.slice(0, ci - 1) : w.slice(0, ci + 1);
    del ? ci-- : ci++;
    if (!del && ci === w.length) { setTimeout(() => { del = true; tick(); }, 2400); return; }
    if (del && ci === 0)         { del = false; wi = (wi + 1) % words.length; }
    setTimeout(tick, del ? 48 : 100);
  }
  setTimeout(tick, 800);
})();


/* ══════════════════════════════
   THEME TOGGLE WITH FUNNY MESSAGES
══════════════════════════════ */
(function () {
  const btn   = document.getElementById('themeToggle');
  const toast = document.getElementById('themeToast');
  if (!btn || !toast) return;

  const darkMsgs = [
    '🖤 Dark mode restored. My terminal approves.',
    '😌 Back to dark. As God, backend devs, and vim users intended.',
    '🌑 Dark mode ON. My eyes just sent a thank-you email.',
    '🧛 Welcome back to the dark side. We have cookies. And no eye strain.',
    '⚡ Dark mode. The natural habitat of every backend developer.',
  ];
  const lightMsgs = [
    '☀️ Light mode?? Are you trying to hurt me?',
    '😬 Light mode ON. I take no responsibility for your eyes.',
    '🥲 Fine, light mode. But I\'m judging you silently.',
    '😅 Light mode activated. My designer friends would be proud. I\'m not.',
    '☀️ Oh brave soul. Light mode it is. May your retinas be strong.',
  ];

  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function pick(arr) {
    return arr[Math.floor(arr.length * (Date.now() % 1000) / 1000)];
  }

  /* restore saved preference */
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light');
    btn.textContent = '☀️';
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    btn.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    showToast(isLight ? pick(lightMsgs) : pick(darkMsgs));
  });
})();


/* ══════════════════════════════
   NAVBAR — scroll + mobile + active link
══════════════════════════════ */
(function () {
  const nav   = document.getElementById('nav');
  const ham   = document.getElementById('ham');
  const mMenu = document.getElementById('mobMenu');
  const navAs = document.querySelectorAll('.nav-links a:not(.nav-btn)');
  const secs  = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);

    let cur = '';
    secs.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) cur = s.id;
    });
    navAs.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
    });
  }, { passive: true });

  function toggleMenu(open) {
    ham.classList.toggle('open', open);
    mMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (ham) {
    ham.addEventListener('click', () => toggleMenu(!ham.classList.contains('open')));
  }
  if (mMenu) {
    mMenu.querySelectorAll('.mm-a').forEach(a => {
      a.addEventListener('click', () => toggleMenu(false));
    });
  }
})();


/* ══════════════════════════════
   PARALLAX — hero rings
══════════════════════════════ */
(function () {
  const items = document.querySelectorAll('[data-speed]');
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    items.forEach(el => {
      const speed = parseFloat(el.dataset.speed);
      el.style.transform = `translateY(${sy * speed}px)`;
    });
  }, { passive: true });
})();


/* ══════════════════════════════
   SCROLL TRANSLATION (IntersectionObserver)
══════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.tx-up, .tx-left, .tx-right');

  const groups = new Map();
  els.forEach(el => {
    const p = el.parentElement;
    if (!groups.has(p)) groups.set(p, []);
    groups.get(p).push(el);
  });
  groups.forEach(group => {
    if (group.length > 1) {
      group.forEach((el, i) => { el.style.transitionDelay = (i * 0.1) + 's'; });
    }
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();


/* ══════════════════════════════
   SKILL BAR FILL
══════════════════════════════ */
(function () {
  const bars = document.querySelectorAll('.br-f[data-w]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      setTimeout(() => { e.target.style.width = e.target.dataset.w + '%'; }, 250);
      io.unobserve(e.target);
    });
  }, { threshold: 0.4 });
  bars.forEach(b => io.observe(b));
})();


/* ══════════════════════════════
   COUNTER ANIMATION
══════════════════════════════ */
(function () {
  const counters = document.querySelectorAll('.cnt[data-to]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const target = +e.target.dataset.to;
      const fps = 60, dur = 1600;
      const step = target / (dur / (1000 / fps));
      let cur = 0;
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { e.target.textContent = target; clearInterval(t); }
        else e.target.textContent = Math.floor(cur);
      }, 1000 / fps);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
})();


/* ══════════════════════════════
   3D TILT ON CARDS
══════════════════════════════ */
(function () {
  const STR = 6;
  document.querySelectorAll('.proj-card, .cp-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rX = ((e.clientY - r.top)  / r.height - .5) * -STR * 2;
      const rY = ((e.clientX - r.left) / r.width  - .5) *  STR * 2;
      card.style.transition = 'transform 0s';
      card.style.transform  = `perspective(900px) rotateX(${rX}deg) rotateY(${rY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .5s cubic-bezier(.17,.84,.44,1)';
      card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
})();


/* ══════════════════════════════
   SMOOTH SCROLL for anchor links
══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


/* ══════════════════════════════
   PAGE FADE-IN ON LOAD
══════════════════════════════ */
(function () {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  window.addEventListener('load', () => {
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  });
})();
