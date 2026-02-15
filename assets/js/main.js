const d = document;
const root = d.documentElement;
const themeKey = 'lmff-theme';

function getTheme() {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function setTheme(theme) {
  root.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark');
}

const savedTheme = localStorage.getItem(themeKey);
if (savedTheme === 'light' || savedTheme === 'dark') {
  setTheme(savedTheme);
}

function initThemeToggle() {
  const nav = d.querySelector('.nav');
  if (!nav || nav.querySelector('.theme-toggle')) return;

  const themeBtn = d.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'theme-toggle';

  const updateToggle = () => {
    const isLight = getTheme() === 'light';
    themeBtn.innerHTML = `<span class="theme-icon" aria-hidden="true">${isLight ? '🌙' : '☀️'}</span>`;
    themeBtn.setAttribute('aria-label', isLight ? 'Activeaza tema dark' : 'Activeaza tema alba');
    themeBtn.title = isLight ? 'Activeaza tema dark' : 'Activeaza tema alba';
  };

  themeBtn.addEventListener('click', () => {
    const nextTheme = getTheme() === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(themeKey, nextTheme);
    updateToggle();
  });

  const desktopCta = nav.querySelector('.desktop-only');
  if (desktopCta) {
    nav.insertBefore(themeBtn, desktopCta);
  } else {
    nav.appendChild(themeBtn);
  }
  updateToggle();
}

initThemeToggle();

const menuToggle = d.querySelector('[data-menu-toggle]');
const navLinks = d.querySelector('[data-nav-links]');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealItems = d.querySelectorAll('.reveal');
if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => observer.observe(item));
}

const faqButtons = d.querySelectorAll('.faq-q');
faqButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item?.querySelector('.faq-a');
    if (!answer) return;
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    answer.style.maxHeight = expanded ? '0px' : `${answer.scrollHeight + 10}px`;
  });
});

const menuCategory = d.querySelector('[data-menu-category]');
const menuSearch = d.querySelector('[data-menu-search]');
const menuItems = d.querySelectorAll('[data-menu-item]');
const filterChips = d.querySelectorAll('[data-filter-chip]');

function filterMenu() {
  if (!menuItems.length) return;
  const category = menuCategory ? menuCategory.value : 'toate';
  const query = menuSearch ? menuSearch.value.toLowerCase().trim() : '';

  menuItems.forEach((item) => {
    const itemCategory = item.getAttribute('data-category') || '';
    const text = item.textContent.toLowerCase();
    const byCategory = category === 'toate' || category === itemCategory;
    const byQuery = !query || text.includes(query);
    item.style.display = byCategory && byQuery ? 'block' : 'none';
  });
}

menuCategory?.addEventListener('change', filterMenu);
menuSearch?.addEventListener('input', filterMenu);
filterChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const value = chip.getAttribute('data-filter-chip') || 'toate';
    if (menuCategory) menuCategory.value = value;
    filterChips.forEach((other) => other.classList.toggle('active', other === chip));
    filterMenu();
  });
});

menuCategory?.addEventListener('change', () => {
  const value = menuCategory.value;
  filterChips.forEach((chip) => chip.classList.toggle('active', chip.getAttribute('data-filter-chip') === value));
});

filterMenu();

const galleryItems = d.querySelectorAll('[data-lightbox]');
const lightbox = d.querySelector('[data-lightbox-modal]');
if (galleryItems.length && lightbox) {
  const lbImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('button');

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-lightbox');
      const alt = item.getAttribute('data-alt') || 'Imagine preparat La Marian FastFood';
      if (!src || !lbImg) return;
      lbImg.src = src;
      lbImg.alt = alt;
      lightbox.classList.add('open');
      d.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    d.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

const cookieBanner = d.querySelector('[data-cookie-banner]');
if (cookieBanner) {
  const accepted = localStorage.getItem('lmff-cookies-consent');
  if (!accepted) {
    cookieBanner.style.display = 'block';
  }

  const acceptBtn = cookieBanner.querySelector('[data-cookie-accept]');
  const rejectBtn = cookieBanner.querySelector('[data-cookie-reject]');

  const closeBanner = (value) => {
    localStorage.setItem('lmff-cookies-consent', value);
    cookieBanner.style.display = 'none';
  };

  acceptBtn?.addEventListener('click', () => closeBanner('accepted'));
  rejectBtn?.addEventListener('click', () => closeBanner('essential-only'));
}

const parallaxEls = d.querySelectorAll('.parallax');
if (parallaxEls.length) {
  let ticking = false;
  const runParallax = () => {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = Number(el.getAttribute('data-speed') || 0.08);
      el.style.setProperty('--move', `${Math.round(y * speed)}px`);
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(runParallax);
      ticking = true;
    }
  });
}

const productLegalNoteText = 'Imaginile produselor au rol de prezentare. Aspectul final poate varia usor in functie de preparare.';

function isProductImage(img) {
  const src = img.getAttribute('src') || '';
  if (!src.includes('assets/img/')) return false;
  if (src.includes('logo-fastfood-crop') || src.includes('exterior-fastfood')) return false;
  return /(burger|shaorma|doner|crispy|strips|ciolan|cartofi|sosuri|hero-burger)/i.test(src);
}

function ensureProductLegalNotes() {
  const images = d.querySelectorAll('main img[src]');
  images.forEach((img) => {
    if (!isProductImage(img)) return;

    const figure = img.closest('figure');
    if (figure) {
      const existingCaption = figure.querySelector('.image-legal-note');
      if (existingCaption) {
        existingCaption.textContent = productLegalNoteText;
        return;
      }
    }

    const next = img.nextElementSibling;
    if (next && next.classList.contains('image-legal-note')) {
      next.textContent = productLegalNoteText;
      return;
    }

    const note = d.createElement('p');
    note.className = 'image-legal-note';
    note.textContent = productLegalNoteText;
    img.insertAdjacentElement('afterend', note);
  });
}

ensureProductLegalNotes();
