/**
 * Session Authentication Test Suite
 */

const { getSessionManager, resetSessionManager } = require('../../src/enterprise/session-manager');
const config = require('../../src/enterprise/config-loader');

describe('SessionAuthentication', () => {
  let sessionManager;

  beforeEach(() => {
    sessionManager = getSessionManager();
  });

  test('sessionCreation', () => {
    const session = sessionManager.createSession(1001, { role: 'admin' });
    
    expect(session.id).toMatch(/^SESSION-/);
    expect(session.token).toHaveLength(64);
    expect(session.userId).toBe(1001);
    expect(session.isValid).toBe(true);
  });

  test('tokenValidation', () => {
    const session = sessionManager.createSession(2001);
    const retrieved = sessionManager.getSessionByToken(session.token);
    
    expect(retrieved).toBeDefined();
    expect(retrieved.userId).toBe(2001);
  });

  test('invalidTokenHandling', () => {
    const result = sessionManager.getSessionByToken('invalid-token-xyz');
    
    expect(result).toBeNull();
  });

  test('activityTracking', async () => {
    const session = sessionManager.createSession(3001);
    const initialActivity = session.lastActivityAt;
    
    await new Promise(resolve => setTimeout(resolve, 10));
    sessionManager.updateActivity(session.token);
    
    const updated = sessionManager.getSessionByToken(session.token);
    expect(updated.lastActivityAt).toBeGreaterThan(initialActivity);
  });

  test('sessionInvalidation', () => {
    const session = sessionManager.createSession(4001);
    
    const invalidated = sessionManager.invalidateSession(session.id);
    expect(invalidated).toBe(true);
    
    const result = sessionManager.getSessionByToken(session.token);
    expect(result).toBeNull();
  });

  test('userSessionCleanup', () => {
    sessionManager.createSession(5001);
    sessionManager.createSession(5001);
    sessionManager.createSession(5001);
    sessionManager.createSession(5002);
    
    const invalidatedCount = sessionManager.invalidateUserSessions(5001);
    
    expect(invalidatedCount).toBe(3);
    expect(sessionManager.getSessionCount()).toBeGreaterThanOrEqual(1);
  });

  test('activeSessionsList', () => {
    sessionManager.createSession(6001);
    sessionManager.createSession(6002);
    sessionManager.createSession(6003);
    
    const active = sessionManager.getActiveSessions();
    
    expect(active.length).toBeGreaterThanOrEqual(3);
    expect(active.every(s => s.isValid)).toBe(true);
  });

  test('concurrentSessionCreation', async () => {
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(Promise.resolve(sessionManager.createSession(7000 + i)));
    }
    
    const sessions = await Promise.all(promises);
    const uniqueTokens = new Set(sessions.map(s => s.token));
    
    expect(uniqueTokens.size).toBe(10);
  });

  test('metadataPersistence', () => {
    const metadata = { 
      browser: 'Chrome',
      ip: '192.168.1.1',
      permissions: ['read', 'write']
    };
    
    const session = sessionManager.createSession(8001, metadata);
    const retrieved = sessionManager.getSessionByToken(session.token);
    
    expect(retrieved.metadata.browser).toBe('Chrome');
    expect(retrieved.metadata.permissions).toContain('write');
  });

  test('sessionCountAccuracy', () => {
    const initialCount = sessionManager.getSessionCount();
    
    sessionManager.createSession(9001);
    sessionManager.createSession(9002);
    
    expect(sessionManager.getSessionCount()).toBe(initialCount + 2);
  });
});

