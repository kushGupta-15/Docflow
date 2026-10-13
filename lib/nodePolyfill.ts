// Node 26 compatibility polyfill for legacy buffer-equal-constant-time / jwa dependencies
if (typeof window === 'undefined') {
  try {
    const bufferModule = require('buffer');
    if (bufferModule && !bufferModule.SlowBuffer) {
      bufferModule.SlowBuffer = class SlowBuffer {};
      bufferModule.SlowBuffer.prototype.equal = () => false;
    }
  } catch {
    // Ignore in non-Node environments
  }
}

export {};
