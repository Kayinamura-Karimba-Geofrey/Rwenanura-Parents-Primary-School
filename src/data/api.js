/**
 * API Service Client for Rwenanura Parents Primary School
 */

const TOKEN_KEY = 'rpps_admin_token';
const USER_KEY = 'rpps_admin_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getAuthHeaders() {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// ----------------- AUTH APIS -----------------

export async function loginUser(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'Network error logging in. Please check connection.' };
  }
}

export async function signupUser(name, email, password, role = 'staff') {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    console.error('Signup error:', err);
    return { success: false, error: 'Network error registering account.' };
  }
}

export async function checkAuthMe() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!data.success) {
      clearAuthSession();
    }
    return data;
  } catch (err) {
    return { success: false };
  }
}

// ----------------- ADMISSIONS APIS -----------------

export async function submitApplication(data) {
  try {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error submitting application.' };
  }
}

export async function fetchApplications() {
  try {
    const res = await fetch('/api/applications', { headers: getAuthHeaders() });
    return await res.json();
  } catch (err) {
    return { success: false, applications: [] };
  }
}

export async function updateApplicationStatus(id, status) {
  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to update status' };
  }
}

export async function deleteApplication(id) {
  try {
    const res = await fetch(`/api/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to delete application' };
  }
}

// ----------------- NEWSLETTER APIS -----------------

export async function subscribeNewsletter(email) {
  try {
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error joining newsletter.' };
  }
}

export async function fetchSubscribers() {
  try {
    const res = await fetch('/api/newsletter', { headers: getAuthHeaders() });
    return await res.json();
  } catch (err) {
    return { success: false, subscribers: [] };
  }
}

// ----------------- NEWS APIS -----------------

export async function fetchNewsAndEvents() {
  try {
    const res = await fetch('/api/news');
    return await res.json();
  } catch (err) {
    return { success: false, newsAndEvents: [] };
  }
}

export async function createNewsItem(itemData) {
  try {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to publish news item.' };
  }
}

export async function deleteNewsItem(id) {
  try {
    const res = await fetch(`/api/news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to delete news item.' };
  }
}
