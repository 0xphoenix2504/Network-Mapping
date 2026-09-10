const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../network_data.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS drops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drop_id TEXT UNIQUE NOT NULL,
    building TEXT DEFAULT '',
    floor TEXT NOT NULL,
    room_office TEXT NOT NULL,
    user_device TEXT DEFAULT '',
    rack_name TEXT NOT NULL,
    patch_panel TEXT NOT NULL,
    patch_port INTEGER NOT NULL,
    switch_name TEXT NOT NULL,
    switch_ip TEXT DEFAULT '',
    switch_port TEXT NOT NULL,
    vlan_id INTEGER DEFAULT 1,
    vlan_name TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    device_type TEXT DEFAULT 'PC',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_drops_drop_id ON drops (drop_id);
  CREATE INDEX IF NOT EXISTS idx_drops_rack ON drops (rack_name);
  CREATE INDEX IF NOT EXISTS idx_drops_patch ON drops (patch_panel, patch_port);
  CREATE INDEX IF NOT EXISTS idx_drops_switch ON drops (switch_name, switch_port);
  CREATE INDEX IF NOT EXISTS idx_drops_vlan ON drops (vlan_id);
  CREATE INDEX IF NOT EXISTS idx_drops_status ON drops (status);
  CREATE INDEX IF NOT EXISTS idx_drops_floor ON drops (floor);
`);

module.exports = db;
