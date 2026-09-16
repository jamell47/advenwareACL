export function createLogger(name: string) {
  return {
    error: (msg: string, meta?: any) => console.error(`[${name}] ERROR: ${msg}`, meta || ""),
    warn: (msg: string, meta?: any) => console.warn(`[${name}] WARN: ${msg}`, meta || ""),
    info: (msg: string, meta?: any) => console.log(`[${name}] INFO: ${msg}`, meta || ""),
    debug: (msg: string, meta?: any) => console.debug(`[${name}] DEBUG: ${msg}`, meta || ""),
  };
}
