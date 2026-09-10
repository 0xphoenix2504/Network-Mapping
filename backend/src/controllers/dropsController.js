const db = require('../config/database');

// Search & List Drops with dynamic filters
exports.getAllDrops = (req, res) => {
  try {
    const {
      q,
      building,
      floor,
      rack_name,
      patch_panel,
      switch_name,
      status,
      vlan_id,
      page = 1,
      limit = 100
    } = req.query;

    let sql = 'SELECT * FROM drops WHERE 1=1';
    const params = [];

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      sql += ` AND (
        drop_id LIKE ? OR 
        room_office LIKE ? OR 
        user_device LIKE ? OR 
        switch_name LIKE ? OR 
        switch_port LIKE ? OR 
        switch_ip LIKE ? OR 
        patch_panel LIKE ? OR 
        rack_name LIKE ? OR 
        notes LIKE ? OR 
        vlan_name LIKE ? OR
        device_type LIKE ?
      )`;
      for (let i = 0; i < 11; i++) {
        params.push(searchTerm);
      }
    }

    if (building) {
      sql += ' AND building = ?';
      params.push(building);
    }
    if (floor) {
      sql += ' AND floor = ?';
      params.push(floor);
    }
    if (rack_name) {
      sql += ' AND rack_name = ?';
      params.push(rack_name);
    }
    if (patch_panel) {
      sql += ' AND patch_panel = ?';
      params.push(patch_panel);
    }
    if (switch_name) {
      sql += ' AND switch_name = ?';
      params.push(switch_name);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (vlan_id) {
      sql += ' AND vlan_id = ?';
      params.push(Number(vlan_id));
    }

    // Count total matches
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.total : 0;

    // Sorting and Pagination
    sql += ' ORDER BY rack_name ASC, patch_panel ASC, patch_port ASC';
    
    if (limit && Number(limit) > 0) {
      const offset = (Number(page) - 1) * Number(limit);
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), Number(offset));
    }

    const rows = db.prepare(sql).all(...params);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: rows
    });
  } catch (error) {
    console.error('Error fetching drops:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single drop by ID or Drop_ID with End-to-End trace
exports.getDropById = (req, res) => {
  try {
    const { id } = req.params;
    let row;
    if (isNaN(id)) {
      row = db.prepare('SELECT * FROM drops WHERE drop_id = ?').get(id);
    } else {
      row = db.prepare('SELECT * FROM drops WHERE id = ? OR drop_id = ?').get(id, id);
    }

    if (!row) {
      return res.status(404).json({ success: false, message: 'Drop not found' });
    }

    // Build trace object
    const trace = {
      wallOutlet: {
        dropId: row.drop_id,
        building: row.building,
        floor: row.floor,
        room: row.room_office,
        userDevice: row.user_device,
        deviceType: row.device_type,
        status: row.status
      },
      patchPanel: {
        rack: row.rack_name,
        panel: row.patch_panel,
        port: row.patch_port,
        label: `${row.rack_name} / ${row.patch_panel} / Port ${row.patch_port}`
      },
      patchCord: {
        from: `${row.patch_panel}:${row.patch_port}`,
        to: `${row.switch_name}:${row.switch_port}`,
        notes: row.notes || 'Standard UTP Patch Cord'
      },
      switchConnection: {
        switchName: row.switch_name,
        switchIp: row.switch_ip,
        switchPort: row.switch_port,
        vlanId: row.vlan_id,
        vlanName: row.vlan_name,
        label: `${row.switch_name} [${row.switch_port}] (VLAN ${row.vlan_id})`
      }
    };

    res.json({ success: true, data: row, trace });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new drop
exports.createDrop = (req, res) => {
  try {
    const {
      drop_id,
      building = '',
      floor,
      room_office,
      user_device = '',
      rack_name,
      patch_panel,
      patch_port,
      switch_name,
      switch_ip = '',
      switch_port,
      vlan_id = 1,
      vlan_name = '',
      status = 'Active',
      device_type = 'PC',
      notes = ''
    } = req.body;

    if (!drop_id || !floor || !room_office || !rack_name || !patch_panel || !patch_port || !switch_name || !switch_port) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (Drop ID, Floor, Room, Rack, Patch Panel, Patch Port, Switch Name, Switch Port)'
      });
    }

    // Check if Drop ID exists
    const existing = db.prepare('SELECT id FROM drops WHERE drop_id = ?').get(drop_id);
    if (existing) {
      return res.status(400).json({ success: false, message: `Drop ID "${drop_id}" already exists.` });
    }

    const stmt = db.prepare(`
      INSERT INTO drops (
        drop_id, building, floor, room_office, user_device,
        rack_name, patch_panel, patch_port, switch_name, switch_ip,
        switch_port, vlan_id, vlan_name, status, device_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      drop_id.trim(),
      building.trim(),
      floor.trim(),
      room_office.trim(),
      user_device.trim(),
      rack_name.trim(),
      patch_panel.trim(),
      Number(patch_port),
      switch_name.trim(),
      switch_ip.trim(),
      switch_port.trim(),
      Number(vlan_id) || 1,
      vlan_name.trim(),
      status.trim(),
      device_type.trim(),
      notes.trim()
    );

    const newRecord = db.prepare('SELECT * FROM drops WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: 'Drop created successfully', data: newRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update drop
exports.updateDrop = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM drops WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Drop not found' });
    }

    const {
      drop_id = existing.drop_id,
      building = existing.building,
      floor = existing.floor,
      room_office = existing.room_office,
      user_device = existing.user_device,
      rack_name = existing.rack_name,
      patch_panel = existing.patch_panel,
      patch_port = existing.patch_port,
      switch_name = existing.switch_name,
      switch_ip = existing.switch_ip,
      switch_port = existing.switch_port,
      vlan_id = existing.vlan_id,
      vlan_name = existing.vlan_name,
      status = existing.status,
      device_type = existing.device_type,
      notes = existing.notes
    } = req.body;

    const stmt = db.prepare(`
      UPDATE drops SET
        drop_id = ?, building = ?, floor = ?, room_office = ?, user_device = ?,
        rack_name = ?, patch_panel = ?, patch_port = ?, switch_name = ?, switch_ip = ?,
        switch_port = ?, vlan_id = ?, vlan_name = ?, status = ?, device_type = ?, notes = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      drop_id.trim(),
      building ? building.trim() : '',
      floor.trim(),
      room_office.trim(),
      user_device ? user_device.trim() : '',
      rack_name.trim(),
      patch_panel.trim(),
      Number(patch_port),
      switch_name.trim(),
      switch_ip ? switch_ip.trim() : '',
      switch_port.trim(),
      Number(vlan_id) || 1,
      vlan_name ? vlan_name.trim() : '',
      status.trim(),
      device_type ? device_type.trim() : 'PC',
      notes ? notes.trim() : '',
      id
    );

    const updated = db.prepare('SELECT * FROM drops WHERE id = ?').get(id);
    res.json({ success: true, message: 'Drop updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete drop
exports.deleteDrop = (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM drops WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Drop not found' });
    }

    res.json({ success: true, message: 'Drop deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Visual Matrix / Rack Elevation data
exports.getRacksOverview = (req, res) => {
  try {
    const allDrops = db.prepare('SELECT * FROM drops ORDER BY rack_name, patch_panel, patch_port').all();

    // Group by Rack -> Patch Panels & Switches
    const racks = {};

    for (const drop of allDrops) {
      const rackKey = drop.rack_name || 'Unassigned Rack';
      if (!racks[rackKey]) {
        racks[rackKey] = {
          name: rackKey,
          patchPanels: {},
          switches: {}
        };
      }

      // Group Patch Panels
      const panelKey = drop.patch_panel || 'PP-1';
      if (!racks[rackKey].patchPanels[panelKey]) {
        racks[rackKey].patchPanels[panelKey] = {
          name: panelKey,
          totalPorts: 24, // default standard 24 ports, auto expands to 48 if max port > 24
          ports: {}
        };
      }
      if (drop.patch_port > racks[rackKey].patchPanels[panelKey].totalPorts) {
        racks[rackKey].patchPanels[panelKey].totalPorts = 48;
      }
      racks[rackKey].patchPanels[panelKey].ports[drop.patch_port] = drop;

      // Group Switches
      const switchKey = drop.switch_name || 'Switch-1';
      if (!racks[rackKey].switches[switchKey]) {
        racks[rackKey].switches[switchKey] = {
          name: switchKey,
          ip: drop.switch_ip,
          ports: {}
        };
      }
      // Store switch port mapping
      racks[rackKey].switches[switchKey].ports[drop.switch_port] = drop;
    }

    res.json({ success: true, data: racks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
