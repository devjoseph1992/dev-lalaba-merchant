export function log(...args) {
  if (__DEV__) console.log(...args);
}

export function warn(...args) {
  if (__DEV__) console.warn(...args);
}

export function error(...args) {
  if (__DEV__) console.error(...args);
}
