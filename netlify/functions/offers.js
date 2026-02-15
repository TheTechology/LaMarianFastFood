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
  const store = getStore(STORE_NAME);

  if (method === 'GET') {
    const current = (await store.get(OFFERS_KEY, { type: 'json' })) || {};
    return json(200, sanitizeOffersMap(current));
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
    await store.set(OFFERS_KEY, JSON.stringify(normalized), {
      contentType: 'application/json'
    });
    return json(200, normalized);
  }

  return json(405, { error: 'Method not allowed' });
};
