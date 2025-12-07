/**
 * Session Manager - Handles user sessions and authentication state
 */

const crypto = require('crypto');
const config = require('./config-loader');

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.tokenIndex = new Map();
    this.cleanupInterval = null;
  }

  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  createSession(userId, metadata = {}) {
    const token = this.generateToken();
    const now = Date.now();
    const settings = config.getConfig();
    
    const session = {
      id: `SESSION-${now}-${Math.random().toString(36).substr(2, 8)}`,
      userId,
      token,
      createdAt: now,
      lastActivityAt: now,
      expiresAt: now + (settings.apiTimeout * 60),
      metadata,
      isValid: true
    };

    this.sessions.set(session.id, session);
    this.tokenIndex.set(token, session.id);
    
    return session;
  }

  getSessionByToken(token) {
    const sessionId = this.tokenIndex.get(token);
    if (!sessionId) return null;
    
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.invalidateSession(sessionId);
      return null;
    }

    return session;
  }

  updateActivity(token) {
    const session = this.getSessionByToken(token);
    if (session) {
      session.lastActivityAt = Date.now();
      return true;
    }
    return false;
  }

  invalidateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isValid = false;
      this.tokenIndex.delete(session.token);
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  invalidateUserSessions(userId) {
    const toInvalidate = [];
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        toInvalidate.push(id);
      }
    }
    toInvalidate.forEach(id => this.invalidateSession(id));
    return toInvalidate.length;
  }

  getActiveSessions() {
    const now = Date.now();
    return Array.from(this.sessions.values())
      .filter(s => s.isValid && s.expiresAt > now);
  }

  getSessionCount() {
    return this.sessions.size;
  }

  startCleanup(intervalMs = 60000) {
    this.stopCleanup();
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [id, session] of this.sessions) {
        if (session.expiresAt < now) {
          this.invalidateSession(id);
        }
      }
    }, intervalMs);
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  reset() {
    this.stopCleanup();
    this.sessions.clear();
    this.tokenIndex.clear();
  }
}

let instance = null;

function getSessionManager() {
  if (!instance) {
    instance = new SessionManager();
  }
  return instance;
}

function resetSessionManager() {
  if (instance) {
    instance.reset();
  }
  instance = null;
}

module.exports = { SessionManager, getSessionManager, resetSessionManager };

