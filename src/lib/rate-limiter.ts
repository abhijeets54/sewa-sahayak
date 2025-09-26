// Simple rate limiter for Gemini API free tier
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitForAvailability(): Promise<void> {
    const now = Date.now();

    // Clean old requests outside time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest) + 100; // Add 100ms buffer

      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForAvailability(); // Recursively check again
      }
    }

    // Record this request
    this.requests.push(now);
  }
}

// Create rate limiter for embedding API (100 RPM = ~1.7 requests per second)
// Using conservative limit of 30 requests per minute to stay safe
export const embeddingRateLimiter = new RateLimiter(30, 60 * 1000);

// Create rate limiter for generation API (15 RPM for free tier)
export const generationRateLimiter = new RateLimiter(10, 60 * 1000);