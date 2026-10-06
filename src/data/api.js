/**
 * API Service Client for Rwenanura Parents Primary School
 */

// The session itself is an httpOnly cookie set by the server, which scripts
// cannot read. Only the (non-secret) profile of the signed-in user is kept
// here so the UI knows which role to render.
const USER_KEY = 'rpps_admin_user';

// Tokens were kept in localStorage before cookie sessions; drop any leftover.
try { localStorage.removeItem('rpps_admin_token'); } catch { /* storage unavailable */ }

export function getStoredUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function isSignedIn() {
  return Boolean(getStoredUser());
}

function notifyAuthChange(user) {
  if (typeof window === 'undefined') return;
  if (document.body) {
    document.body.setAttribute('data-user-role', user?.role || 'visitor');
  }
  window.dispatchEvent(new CustomEvent('rpps-auth-state-change', {
    detail: { role: user?.role || 'visitor', user }
  }));
}

export function setAuthSession(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* storage unavailable */ }
  notifyAuthChange(user);
}

// Forget the local profile (e.g. the server reported the session expired).
export function clearAuthSession() {
  try { localStorage.removeItem(USER_KEY); } catch { /* storage unavailable */ }
  notifyAuthChange(null);
}

/**
 * Fetch wrapper for the RPPS API.
 * - Sends the session cookie (same-origin only).
 * - Adds the X-Requested-With header the server requires on writes (CSRF guard).
 * - Always resolves to a JSON object with a `success` flag.
 */
async function apiRequest(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'rpps',
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error('Cannot reach the school server. Please check your connection and try again.');
  }

  // A 401 means the cookie session is gone; keep the UI in sync.
  if (res.status === 401 && getStoredUser()) {
    clearAuthSession();
  }

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }

  return {
    success: false,
    error: `Server response ${res.status}: ${res.statusText || 'Request failed'}`
  };
}

// ----------------- AUTH APIS -----------------

// identifier: an email address or (for pupils) a username
export async function loginUser(identifier, password) {
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });

    if (data.success && data.user) {
      setAuthSession(data.user);
    }
    return data;
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message || 'Network error logging in. Please check connection.' };
  }
}

// Public registration for students and staff. Accounts are created as
// 'pending' and return no session until they are approved.
export async function registerUser({ accountType, name, email, username, password, classLevel }) {
  try {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ accountType, name, email, username, password, classLevel })
    });
  } catch (err) {
    console.error('Register error:', err);
    return { success: false, error: err.message || 'Network error registering account.' };
  }
}

async function postJson(path, body, fallbackError) {
  try {
    return await apiRequest(path, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  } catch (err) {
    return { success: false, error: err.message || fallbackError };
  }
}

export function verifyEmail(token) {
  return postJson('/api/auth/verify-email', { token }, 'Failed to confirm email.');
}

export function resendVerification(email) {
  return postJson('/api/auth/resend-verification', { email }, 'Failed to send confirmation email.');
}

export function requestPasswordReset(email) {
  return postJson('/api/auth/forgot-password', { email }, 'Failed to start password reset.');
}

export function resetPassword(token, password) {
  return postJson('/api/auth/reset-password', { token, password }, 'Failed to reset password.');
}

// Validate the cookie session and refresh the cached profile (role changes
// such as approval or demotion show up without logging in again).
export async function checkAuthMe() {
  try {
    const data = await apiRequest('/api/auth/me');
    if (data.success && data.user) {
      if (JSON.stringify(data.user) !== JSON.stringify(getStoredUser())) {
        setAuthSession(data.user);
      }
    } else if (getStoredUser()) {
      clearAuthSession();
    }
    return data;
  } catch (err) {
    return { success: false };
  }
}

export async function logoutUser() {
  try {
    await apiRequest('/api/auth/logout', { method: 'POST' });
  } catch {
    // Offline: still forget the local profile; the cookie expires on its own.
  }
  clearAuthSession();
}

export async function fetchStaffUsers() {
  try {
    return await apiRequest('/api/auth/users');
  } catch (err) {
    return { success: false, users: [] };
  }
}

export async function approveUser(id) {
  try {
    return await apiRequest(`/api/auth/users/${id}/approve`, {
      method: 'POST'});
  } catch (err) {
    return { success: false, error: err.message || 'Failed to approve account' };
  }
}

export async function issueTemporaryPassword(id) {
  try {
    return await apiRequest(`/api/auth/users/${id}/reset-password`, { method: 'POST' });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to reset password' };
  }
}

export async function updateStaffRole(id, role) {
  try {
    return await apiRequest(`/api/auth/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update role' };
  }
}

export async function deleteStaffUser(id) {
  try {
    return await apiRequest(`/api/auth/users/${id}`, {
      method: 'DELETE'});
  } catch (err) {
    return { success: false, error: err.message || 'Failed to remove account' };
  }
}

// ----------------- ADMISSIONS APIS -----------------

export async function submitApplication(data) {
  try {
    return await apiRequest('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } catch (err) {
    return { success: false, error: err.message || 'Network error submitting application.' };
  }
}

export async function trackApplication(code) {
  try {
    return await apiRequest(`/api/applications/track/${encodeURIComponent(code)}`);
  } catch (err) {
    return { success: false, error: err.message || 'Network error verifying application tracking code.' };
  }
}

export async function fetchApplications() {
  try {
    const res = await apiRequest('/api/applications');
    return res;
  } catch (err) {
    return { success: false, applications: [] };
  }
}

export async function updateApplicationStatus(id, status) {
  try {
    return await apiRequest(`/api/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

export async function deleteApplication(id) {
  try {
    return await apiRequest(`/api/applications/${id}`, {
      method: 'DELETE'});
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete application' };
  }
}

// ----------------- CALENDAR APIS -----------------

export async function fetchCalendar() {
  try {
    return await apiRequest('/api/calendar');
  } catch (err) {
    return { success: false, terms: [], events: [] };
  }
}

async function sendJson(method, path, body, fallbackError) {
  try {
    return await apiRequest(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (err) {
    return { success: false, error: err.message || fallbackError };
  }
}

export function createCalendarEvent(event) {
  return sendJson('POST', '/api/calendar/events', event, 'Failed to add the event.');
}

export function updateCalendarEvent(id, event) {
  return sendJson('PUT', `/api/calendar/events/${id}`, event, 'Failed to update the event.');
}

export function deleteCalendarEvent(id) {
  return sendJson('DELETE', `/api/calendar/events/${id}`, undefined, 'Failed to delete the event.');
}

export function updateCalendarTerm(id, changes) {
  return sendJson('PATCH', `/api/calendar/terms/${id}`, changes, 'Failed to update the term.');
}

// ----------------- NEWSLETTER APIS -----------------

export async function subscribeNewsletter(email) {
  try {
    return await apiRequest('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  } catch (err) {
    return { success: false, error: err.message || 'Network error joining newsletter.' };
  }
}

export async function fetchSubscribers() {
  try {
    return await apiRequest('/api/newsletter');
  } catch (err) {
    return { success: false, subscribers: [] };
  }
}

// ----------------- NEWS APIS -----------------

export async function fetchNewsAndEvents() {
  try {
    return await apiRequest('/api/news');
  } catch (err) {
    return { success: false, newsAndEvents: [] };
  }
}

export async function createNewsItem(itemData) {
  try {
    return await apiRequest('/api/news', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to publish news item.' };
  }
}

export async function deleteNewsItem(id) {
  try {
    return await apiRequest(`/api/news/${id}`, {
      method: 'DELETE'});
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete news item.' };
  }
}

// ----------------- ALUMNI (OBs & OGs) APIS -----------------

export function getStoredAlumniProfile() {
  try {
    const raw = localStorage.getItem('rpps_alumni_profile');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredAlumniProfile(profile) {
  try {
    localStorage.setItem('rpps_alumni_profile', JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save alumni profile locally:', e);
  }
}

export async function fetchAlumniMessages(channel = 'general', search = '', limit = 100) {
  try {
    const params = new URLSearchParams();
    if (channel && channel !== 'all') params.append('channel', channel);
    if (search && search.trim()) params.append('search', search.trim());
    if (limit) params.append('limit', limit);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/alumni/messages${query}`);
  } catch (err) {
    console.error('fetchAlumniMessages error:', err);
    return { success: false, messages: [], error: err.message || 'Failed to fetch messages' };
  }
}

export async function sendAlumniMessage(messageData) {
  try {
    return await apiRequest('/api/alumni/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  } catch (err) {
    console.error('sendAlumniMessage error:', err);
    return { success: false, error: err.message || 'Failed to send message' };
  }
}

export async function reactToAlumniMessage(messageId) {
  try {
    return await apiRequest(`/api/alumni/messages/${messageId}/react`, {
      method: 'POST'});
  } catch (err) {
    console.error('reactToAlumniMessage error:', err);
    return { success: false, error: err.message || 'Failed to react' };
  }
}

export async function fetchAlumniChannels() {
  try {
    return await apiRequest('/api/alumni/channels');
  } catch (err) {
    console.error('fetchAlumniChannels error:', err);
    return { success: false, channels: [] };
  }
}

export async function sendAlumniTypingStatus(channel = 'general', isTyping = true) {
  try {
    return await apiRequest('/api/alumni/typing', {
      method: 'POST',
      body: JSON.stringify({ channel, isTyping })
    });
  } catch (err) {
    return { success: false };
  }
}

export function connectAlumniStream(onEvent, onError) {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
    return () => {};
  }

  const es = new EventSource('/api/alumni/stream');

  // Forward each server event; ignore malformed payloads
  for (const eventType of ['new_message', 'reaction_update', 'typing_status', 'online_count']) {
    es.addEventListener(eventType, (e) => {
      let data;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      onEvent(eventType, data);
    });
  }

  es.onerror = (err) => {
    if (onError) onError(err);
  };

  return () => {
    es.close();
  };
}

export async function fetchAlumniMembers(type = '', search = '') {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search && search.trim()) params.append('search', search.trim());

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/alumni/members${query}`);
  } catch (err) {
    console.error('fetchAlumniMembers error:', err);
    return { success: false, members: [], stats: {} };
  }
}

export async function registerAlumniAccount(accountData) {
  try {
    const data = await apiRequest('/api/auth/alumni-register', {
      method: 'POST',
      body: JSON.stringify(accountData)
    });

    if (data.success && data.user) {
      setAuthSession(data.user);
    }
    return data;
  } catch (err) {
    console.error('registerAlumniAccount error:', err);
    return { success: false, error: err.message || 'Failed to register alumni account' };
  }
}

