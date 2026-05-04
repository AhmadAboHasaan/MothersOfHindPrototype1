/* ==========================================================================
   Mothers of Hind — Interactive scripts
   ========================================================================== */

(() => {
  'use strict';

  /* ---------- Sticky header ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 32);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------- Stat counter ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const dur = 1600;
        const start = performance.now();
        const ease = t => 1 - Math.pow(1 - t, 3);
        const tick = now => {
          const p = Math.min(1, (now - start) / dur);
          const v = target * ease(p);
          el.textContent = target % 1 === 0 ? Math.round(v).toLocaleString() : v.toFixed(1);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => co.observe(c));
  }

  /* ---------- Donation amount selector ---------- */
  const donateAmounts = document.querySelectorAll('.donate-amount');
  const customAmountInput = document.querySelector('.custom-amount input');
  donateAmounts.forEach(btn => {
    btn.addEventListener('click', () => {
      donateAmounts.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      if (customAmountInput) customAmountInput.value = '';
    });
  });
  if (customAmountInput) {
    customAmountInput.addEventListener('focus', () => {
      donateAmounts.forEach(b => b.classList.remove('selected'));
    });
  }

  /* ---------- Donate tabs ---------- */
  const donateTabs = document.querySelectorAll('.donate-tab');
  donateTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      donateTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const kind = tab.dataset.kind;
      document.querySelectorAll('.donate-tab-content').forEach(c => {
        c.style.display = c.dataset.kind === kind ? '' : 'none';
      });
    });
  });

  /* ---------- Team "Read more" bio toggle ---------- */
  document.querySelectorAll('.team-read-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const bio = btn.parentElement.querySelector('.team-bio');
      if (!bio) return;
      bio.classList.toggle('expanded');
      btn.textContent = bio.classList.contains('expanded') ? 'Show less ↑' : 'Read more →';
    });
  });

  /* ---------- Smooth focus for hash anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        const target = document.querySelector(id);
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  /* ---------- Contact form (demo handler) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        contactForm.reset();
        btn.textContent = 'Message sent ✓';
        setTimeout(() => {
          btn.textContent = 'Send Message';
          btn.disabled = false;
        }, 2600);
      }, 900);
    });
  }

  /* ---------- Newsletter form ---------- */
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      const input = newsletterForm.querySelector('input');
      btn.textContent = '✓';
      input.value = '';
      input.placeholder = 'Thanks — welcome aboard.';
      setTimeout(() => { btn.textContent = 'Subscribe'; input.placeholder = 'your@email.com'; }, 3200);
    });
  }

  /* ---------- Set active nav based on current path ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .mobile-menu-list a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });

})();

/* ---------- Instagram feed via local API ---------- */
(() => {
  const section = document.querySelector('#instagram-feed-live');
  if (!section) return;
  const grid = section.querySelector('.ig-grid');
  if (!grid) return;

  fetch('/api/instagram')
    .then(r => r.json())
    .then(data => {
      const posts = Array.isArray(data.posts) ? data.posts.slice(0, 9) : [];
      if (!posts.length) return;
      grid.innerHTML = posts.map((post, i) => `
        <a href="${post.permalink}" target="_blank" rel="noopener" class="ig-post reveal reveal-delay-${i%4}">
          <div class="ig-post-img" style="background-image:url('${post.media_url}')"></div>
          <div class="ig-post-overlay"><span class="ig-stat">Instagram</span></div>
        </a>`).join('');
    })
    .catch(() => {});
})();
