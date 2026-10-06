/**
 * API Service Client for Rwenanura Parents Primary School
 */

const TOKEN_KEY = 'rpps_admin_token';
const USER_KEY = 'rpps_admin_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (typeof window !== 'undefined') {
    if (document.body) {
      document.body.setAttribute('data-user-role', user?.role || 'visitor');
    }
    window.dispatchEvent(new CustomEvent('rpps-auth-state-change', {
      detail: { role: user?.role || 'visitor', user }
    }));
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (typeof window !== 'undefined') {
    if (document.body) {
      document.body.setAttribute('data-user-role', 'visitor');
    }
    window.dispatchEvent(new CustomEvent('rpps-auth-state-change', {
      detail: { role: 'visitor', user: null }
    }));
  }
}

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Resilient API Request with Automatic Backend Fallback:
 * 1. Attempts relative proxied path (e.g. /api/auth/login)
 * 2. If network fails, automatically attempts direct connection to port 5000:
 *    http://${window.location.hostname}:5000${path}
 */
async function apiRequest(path, options = {}) {
  let res;

  try {
    res = await fetch(path, options);
  } catch (primaryErr) {
    // If Vite proxy dropped or failed, try direct connection to backend
    try {
      const host = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
      const fallbackUrl = `http://${host}:5000${path}`;
      res = await fetch(fallbackUrl, options);
    } catch (fallbackErr) {
      throw new Error('Backend server is offline or unreachable. Please verify the server is running on port 5000.');
    }
  }

  // Handle non-JSON responses (e.g. proxy HTML 502/504 errors)
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await res.json();
  }

  if (!res.ok) {
    const errorText = await res.text();
    return {
      success: false,
      error: `Server response ${res.status}: ${res.statusText || errorText || 'Request failed'}`
    };
  }

  try {
    return await res.json();
  } catch {
    return { success: res.ok };
  }
}

// ----------------- AUTH APIS -----------------

export async function loginUser(email, password) {
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (data.success && data.token) {
      setAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: err.message || 'Network error logging in. Please check connection.' };
  }
}

// Public registration for students and staff. Accounts are created as
// 'pending' and return no session until they are approved.
export async function registerUser({ accountType, name, email, password, classLevel }) {
  try {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountType, name, email, password, classLevel })
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
      headers: { 'Content-Type': 'application/json' },
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

export async function checkAuthMe() {
  try {
    const data = await apiRequest('/api/auth/me', {
      headers: getAuthHeaders()
    });

    if (!data.success) {
      clearAuthSession();
    }
    return data;
  } catch (err) {
    return { success: false };
  }
}

export async function fetchStaffUsers() {
  try {
    return await apiRequest('/api/auth/users', { headers: getAuthHeaders() });
  } catch (err) {
    return { success: false, users: [] };
  }
}

export async function approveUser(id) {
  try {
    return await apiRequest(`/api/auth/users/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to approve account' };
  }
}

export async function updateStaffRole(id, role) {
  try {
    return await apiRequest(`/api/auth/users/${id}/role`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update role' };
  }
}

export async function deleteStaffUser(id) {
  try {
    return await apiRequest(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to remove account' };
  }
}

// ----------------- ADMISSIONS APIS -----------------

export async function submitApplication(data) {
  try {
    return await apiRequest('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const res = await apiRequest('/api/applications', { headers: getAuthHeaders() });
    return res;
  } catch (err) {
    return { success: false, applications: [] };
  }
}

export async function updateApplicationStatus(id, status) {
  try {
    return await apiRequest(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

export async function deleteApplication(id) {
  try {
    return await apiRequest(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to delete application' };
  }
}

// ----------------- CALENDAR APIS -----------------

export async function fetchCalendar() {
  try {
    return await apiRequest('/api/calendar', { headers: getAuthHeaders() });
  } catch (err) {
    return { success: false, terms: [], events: [] };
  }
}

// ----------------- NEWSLETTER APIS -----------------

export async function subscribeNewsletter(email) {
  try {
    return await apiRequest('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  } catch (err) {
    return { success: false, error: err.message || 'Network error joining newsletter.' };
  }
}

export async function fetchSubscribers() {
  try {
    return await apiRequest('/api/newsletter', { headers: getAuthHeaders() });
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
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
  } catch (err) {
    return { success: false, error: err.message || 'Failed to publish news item.' };
  }
}

export async function deleteNewsItem(id) {
  try {
    return await apiRequest(`/api/news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
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
      headers: getAuthHeaders(),
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
      method: 'POST',
      headers: getAuthHeaders()
    });
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
      headers: getAuthHeaders(),
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

  es.addEventListener('new_message', (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent('new_message', data);
    } catch (err) {}
  });

  es.addEventListener('reaction_update', (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent('reaction_update', data);
    } catch (err) {}
  });

  es.addEventListener('typing_status', (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent('typing_status', data);
    } catch (err) {}
  });

  es.addEventListener('online_count', (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent('online_count', data);
    } catch (err) {}
  });

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
    return await apiRequest(`/api/alumni/members${query}`, {
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error('fetchAlumniMembers error:', err);
    return { success: false, members: [], stats: {} };
  }
}

export async function registerAlumniMember(memberData) {
  try {
    const data = await apiRequest('/api/alumni/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });

    if (data.success && data.token && data.user) {
      setAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    console.error('registerAlumniMember error:', err);
    return { success: false, error: err.message || 'Failed to register alumni member' };
  }
}

export async function registerAlumniAccount(accountData) {
  try {
    const data = await apiRequest('/api/auth/alumni-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });

    if (data.success && data.token && data.user) {
      setAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    console.error('registerAlumniAccount error:', err);
    return { success: false, error: err.message || 'Failed to register alumni account' };
  }
}

