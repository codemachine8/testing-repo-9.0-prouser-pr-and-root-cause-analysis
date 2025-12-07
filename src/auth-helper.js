// Authentication helper functions for testing import parsing

function validateEmail(email) {
  if (!email) return false;
  return email.includes('@') && email.includes('.');
}

function hashPassword(password) {
  // Simple mock hash - not for production use
  if (!password) return null;
  return `hashed_${password}_${password.length}`;
}

function validatePassword(password) {
  if (!password) return false;
  return password.length >= 8;
}

function generateToken(userId) {
  return `token_${userId}_${Date.now()}`;
}

module.exports = {
  validateEmail,
  hashPassword,
  validatePassword,
  generateToken
};
