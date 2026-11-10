/**
 * Format a number with thousand separators
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return n?.toLocaleString() ?? "0";
}

/**
 * Zero-pad a number to a given width
 * @param {number} n
 * @param {number} width
 * @returns {string}
 */
export function zeroPad(n, width = 2) {
  return n.toString().padStart(width, "0");
}

export function formatDuration(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${zeroPad(m)}:${zeroPad(s)}` : `${m}:${zeroPad(s)}`;
}

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
