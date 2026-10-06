/**
 * App lifecycle scope.
 *
 * The UI is rebuilt from scratch when the language changes (main.js). Anything
 * a component registers outside its own DOM (window/document listeners, auth
 * subscriptions, timers, observers, live streams) must be tied to the current
 * scope so the previous build is fully torn down instead of leaking.
 *
 *   window.addEventListener('x', fn, { signal: currentScope() });
 *   onCleanup(() => clearInterval(timer));
 */
let controller = new AbortController();

export function currentScope() {
  return controller.signal;
}

// Tear down everything registered by the previous build; start a new scope.
export function resetScope() {
  controller.abort();
  controller = new AbortController();
  return controller.signal;
}

export function onCleanup(fn) {
  controller.signal.addEventListener('abort', fn, { once: true });
}
