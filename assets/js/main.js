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
  return;
}

initThemeToggle();

const menuToggle = d.querySelector('[data-menu-toggle]');
const navLinks = d.querySelector('[data-nav-links]');
if (menuToggle && navLinks) {
  const closeMobileMenu = () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Meniu';
  };

  const openMobileMenu = () => {
    navLinks.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.textContent = 'Închide';
  };

  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMobileMenu();
      return;
    }
    openMobileMenu();
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  d.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMobileMenu();
  });

  d.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMobileMenu();
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

const offerStorageKey = 'lmff-product-offers-v1';
const offersApiUrl = '/.netlify/functions/offers';
const isAdminPage = Boolean(d.querySelector('[data-admin-gate]'));
let offersCache = {};
let offersCacheReady = false;
let adminAuthCache = null;
let lastOfferWriteError = '';
const productCards = Array.from(d.querySelectorAll('[data-product-id]'));
const productBasePrices = {
  'burger-black-angus': 40,
  'double-smash-burger': 35,
  'meniu-crispy-xl': 35,
  'portie-cartofi-family': 25,
  'shaorma-clasica-mare': 30,
  'shaorma-crispy': 30,
  'pachet-sosuri-signature': 25,
  'meniu-strips-hot': 35,
  'doner-box-clasic': 25,
  'ciolan-afumat-cuptor': 60,
  'meniu-4-mici-cartofi-paine-mustar': 35,
  'clatite-tiramisu': 20,
  'cafea': 7
};
const productCatalog = [
  { id: 'burger-black-angus', name: 'Burger de vită cu cartofi', image: 'assets/img/burger-black-angus.png', description: 'Carne suculentă, cheddar maturat și sos burger signature.' },
  { id: 'double-smash-burger', name: 'Burger crispy cu cartofi', image: 'assets/img/double-smash-burger.png', description: 'Două straturi de carne, ceapă caramelizată și sos burger house.' },
  { id: 'shaorma-clasica-mare', name: 'Shaorma Mare', image: 'assets/img/shaorma-clasica-mare.png', description: 'Pui fraged, cartofi aurii, salată fresh și sos de usturoi.' },
  { id: 'shaorma-crispy', name: 'Shaorma Crispy Mare', image: 'assets/img/shaorma-crispy.png', description: 'Bucăți crispy, salată mix, murături și sos picant echilibrat.' },
  { id: 'meniu-crispy-xl', name: 'Crispy cu cartofi', image: 'assets/img/meniu-crispy-xl.png', description: 'Crispy crocant, cartofi aurii, salată coleslaw și sos la alegere.' },
  { id: 'meniu-strips-hot', name: 'Aripioare cu cartofi', image: 'assets/img/meniu-strips-hot.png', description: 'Strips condimentat, cartofi prăjiți și dip cremos de usturoi.' },
  { id: 'doner-box-clasic', name: 'Doner Box', image: 'assets/img/doner-box-clasic.png', description: 'Porție echilibrată cu carne, cartofi și sosuri bine dozate.' },
  { id: 'ciolan-afumat-cuptor', name: 'Ciolane cu cartofi, castraveți murați și sos de usturoi', image: 'assets/img/ciolan-cartofi.png', description: 'Ciolan rumenit lent, cartofi wedges și sos rustic de casă.' },
  { id: 'portie-cartofi-family', name: 'Shaorma Mică', image: 'assets/img/shaorma-close.png', description: 'Porție mică de shaorma, potrivită pentru o masă rapidă.' },
  { id: 'pachet-sosuri-signature', name: 'Shaorma Crispy Mică', image: 'assets/img/shaorma-crispy.png', description: 'Porție mică cu crispy de pui, salată și sos de usturoi.' },
  { id: 'meniu-4-mici-cartofi-paine-mustar', name: 'Meniu 4 mici cu cartofi, pâine și muștar', image: 'assets/img/meniu-4-mici-cartofi-paine-mustar.png', description: '4 mici la grătar, cartofi prăjiți, pâine proaspătă și muștar.' },
  { id: 'clatite-tiramisu', name: 'Clătite Tiramisu', image: 'assets/img/clatite-tiramisu.png', description: 'Clătite fine cu cremă tip tiramisu și topping de cacao.' },
  { id: 'cafea', name: 'Cafea', image: 'assets/img/cafea.png', description: 'Cafea simplă, servită fierbinte.' }
];

function getProductBasePrice(productId) {
  if (!productId) return null;
  return Number.isFinite(productBasePrices[productId]) ? productBasePrices[productId] : null;
}

function renderProductPrices() {
  if (!productCards.length) return;

  productCards.forEach((card) => {
    const productId = card.getAttribute('data-product-id');
    const price = getProductBasePrice(productId);
    let tag = card.querySelector('[data-price-tag]') || card.querySelector('.price-tag');

    if (!price) {
      if (tag && tag.hasAttribute('data-price-tag')) tag.remove();
      return;
    }

    if (!tag) {
      tag = d.createElement('span');
      tag.className = 'price-tag';
      tag.setAttribute('data-price-tag', '');
      const title = card.querySelector('h3');
      if (title) {
        title.insertAdjacentElement('afterend', tag);
      } else {
        const callBtn = card.querySelector('.menu-call-btn');
        if (callBtn) callBtn.insertAdjacentElement('beforebegin', tag);
        else card.appendChild(tag);
      }
    } else {
      tag.setAttribute('data-price-tag', '');
    }

    tag.textContent = `Preț: ${price} lei`;
  });
}

function sanitizeOffersMap(input) {
  if (!input || typeof input !== 'object') return {};
  const out = {};
  Object.entries(input).forEach(([productId, offer]) => {
    if (!getProductData(productId)) return;
    const normalized = normalizeOffer(offer);
    if (normalized) out[productId] = normalized;
  });
  return out;
}

function readOffersFromLocalStorage() {
  try {
    const raw = localStorage.getItem(offerStorageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return sanitizeOffersMap(parsed);
  } catch (err) {
    return {};
  }
}

function saveOffersToLocalStorage(offers) {
  try {
    localStorage.setItem(offerStorageKey, JSON.stringify(offers));
    return true;
  } catch (err) {
    return false;
  }
}

function getAdminAuth() {
  if (adminAuthCache && adminAuthCache.user && adminAuthCache.pass) return adminAuthCache;
  const gate = d.querySelector('[data-admin-gate]');
  if (!gate) return null;
  const user = (gate.getAttribute('data-admin-user') || '').trim();
  const pass = gate.getAttribute('data-admin-pass') || '';
  if (!user || !pass) return null;
  adminAuthCache = { user, pass };
  return adminAuthCache;
}

function readOffers() {
  if (offersCacheReady) return { ...offersCache };
  offersCache = readOffersFromLocalStorage();
  offersCacheReady = true;
  return { ...offersCache };
}

async function refreshOffersFromServer() {
  try {
    const response = await fetch(offersApiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return false;
    const parsed = await response.json();
    const remoteOffers = sanitizeOffersMap(parsed);
    offersCache = remoteOffers;
    offersCacheReady = true;
    saveOffersToLocalStorage(remoteOffers);
    return true;
  } catch (err) {
    return false;
  }
}

async function writeOffers(offers) {
  const normalized = sanitizeOffersMap(offers);
  const auth = getAdminAuth();
  lastOfferWriteError = '';
  if (!auth) {
    lastOfferWriteError = 'Lipsesc credentialele admin pentru request-ul server.';
    if (isAdminPage) return false;
    offersCache = normalized;
    offersCacheReady = true;
    return saveOffersToLocalStorage(normalized);
  }

  try {
    const response = await fetch(offersApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-User': auth.user,
        'X-Admin-Pass': auth.pass
      },
      body: JSON.stringify(normalized)
    });
    if (!response.ok) {
      let detail = '';
      try {
        detail = await response.text();
      } catch (err) {
        detail = '';
      }
      lastOfferWriteError = `Server ${response.status}${detail ? `: ${detail}` : ''}`;
      if (isAdminPage) return false;
      offersCache = normalized;
      offersCacheReady = true;
      return saveOffersToLocalStorage(normalized);
    }
    offersCache = normalized;
    offersCacheReady = true;
    saveOffersToLocalStorage(normalized);
    return true;
  } catch (err) {
    lastOfferWriteError = 'Nu s-a putut contacta functia server pentru oferte.';
    if (isAdminPage) return false;
    offersCache = normalized;
    offersCacheReady = true;
    return saveOffersToLocalStorage(normalized);
  }
}

function getOfferWriteError() {
  return lastOfferWriteError ? ` (${lastOfferWriteError})` : '';
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function normalizeOffer(offer) {
  if (!offer || typeof offer !== 'object') return null;
  const discount = Number(offer.discount);
  const startDate = parseDate(offer.start);
  const endDate = parseDate(offer.end);
  if (!Number.isFinite(discount) || discount < 1 || discount > 95) return null;
  if (!startDate || !endDate || endDate <= startDate) return null;
  return {
    discount: Math.round(discount),
    start: offer.start,
    end: offer.end
  };
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '-';
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${days}z ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getProductName(productId) {
  const found = productCatalog.find((item) => item.id === productId);
  return found ? found.name : productId;
}

function getProductData(productId) {
  const found = productCatalog.find((item) => item.id === productId);
  return found || null;
}

function formatPrice(value) {
  if (!Number.isFinite(value)) return '-';
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? `${rounded} lei`
    : `${rounded.toFixed(2).replace('.', ',')} lei`;
}

function getOfferPriceData(productId, discount) {
  const basePrice = getProductBasePrice(productId);
  if (!Number.isFinite(basePrice) || !Number.isFinite(discount)) {
    return { basePrice: null, finalPrice: null };
  }
  const finalPrice = Math.max(0, basePrice * (1 - discount / 100));
  return { basePrice, finalPrice };
}

function getOrCreateOfferUI(card) {
  let box = card.querySelector('[data-offer-box]');
  if (box) return box;

  box = d.createElement('div');
  box.className = 'product-offer-box';
  box.setAttribute('data-offer-box', '');
  box.innerHTML = `
    <div class="product-offer-top">
      <span class="product-offer-badge" data-offer-badge></span>
      <span class="product-offer-state" data-offer-state></span>
    </div>
    <p class="product-offer-title" data-offer-title></p>
    <p class="product-offer-period" data-offer-period></p>
    <p class="product-offer-countdown">
      <span class="offer-clock" aria-hidden="true"></span>
      <span class="offer-count-label" data-offer-count-label></span>
      <strong class="offer-count-value" data-offer-countdown></strong>
    </p>
  `;

  const callBtn = card.querySelector('.menu-call-btn');
  if (callBtn) {
    callBtn.insertAdjacentElement('beforebegin', box);
  } else {
    card.appendChild(box);
  }
  return box;
}

function clearOfferUI(card) {
  const box = card.querySelector('[data-offer-box]');
  if (box) box.remove();
  card.classList.remove('has-offer', 'offer-active', 'offer-upcoming');
  card.removeAttribute('data-offer-state');
}

function renderProductOffers() {
  if (!productCards.length) return;
  const offers = readOffers();
  const now = Date.now();

  productCards.forEach((card) => {
    const productId = card.getAttribute('data-product-id');
    if (!productId) return;
    card.classList.remove('has-offer', 'offer-active', 'offer-upcoming');
    card.removeAttribute('data-offer-state');

    const offer = normalizeOffer(offers[productId]);
    if (!offer) {
      clearOfferUI(card);
      return;
    }

    const start = parseDate(offer.start);
    const end = parseDate(offer.end);
    if (!start || !end) {
      clearOfferUI(card);
      return;
    }

    const startTime = start.getTime();
    const endTime = end.getTime();
    const isUpcoming = now < startTime;
    const isActive = now >= startTime && now < endTime;

    if (!isUpcoming && !isActive) {
      clearOfferUI(card);
      return;
    }

    card.classList.add('has-offer');
    const box = getOrCreateOfferUI(card);
    const badge = box.querySelector('[data-offer-badge]');
    const state = box.querySelector('[data-offer-state]');
    const title = box.querySelector('[data-offer-title]');
    const period = box.querySelector('[data-offer-period]');
    const countdownLabel = box.querySelector('[data-offer-count-label]');
    const countdown = box.querySelector('[data-offer-countdown]');

    if (badge) badge.textContent = `-${offer.discount}%`;
    if (state) state.textContent = isActive ? 'Activă acum' : 'Se activează curând';
    if (title) {
      const prices = getOfferPriceData(productId, offer.discount);
      const priceText =
        Number.isFinite(prices.basePrice) && Number.isFinite(prices.finalPrice)
          ? ` (${formatPrice(prices.basePrice)} -> ${formatPrice(prices.finalPrice)})`
          : '';
      title.textContent = isActive
        ? `Comandă ${getProductName(productId)} acum și profită de reducerea activă${priceText}.`
        : `Planifică pentru ${getProductName(productId)} și fii primul care prinde promoția${priceText}.`;
    }
    if (period) period.textContent = `Perioada: ${formatDate(offer.start)} - ${formatDate(offer.end)}`;
    if (countdownLabel) countdownLabel.textContent = isActive ? 'Expiră în:' : 'Pornește în:';
    if (countdown) {
      countdown.textContent = isActive
        ? formatCountdown(endTime - now)
        : formatCountdown(startTime - now);
    }
    card.classList.add(isActive ? 'offer-active' : 'offer-upcoming');
    card.setAttribute('data-offer-state', isActive ? 'active' : 'upcoming');
  });
}

function renderOffersZone() {
  const offersZone = d.querySelector('[data-offers-zone]');
  if (!offersZone) return;

  const offers = readOffers();
  const now = Date.now();
  const offerItems = Object.entries(offers)
    .map(([productId, raw]) => {
      const offer = normalizeOffer(raw);
      if (!offer) return null;
      const product = getProductData(productId);
      if (!product) return null;
      const start = parseDate(offer.start);
      const end = parseDate(offer.end);
      if (!start || !end) return null;
      const startTime = start.getTime();
      const endTime = end.getTime();
      const isUpcoming = now < startTime;
      const isActive = now >= startTime && now < endTime;
      if (!isUpcoming && !isActive) return null;
      return {
        product,
        offer,
        isUpcoming,
        isActive,
        startTime,
        endTime
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startTime - b.startTime);

  if (!offerItems.length) {
    offersZone.innerHTML = `
      <article class="card offer-empty-card offer-empty-premium">
        <p class="offer-empty-kicker">Status campanii</p>
        <h3>Următoarea reducere este aproape de lansare</h3>
        <p>Pregătim următorul val de promoții. Imediat ce o campanie devine activă sau programată, o vezi aici fără să cauți în tot meniul.</p>
        <div class="offer-empty-points">
          <span>Countdown live</span>
          <span>Interval clar de valabilitate</span>
          <span>Condiții transparente de promoție</span>
        </div>
        <a class="btn-outline" href="meniu.html">Vezi produsele din meniu</a>
      </article>
    `;
    return;
  }

  offersZone.innerHTML = `
    <div class="grid-3 offer-zone-grid">
      ${offerItems
        .map((item) => {
          const remaining = item.isActive ? item.endTime - now : item.startTime - now;
          const stateLabel = item.isActive ? 'Activă acum' : 'Programată';
          const countdownLabel = item.isActive ? 'Expiră în' : 'Pornește în';
          const prices = getOfferPriceData(item.product.id, item.offer.discount);
          const priceNarrative =
            Number.isFinite(prices.basePrice) && Number.isFinite(prices.finalPrice)
              ? `Preț standard ${formatPrice(prices.basePrice)} -> preț ofertă ${formatPrice(prices.finalPrice)}.`
              : '';
          const narrative = item.isActive
            ? `Ai ${item.offer.discount}% reducere chiar acum, cu comandă simplă și ridicare rapidă din locație. ${priceNarrative}`
            : `Oferta este programată și îți aduce ${item.offer.discount}% reducere imediat ce începe intervalul. ${priceNarrative}`;
          const cardStateClass = item.isActive ? 'is-active' : 'is-upcoming';
          return `
            <article class="card offer-zone-card ${cardStateClass}">
              <div class="offer-zone-media">
                <img src="${item.product.image}" loading="lazy" width="500" height="380" alt="${item.product.name}">
                <div class="offer-zone-media-overlay">
                  <span class="offer-zone-state">${stateLabel}</span>
                  <span class="product-offer-badge">-${item.offer.discount}%</span>
                </div>
              </div>
              <div class="offer-zone-body">
                <div class="offer-zone-headline">
                  <p class="offer-zone-kicker">Ofertă limitată în timp</p>
                  <span class="offer-zone-hint">${item.isActive ? 'Prinde reducerea' : 'Pregătește-te din timp'}</span>
                </div>
                <h3>${item.product.name}</h3>
                <p class="offer-zone-copy">${item.product.description}</p>
                <p class="offer-zone-note">${narrative}</p>
                <p class="offer-zone-stock">
                  <span class="offer-zone-stock-dot" aria-hidden="true"></span>
                  ${item.isActive ? 'Valabilă în limita stocului disponibil.' : 'Stoc promoțional limitat pentru intervalul programat.'}
                </p>
                <p class="offer-zone-period">Perioada: ${formatDate(item.offer.start)} - ${formatDate(item.offer.end)}</p>
                <p class="offer-zone-countdown">
                  <span class="offer-clock" aria-hidden="true"></span>
                  <span class="offer-zone-countdown-label">${countdownLabel}:</span>
                  <span
                    data-offer-zone-countdown
                    data-offer-zone-start="${item.startTime}"
                    data-offer-zone-end="${item.endTime}"
                    data-offer-zone-active="${item.isActive ? '1' : '0'}"
                    class="offer-zone-countdown-value"
                  >${formatCountdown(remaining)}</span>
                </p>
                <a class="btn menu-call-btn" href="tel:+40755516039">${item.isActive ? 'Comandă cu reducere acum' : 'Rezervă telefonic oferta'}</a>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;
}

function updateOffersZoneCountdowns() {
  const countdownNodes = d.querySelectorAll('[data-offer-zone-countdown]');
  if (!countdownNodes.length) return;
  const now = Date.now();

  countdownNodes.forEach((node) => {
    const startTime = Number(node.getAttribute('data-offer-zone-start'));
    const endTime = Number(node.getAttribute('data-offer-zone-end'));
    const labelNode = node.parentElement?.querySelector('.offer-zone-countdown-label');
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return;

    const isActive = now >= startTime && now < endTime;
    const isUpcoming = now < startTime;
    if (labelNode) {
      labelNode.textContent = isActive ? 'Expiră în:' : isUpcoming ? 'Pornește în:' : 'Expirată:';
    }
    if (!isActive && !isUpcoming) {
      node.textContent = '00z 00:00:00';
      return;
    }
    const remaining = isActive ? endTime - now : startTime - now;
    node.textContent = formatCountdown(remaining);
  });
}

function renderOfferList(container) {
  const offers = readOffers();
  const validOffers = Object.entries(offers)
    .map(([productId, offer]) => ({
      productId,
      offer: normalizeOffer(offer),
      product: getProductData(productId)
    }))
    .filter((item) => item.offer && item.product);

  if (!validOffers.length) {
    container.innerHTML = '<p>Nu există oferte salvate.</p>';
    return;
  }

  container.innerHTML = validOffers
    .map((item) => {
      const { productId, offer } = item;
      const prices = getOfferPriceData(productId, offer.discount);
      const pricingMeta =
        Number.isFinite(prices.basePrice) && Number.isFinite(prices.finalPrice)
          ? `Preț standard: ${formatPrice(prices.basePrice)} • Preț ofertă: ${formatPrice(prices.finalPrice)}`
          : 'Preț standard indisponibil pentru acest produs.';
      return `
        <article class="offer-list-item" data-offer-item="${productId}">
          <h4>${getProductName(productId)}</h4>
          <div class="offer-list-item-grid">
            <label>
              Reducere (%)
              <input class="search" type="number" min="1" max="95" step="1" data-offer-item-discount value="${offer.discount}">
            </label>
            <label>
              Data + ora start
              <input class="search" type="datetime-local" data-offer-item-start value="${offer.start}">
            </label>
            <label>
              Data + ora final
              <input class="search" type="datetime-local" data-offer-item-end value="${offer.end}">
            </label>
          </div>
          <p class="offer-list-item-meta">${pricingMeta}</p>
          <p class="offer-list-item-meta">Activ: ${formatDate(offer.start)} - ${formatDate(offer.end)}</p>
          <div class="offer-list-item-actions">
            <button class="btn" type="button" data-offer-item-save>Salvează modificări</button>
            <button class="btn-outline" type="button" data-offer-item-delete>Șterge oferta</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function initOfferAdmin() {
  const productSelect = d.querySelector('[data-offer-product]');
  const discountInput = d.querySelector('[data-offer-discount]');
  const startInput = d.querySelector('[data-offer-start]');
  const endInput = d.querySelector('[data-offer-end]');
  const saveBtn = d.querySelector('[data-offer-save]');
  const deleteBtn = d.querySelector('[data-offer-delete]');
  const status = d.querySelector('[data-offer-status]');
  const offerList = d.querySelector('[data-offer-list]');

  if (!productSelect || !discountInput || !startInput || !endInput || !saveBtn || !deleteBtn || !status || !offerList) {
    return;
  }

  productSelect.innerHTML = productCatalog
    .map((product) => {
      const basePrice = getProductBasePrice(product.id);
      const label = Number.isFinite(basePrice)
        ? `${product.name} (${formatPrice(basePrice)})`
        : product.name;
      return `<option value="${product.id}">${label}</option>`;
    })
    .join('');

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('error', isError);
  };

  const fillFormForSelectedProduct = () => {
    const productId = productSelect.value;
    const offers = readOffers();
    const offer = normalizeOffer(offers[productId]);

    if (!offer) {
      discountInput.value = '';
      startInput.value = '';
      endInput.value = '';
      const basePrice = getProductBasePrice(productId);
      if (Number.isFinite(basePrice)) {
        setStatus(`Produs fără ofertă activă/programată. Preț standard: ${formatPrice(basePrice)}.`);
      } else {
        setStatus('Produs fără ofertă activă/programată.');
      }
      return;
    }

    discountInput.value = String(offer.discount);
    startInput.value = offer.start;
    endInput.value = offer.end;
    const prices = getOfferPriceData(productId, offer.discount);
    if (Number.isFinite(prices.basePrice) && Number.isFinite(prices.finalPrice)) {
      setStatus(`Ofertă încărcată. Preț standard ${formatPrice(prices.basePrice)} -> preț ofertă ${formatPrice(prices.finalPrice)}.`);
    } else {
      setStatus('Ofertă încărcată. Poți modifica procentul sau perioada.');
    }
  };

  const syncOffersBeforeAction = async () => {
    await refreshOffersFromServer();
    return readOffers();
  };

  saveBtn.addEventListener('click', async () => {
    const productId = productSelect.value;
    const discount = Number(discountInput.value);
    const start = startInput.value;
    const end = endInput.value;
    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!productId) {
      setStatus('Selectează un produs.', true);
      return;
    }
    if (!Number.isFinite(discount) || discount < 1 || discount > 95) {
      setStatus('Reducerea trebuie să fie între 1% și 95%.', true);
      return;
    }
    if (!startDate || !endDate || endDate <= startDate) {
      setStatus('Perioada este invalidă. Verifică data/ora start-final.', true);
      return;
    }

    const offers = await syncOffersBeforeAction();
    offers[productId] = { discount: Math.round(discount), start, end };
    if (!(await writeOffers(offers))) {
      setStatus(`Eroare la salvare. Verifică funcția server pentru oferte.${getOfferWriteError()}`, true);
      return;
    }

    await refreshOffersFromServer();
    renderProductOffers();
    renderOfferList(offerList);
    fillFormForSelectedProduct();
    setStatus('Ofertă a fost salvată și sincronizată.');
  });

  deleteBtn.addEventListener('click', async () => {
    const productId = productSelect.value;
    if (!productId) {
      setStatus('Selectează un produs.', true);
      return;
    }

    const offers = await syncOffersBeforeAction();
    delete offers[productId];
    if (!(await writeOffers(offers))) {
      setStatus(`Eroare la ștergere. Verifică funcția server pentru oferte.${getOfferWriteError()}`, true);
      return;
    }

    await refreshOffersFromServer();
    discountInput.value = '';
    startInput.value = '';
    endInput.value = '';
    renderProductOffers();
    renderOfferList(offerList);
    fillFormForSelectedProduct();
    setStatus('Ofertă a fost ștearsă.');
  });

  offerList.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const saveRowBtn = target.closest('[data-offer-item-save]');
    const deleteRowBtn = target.closest('[data-offer-item-delete]');
    if (!saveRowBtn && !deleteRowBtn) return;

    const row = target.closest('[data-offer-item]');
    if (!row) return;
    const productId = row.getAttribute('data-offer-item');
    if (!productId) return;

    if (deleteRowBtn) {
      const offers = await syncOffersBeforeAction();
      delete offers[productId];
      if (!(await writeOffers(offers))) {
        setStatus(`Eroare la ștergere. Verifică funcția server pentru oferte.${getOfferWriteError()}`, true);
        return;
      }
      await refreshOffersFromServer();
      renderProductOffers();
      renderOfferList(offerList);
      fillFormForSelectedProduct();
      setStatus(`Ofertă pentru ${getProductName(productId)} a fost ștearsă.`);
      return;
    }

    const discountInputRow = row.querySelector('[data-offer-item-discount]');
    const startInputRow = row.querySelector('[data-offer-item-start]');
    const endInputRow = row.querySelector('[data-offer-item-end]');
    if (!(discountInputRow instanceof HTMLInputElement) || !(startInputRow instanceof HTMLInputElement) || !(endInputRow instanceof HTMLInputElement)) {
      return;
    }

    const discount = Number(discountInputRow.value);
    const start = startInputRow.value;
    const end = endInputRow.value;
    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!Number.isFinite(discount) || discount < 1 || discount > 95) {
      setStatus('Reducerea trebuie să fie între 1% și 95%.', true);
      return;
    }
    if (!startDate || !endDate || endDate <= startDate) {
      setStatus('Perioada este invalidă. Verifică data/ora start-final.', true);
      return;
    }

    const offers = await syncOffersBeforeAction();
    offers[productId] = { discount: Math.round(discount), start, end };
    if (!(await writeOffers(offers))) {
      setStatus(`Eroare la salvare. Verifică funcția server pentru oferte.${getOfferWriteError()}`, true);
      return;
    }

    await refreshOffersFromServer();
    renderProductOffers();
    renderOfferList(offerList);
    fillFormForSelectedProduct();
    setStatus(`Ofertă pentru ${getProductName(productId)} a fost actualizată.`);
  });

  productSelect.addEventListener('change', fillFormForSelectedProduct);
  fillFormForSelectedProduct();
  renderOfferList(offerList);
  refreshOffersFromServer().then((synced) => {
    if (!synced) return;
    renderOfferList(offerList);
    fillFormForSelectedProduct();
  });
}

renderProductOffers();
renderProductPrices();
renderOffersZone();
updateOffersZoneCountdowns();

async function bootstrapOffers() {
  const synced = await refreshOffersFromServer();
  if (!synced && !offersCacheReady) {
    offersCache = readOffersFromLocalStorage();
    offersCacheReady = true;
  }
  renderProductOffers();
  renderProductPrices();
  renderOffersZone();
  updateOffersZoneCountdowns();
}

bootstrapOffers();

function initAdminGate() {
  const gate = d.querySelector('[data-admin-gate]');
  if (!gate) return;

  const expectedUser = (gate.getAttribute('data-admin-user') || '').trim();
  const expectedPass = gate.getAttribute('data-admin-pass') || '';
  const loginWrap = gate.querySelector('[data-admin-login]');
  const loginForm = gate.querySelector('[data-admin-login-form]');
  const userInput = gate.querySelector('[data-admin-username-input]');
  const passInput = gate.querySelector('[data-admin-password-input]');
  const loginStatus = gate.querySelector('[data-admin-login-status]');
  const adminPanel = gate.querySelector('[data-admin-panel]');
  const logoutBtn = gate.querySelector('[data-admin-logout]');

  if (!expectedUser || !expectedPass || !loginWrap || !loginForm || !userInput || !passInput || !loginStatus || !adminPanel || !logoutBtn) {
    return;
  }

  const authKey = 'lmff-admin-auth-ok-v1';
  const lockPanel = () => {
    adminPanel.classList.add('admin-hidden');
    loginWrap.classList.remove('admin-hidden');
  };

  const unlockPanel = () => {
    adminAuthCache = { user: expectedUser, pass: expectedPass };
    loginWrap.classList.add('admin-hidden');
    adminPanel.classList.remove('admin-hidden');
    if (gate.getAttribute('data-admin-init') !== '1') {
      initOfferAdmin();
      gate.setAttribute('data-admin-init', '1');
    }
  };

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(authKey);
    adminAuthCache = null;
    loginStatus.textContent = 'Te-ai delogat din panoul de administrare.';
    loginStatus.classList.remove('error');
    userInput.focus();
    lockPanel();
  });

  if (sessionStorage.getItem(authKey) === 'ok') {
    unlockPanel();
    return;
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const enteredUser = userInput.value.trim();
    const enteredPass = passInput.value;

    if (enteredUser === expectedUser && enteredPass === expectedPass) {
      loginStatus.textContent = 'Autentificare reusita.';
      loginStatus.classList.remove('error');
      passInput.value = '';
      userInput.value = '';
      userInput.blur();
      passInput.blur();
      unlockPanel();
      sessionStorage.setItem(authKey, 'ok');
      return;
    }

    loginStatus.textContent = 'Utilizator sau parolă invalidă.';
    loginStatus.classList.add('error');
  });
}

initAdminGate();
if (!d.querySelector('[data-admin-gate]')) {
  initOfferAdmin();
}
if (productCards.length) {
  window.setInterval(() => {
    renderProductOffers();
    updateOffersZoneCountdowns();
  }, 1000);
  window.setInterval(() => {
    refreshOffersFromServer().then((synced) => {
      if (!synced) return;
      renderProductOffers();
      renderOffersZone();
      updateOffersZoneCountdowns();
    });
  }, 30000);
}

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

const productLegalNoteText = 'Imaginile produselor au rol de prezentare. Aspectul final poate varia ușor în funcție de preparare.';

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
