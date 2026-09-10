const db = require('../config/database');

exports.getStats = (req, res) => {
  try {
    const totalDrops = db.prepare('SELECT COUNT(*) as count FROM drops').get().count;

    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM drops 
      GROUP BY status
    `).all();

    const statuses = {
      Active: 0,
      Free: 0,
      Reserved: 0,
      Damaged: 0
    };
    statusCounts.forEach(row => {
      if (row.status) statuses[row.status] = row.count;
    });

    const uniqueRacks = db.prepare('SELECT DISTINCT rack_name FROM drops WHERE rack_name IS NOT NULL AND rack_name != "" ORDER BY rack_name').all().map(r => r.rack_name);
    const uniqueSwitches = db.prepare('SELECT DISTINCT switch_name FROM drops WHERE switch_name IS NOT NULL AND switch_name != "" ORDER BY switch_name').all().map(s => s.switch_name);
    const uniqueFloors = db.prepare('SELECT DISTINCT floor FROM drops WHERE floor IS NOT NULL AND floor != "" ORDER BY floor').all().map(f => f.floor);
    const uniqueBuildings = db.prepare('SELECT DISTINCT building FROM drops WHERE building IS NOT NULL AND building != "" ORDER BY building').all().map(b => b.building);
    
    const vlanSummary = db.prepare(`
      SELECT vlan_id, vlan_name, COUNT(*) as count 
      FROM drops 
      WHERE vlan_id IS NOT NULL 
      GROUP BY vlan_id, vlan_name
      ORDER BY count DESC
    `).all();

    const deviceSummary = db.prepare(`
      SELECT device_type, COUNT(*) as count 
      FROM drops 
      WHERE device_type IS NOT NULL AND device_type != ""
      GROUP BY device_type
      ORDER BY count DESC
    `).all();

    const switchCapacity = db.prepare(`
      SELECT switch_name, switch_ip, COUNT(*) as mapped_ports,
             SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_ports
      FROM drops
      WHERE switch_name IS NOT NULL AND switch_name != ""
      GROUP BY switch_name, switch_ip
      ORDER BY mapped_ports DESC
    `).all();

    res.json({
      success: true,
      stats: {
        totalDrops,
        active: statuses.Active || 0,
        free: statuses.Free || 0,
        reserved: statuses.Reserved || 0,
        damaged: statuses.Damaged || 0,
        racksCount: uniqueRacks.length,
        switchesCount: uniqueSwitches.length,
        utilizationRate: totalDrops > 0 ? Math.round(((statuses.Active || 0) / totalDrops) * 100) : 0
      },
      filters: {
        buildings: uniqueBuildings,
        floors: uniqueFloors,
        racks: uniqueRacks,
        switches: uniqueSwitches
      },
      vlanSummary,
      deviceSummary,
      switchCapacity
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
