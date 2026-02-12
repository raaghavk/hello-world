const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || './data/uptime.db';
const dbDir = path.dirname(dbPath);

// Create data directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      subscription_status TEXT DEFAULT 'inactive',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS monitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      check_interval INTEGER DEFAULT 300,
      status TEXT DEFAULT 'unknown',
      last_checked DATETIME,
      last_status_change DATETIME,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitor_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      response_time INTEGER,
      status_code INTEGER,
      error_message TEXT,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monitor_id INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      status TEXT DEFAULT 'ongoing',
      notification_sent INTEGER DEFAULT 0,
      FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      incident_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_monitors_user_id ON monitors(user_id);
    CREATE INDEX IF NOT EXISTS idx_checks_monitor_id ON checks(monitor_id);
    CREATE INDEX IF NOT EXISTS idx_checks_checked_at ON checks(checked_at);
    CREATE INDEX IF NOT EXISTS idx_incidents_monitor_id ON incidents(monitor_id);
  `);

  console.log('Database initialized successfully');
}

// User operations
const userDb = {
  create: (email, passwordHash) => {
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    return stmt.run(email, passwordHash);
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  updateSubscription: (userId, plan, stripeCustomerId, stripeSubscriptionId, status) => {
    const stmt = db.prepare(`
      UPDATE users
      SET plan = ?, stripe_customer_id = ?, stripe_subscription_id = ?, subscription_status = ?
      WHERE id = ?
    `);
    return stmt.run(plan, stripeCustomerId, stripeSubscriptionId, status, userId);
  },

  updateLastLogin: (userId) => {
    const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(userId);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT id, email, plan, subscription_status, created_at FROM users');
    return stmt.all();
  }
};

// Monitor operations
const monitorDb = {
  create: (userId, name, url, checkInterval = 300) => {
    const stmt = db.prepare(`
      INSERT INTO monitors (user_id, name, url, check_interval)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(userId, name, url, checkInterval);
  },

  findByUserId: (userId) => {
    const stmt = db.prepare('SELECT * FROM monitors WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM monitors WHERE id = ?');
    return stmt.get(id);
  },

  getAllActive: () => {
    const stmt = db.prepare('SELECT * FROM monitors WHERE is_active = 1');
    return stmt.all();
  },

  updateStatus: (monitorId, status, responseTime, statusCode, errorMessage = null) => {
    const stmt = db.prepare(`
      UPDATE monitors
      SET status = ?, last_checked = CURRENT_TIMESTAMP,
          last_status_change = CASE WHEN status != ? THEN CURRENT_TIMESTAMP ELSE last_status_change END
      WHERE id = ?
    `);
    stmt.run(status, status, monitorId);

    // Record check
    const checkStmt = db.prepare(`
      INSERT INTO checks (monitor_id, status, response_time, status_code, error_message)
      VALUES (?, ?, ?, ?, ?)
    `);
    checkStmt.run(monitorId, status, responseTime, statusCode, errorMessage);
  },

  delete: (id, userId) => {
    const stmt = db.prepare('DELETE FROM monitors WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  },

  update: (id, userId, name, url, checkInterval) => {
    const stmt = db.prepare(`
      UPDATE monitors
      SET name = ?, url = ?, check_interval = ?
      WHERE id = ? AND user_id = ?
    `);
    return stmt.run(name, url, checkInterval, id, userId);
  },

  getStats: (monitorId, limit = 100) => {
    const stmt = db.prepare(`
      SELECT status, response_time, status_code, checked_at
      FROM checks
      WHERE monitor_id = ?
      ORDER BY checked_at DESC
      LIMIT ?
    `);
    return stmt.all(monitorId, limit);
  }
};

// Incident operations
const incidentDb = {
  create: (monitorId) => {
    const stmt = db.prepare('INSERT INTO incidents (monitor_id) VALUES (?)');
    return stmt.run(monitorId);
  },

  findOngoing: (monitorId) => {
    const stmt = db.prepare(`
      SELECT * FROM incidents
      WHERE monitor_id = ? AND status = 'ongoing'
      ORDER BY started_at DESC
      LIMIT 1
    `);
    return stmt.get(monitorId);
  },

  resolve: (incidentId) => {
    const stmt = db.prepare(`
      UPDATE incidents
      SET resolved_at = CURRENT_TIMESTAMP, status = 'resolved'
      WHERE id = ?
    `);
    return stmt.run(incidentId);
  },

  markNotificationSent: (incidentId) => {
    const stmt = db.prepare('UPDATE incidents SET notification_sent = 1 WHERE id = ?');
    return stmt.run(incidentId);
  },

  getByMonitor: (monitorId, limit = 20) => {
    const stmt = db.prepare(`
      SELECT * FROM incidents
      WHERE monitor_id = ?
      ORDER BY started_at DESC
      LIMIT ?
    `);
    return stmt.all(monitorId, limit);
  }
};

// Notification operations
const notificationDb = {
  create: (userId, incidentId, type, message) => {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, incident_id, type, message)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(userId, incidentId, type, message);
  },

  getByUser: (userId, limit = 50) => {
    const stmt = db.prepare(`
      SELECT n.*, i.monitor_id, m.name as monitor_name
      FROM notifications n
      JOIN incidents i ON n.incident_id = i.id
      JOIN monitors m ON i.monitor_id = m.id
      WHERE n.user_id = ?
      ORDER BY n.sent_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  }
};

module.exports = {
  db,
  initDatabase,
  userDb,
  monitorDb,
  incidentDb,
  notificationDb
};
