// ============ Scroll progress bar ============
const progressBar = document.querySelector('.scroll-progress');
function updateProgress() {
  if (!progressBar) return;
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressBar.style.width = scrolled + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ============ NAV: scroll state + mobile toggle ============
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) nav.classList.add('is-scrolled');
  else nav.classList.remove('is-scrolled');
}, { passive: true });

if (toggle) {
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }));
}

// ============ Scroll reveal ============
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach((el, i) => {
  el.style.setProperty('--i', i % 8);
  io.observe(el);
});

// ============ Hero cursor spotlight ============
const heroEl = document.querySelector('.hero');
if (heroEl) {
  heroEl.addEventListener('pointermove', (e) => {
    const rect = heroEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroEl.style.setProperty('--mx', x + '%');
    heroEl.style.setProperty('--my', y + '%');
  });
}

// ============ Magnetic buttons ============
const magnetTargets = document.querySelectorAll('.btn-primary, .btn-outline, .btn-dark');
magnetTargets.forEach(btn => {
  btn.addEventListener('pointermove', (e) => {
    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${relX * 0.18}px, ${relY * 0.32}px)`;
  });
  btn.addEventListener('pointerleave', () => {
    btn.style.transform = '';
  });
});

// ============ Animated counters (hero stats) ============
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.dataset.count;
      const numMatch = raw.match(/[\d.]+/);
      if (!numMatch) { counterIO.unobserve(el); return; }
      const target = parseFloat(numMatch[0]);
      const suffix = raw.replace(numMatch[0], '');
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = (target * eased);
        const display = Number.isInteger(target) ? Math.round(current) : current.toFixed(1);
        el.textContent = display + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => counterIO.observe(el));
}

// ============ FAQ accordion ============
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item').forEach(other => {
      other.classList.remove('open');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ============ Testimonial slider ============
const track = document.querySelector('.testi-track');
if (track) {
  const prev = document.querySelector('[data-testi-prev]');
  const next = document.querySelector('[data-testi-next]');
  const scrollAmount = () => track.querySelector('.testi-card').offsetWidth + 24;
  next && next.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));
  prev && prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
}

// ============ Project card image sliders ============
document.querySelectorAll('.project-slider').forEach(slider => {
  const slides = Array.from(slider.querySelectorAll('.slider-slides img'));
  const dots = Array.from(slider.querySelectorAll('.slider-dots .dot'));
  const prevBtn = slider.querySelector('[data-slider-prev]');
  const nextBtn = slider.querySelector('[data-slider-next]');
  if (!slides.length) return;
  let current = 0;
  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((img, i) => img.classList.toggle('active', i === current));
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }
  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  goTo(0);
});

// ============ Forms (contact, home, quote — any .ajax-form) ============
document.querySelectorAll('.ajax-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const success = form.querySelector('.form-success');
    if (success) success.classList.add('show');
    form.reset();
    if (success) success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

// ============ Hero video banner (respect reduced-motion + force autoplay) ============
(function () {
  const heroVideo = document.querySelector('.hero-video-bg video');
  if (!heroVideo) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    heroVideo.removeAttribute('autoplay');
    heroVideo.pause();
    return;
  }

  // Belt-and-braces autoplay: some setups (most commonly a page opened
  // straight from disk via file:// rather than a real http(s) site) can be
  // stricter about starting video without a user gesture. This makes sure
  // the banner starts and KEEPS playing no matter what:
  //  1) force muted (required for any autoplay to be allowed at all)
  //  2) try to play immediately, and again as soon as data is ready
  //  3) a watchdog re-checks every second for the first 20s and nudges
  //     play() again if something paused it
  //  4) instantly resumes on the very first interaction anywhere on the
  //     page, as a final guaranteed fallback
  //  5) if anything external ever pauses it after that, resume automatically
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;

  function tryPlay() {
    const p = heroVideo.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  tryPlay();
  heroVideo.addEventListener('loadedmetadata', tryPlay);
  heroVideo.addEventListener('loadeddata', tryPlay);
  heroVideo.addEventListener('canplay', tryPlay);
  heroVideo.addEventListener('canplaythrough', tryPlay);

  // Keep nudging it for the first 20 seconds in case the earliest attempts
  // were blocked before the browser was ready to allow playback.
  let watchdogTicks = 0;
  const watchdog = setInterval(() => {
    watchdogTicks++;
    if (heroVideo.paused) tryPlay();
    if (watchdogTicks >= 20) clearInterval(watchdog);
  }, 1000);

  // If it ever stops on its own (a stray external pause, tab throttling,
  // etc.) start it again automatically — it should never sit still.
  heroVideo.addEventListener('pause', () => {
    if (!heroVideo.ended) tryPlay();
  });

  const resumeEvents = ['click', 'touchstart', 'scroll', 'keydown', 'pointermove'];
  function resumeOnInteraction() {
    tryPlay();
    resumeEvents.forEach(evt => window.removeEventListener(evt, resumeOnInteraction));
  }
  resumeEvents.forEach(evt => window.addEventListener(evt, resumeOnInteraction, { passive: true, once: true }));
})();

// ============ Portfolio category filter ============
const filterBar = document.querySelector('.portfolio-filters');
if (filterBar) {
  const buttons = Array.from(filterBar.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.project-card'));
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });
}

// ============ Set active nav link ============
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
})();
