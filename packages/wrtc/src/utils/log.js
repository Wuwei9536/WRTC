export function log(msg) {
  console.log(msg);
}

export function warn(msg) {
  console.warn(msg);
}

export function error(msg, callback = () => {}) {
  console.error(msg);
  callback();
}
