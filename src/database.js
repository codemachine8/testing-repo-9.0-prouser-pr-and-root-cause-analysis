// Database mock for testing state pollution and dependency tracking

const db = {
  users: {},

  getUser(id) {
    return this.users[id] || null;
  },

  updateUser(id, data) {
    if (!this.users[id]) {
      this.users[id] = {};
    }
    this.users[id] = { ...this.users[id], ...data };
    return this.users[id];
  },

  deleteUser(id) {
    delete this.users[id];
  },

  clear() {
    this.users = {};
  }
};

module.exports = { db };
