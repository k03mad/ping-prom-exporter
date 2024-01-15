/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms = 3000) => new Promise(resolve => setTimeout(resolve, ms));
