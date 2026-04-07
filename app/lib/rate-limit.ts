// in-memory so on serverless each instance has its own count (redis/kv if you need it shared)
const ipRequests: Record<string, { count: number; firstRequest: number }> = {};

export function checkRateLimit(ip: string, maxRequests: number, rateLimitWindow: number): boolean {
  const now = Date.now();

  if (!ipRequests[ip]) {
    ipRequests[ip] = { count: 1, firstRequest: now };
    return true;
  }

  const data = ipRequests[ip];
  if (now - data.firstRequest < rateLimitWindow) {
    if (data.count >= maxRequests) {
      return false;
    }
    data.count++;
    return true;
  }

  ipRequests[ip] = { count: 1, firstRequest: now };
  return true;
}
