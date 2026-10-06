/**
 * RPPS Role-Based Access Control (RBAC) Client Manager
 * Manages visitor, alumni, student and staff roles with reactive state updates.
 */

import { getStoredUser, setAuthSession, logoutUser as endServerSession } from './api.js';

export const USER_ROLES = {
  VISITOR: 'visitor',
  ALUMNI: 'alumni',
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin'
};

const AUTH_EVENT_NAME = 'rpps-auth-state-change';

/**
 * Get current active user object from local storage
 */
export function getCurrentUser() {
  return getStoredUser();
}

/**
 * Get the active role: 'visitor', 'alumni', 'student', 'staff', or 'admin'
 */
export function getUserRole() {
  const user = getCurrentUser();
  if (!user || !user.role) return USER_ROLES.VISITOR;
  return user.role;
}

/**
 * Role query helpers
 */
export function isVisitor() {
  return getUserRole() === USER_ROLES.VISITOR;
}

export function isAlumni() {
  return getUserRole() === USER_ROLES.ALUMNI;
}

export function isStudent() {
  return getUserRole() === USER_ROLES.STUDENT;
}

// The school calendar is restricted to signed-in students, staff and admins
// (the API enforces the same rule on GET /api/calendar).
export function canViewCalendar() {
  const role = getUserRole();
  return role === USER_ROLES.STUDENT || role === USER_ROLES.STAFF || role === USER_ROLES.ADMIN;
}

export function isStaffOrAdmin() {
  const role = getUserRole();
  return role === USER_ROLES.STAFF || role === USER_ROLES.ADMIN;
}

/**
 * Set authenticated session and notify all subscribers
 */
export function setUserSession(user) {
  setAuthSession(user);
}

/**
 * Log out and notify all subscribers
 */
export function logoutUser() {
  return endServerSession();
}

/**
 * Synchronize data-user-role on document.body for CSS scoping
 */
function syncRoleAttribute(role) {
  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-user-role', role || USER_ROLES.VISITOR);
  }
}

/**
 * Dispatch reactive auth state event
 */
function notifyAuthChange(role, user) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(AUTH_EVENT_NAME, {
      detail: { role, user }
    });
    window.dispatchEvent(event);
  }
}

/**
 * Subscribe to auth / role state changes
 */
export function onAuthChange(callback) {
  if (typeof window !== 'undefined') {
    const handler = (e) => {
      callback(e.detail.role, e.detail.user);
    };
    window.addEventListener(AUTH_EVENT_NAME, handler);
    return () => window.removeEventListener(AUTH_EVENT_NAME, handler);
  }
  return () => {};
}

/**
 * Initialize role attribute on page load
 */
export function initUserRole() {
  syncRoleAttribute(getUserRole());
}
