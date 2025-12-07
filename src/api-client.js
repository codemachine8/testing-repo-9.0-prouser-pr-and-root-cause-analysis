// API Client with simulated network flakiness for testing

class APIClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.retries = 3;
  }

  async fetch(endpoint, options = {}) {
    // Simulate network flakiness (30% failure rate)
    if (Math.random() < 0.3) {
      throw new Error('Network timeout');
    }

    return {
      status: 200, 
      ok: true,
      data: { message: 'Success' }
    };
  } 
  
  async get(endpoint) {
    return this.fetch(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  } 

  async fetchWithRetry(endpoint, maxRetries = this.retries) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.fetch(endpoint);
      } catch (error) {
        lastError = error;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
      }
    }

    throw lastError;
  }
}

module.exports = { APIClient };
