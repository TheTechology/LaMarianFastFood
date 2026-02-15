const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'la-marian-fastfood';
const OFFERS_KEY = 'offers.json';

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

function sanitizeOffersMap(input) {
  if (!input || typeof input !== 'object') return {};
  const out = {};
  Object.entries(input).forEach(([productId, offer]) => {
    const normalized = normalizeOffer(offer);
    if (normalized) out[productId] = normalized;
  });
  return out;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function createStore() {
  const siteID =
    process.env.BLOBS_SITE_ID ||
    process.env.NETLIFY_SITE_ID ||
    process.env.SITE_ID ||
    '';
  const token =
    process.env.BLOBS_TOKEN ||
    process.env.NETLIFY_AUTH_TOKEN ||
    process.env.PERSONAL_ACCESS_TOKEN ||
    '';

  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token });
  }
  return getStore(STORE_NAME);
}

function isAuthorized(event) {
  const legacyUser = 'admin';
  const legacyPass = 'SchimbaParolaAici2026';
  const expectedUser = (process.env.ADMIN_USER || '').trim();
  const expectedPass = process.env.ADMIN_PASS || '';
  if (!expectedUser || !expectedPass) return true;
  const user = (event.headers['x-admin-user'] || '').trim();
  const pass = event.headers['x-admin-pass'] || '';
  if (user === legacyUser && pass === legacyPass) return true;
  return user === expectedUser && pass === expectedPass;
}

exports.handler = async (event) => {
  const method = event.httpMethod || 'GET';
  let store;
  try {
    store = createStore();
  } catch (err) {
    return json(500, {
      error: 'Blobs not configured',
      hint: 'Set BLOBS_SITE_ID and BLOBS_TOKEN in Netlify environment variables.'
    });
  }

  if (method === 'GET') {
    try {
      const current = (await store.get(OFFERS_KEY, { type: 'json' })) || {};
      return json(200, sanitizeOffersMap(current));
    } catch (err) {
      return json(500, {
        error: 'Blobs read failed',
        hint: 'Verify BLOBS_SITE_ID/BLOBS_TOKEN and redeploy.'
      });
    }
  }

  if (method === 'PUT') {
    if (!isAuthorized(event)) {
      return json(401, { error: 'Unauthorized' });
    }

    let payload;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch (err) {
      return json(400, { error: 'Invalid JSON body' });
    }

    const normalized = sanitizeOffersMap(payload);
    try {
      await store.set(OFFERS_KEY, JSON.stringify(normalized), {
        contentType: 'application/json'
      });
      return json(200, normalized);
    } catch (err) {
      return json(500, {
        error: 'Blobs write failed',
        hint: 'Verify BLOBS_SITE_ID/BLOBS_TOKEN and redeploy.'
      });
    }
  }

  return json(405, { error: 'Method not allowed' });
};
