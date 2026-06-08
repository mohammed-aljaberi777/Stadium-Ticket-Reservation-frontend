// Single source of truth for talking to the backend.
// Reads BASE_URL from VITE_API_BASE env var; falls back to local dev URL.

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body, { auth = false, raw = false } = {}) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeaders() : {}),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);

  if (raw) return res; // for binary responses like QR PNGs

  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    const err = new Error("API error");
    err.status = res.status;
    err.detail = data?.detail;
    throw err;
  }
  return data;
}

export const api = {
  // --- Auth ---
  register: (body) => request("POST", "/v1/auth/register", body),
  login: (body) => request("POST", "/v1/auth/login", body),
  me: () => request("GET", "/v1/auth/me", undefined, { auth: true }),

  // --- 2FA ---
  setup2FA: () => request("POST", "/v1/auth/2fa/setup", undefined, { auth: true }),
  verify2FA: (code) => request("POST", "/v1/auth/2fa/verify", { code }, { auth: true }),
  disable2FA: (password, code) =>
    request("POST", "/v1/auth/2fa/disable", { password, code }, { auth: true }),
  qr2FAUrl: () => `${BASE_URL}/v1/auth/2fa/qr`, // browser fetches this with Bearer header

  // --- Matches ---
  listMatches: () => request("GET", "/v1/matches"),
  getMatch: (id) => request("GET", `/v1/matches/${id}`),
  getSections: (matchId) => request("GET", `/v1/matches/${matchId}/sections`),

  // --- Holds + Bookings + Tickets ---
  createHold: (matchId, match_seat_ids) =>
    request("POST", `/v1/matches/${matchId}/holds`, { match_seat_ids }, { auth: true }),
  releaseHold: (holdId) =>
    request("DELETE", `/v1/holds/${holdId}`, undefined, { auth: true }),
  createBooking: (hold_id) =>
    request("POST", "/v1/bookings", { hold_id }, { auth: true }),
  myTickets: () => request("GET", "/v1/tickets/me", undefined, { auth: true }),
  ticketQrUrl: (ticketId) => `${BASE_URL}/v1/tickets/${ticketId}/qr`,
};

export { BASE_URL };
