const ExcelJS = require('exceljs');
const db = require('../config/database');
const fs = require('fs');

// Standard Column Definition Mapping (Both English and Arabic supported)
const COLUMN_MAPPINGS = {
  drop_id: ['drop_id', 'رقم النقطة', 'drop id', 'dropid', 'point_id', 'jack_id'],
  building: ['building', 'المبنى', 'building_name'],
  floor: ['floor', 'الدور', 'floor_no', 'floor_name'],
  room_office: ['room_office', 'الغرفة / المكتب', 'الغرفة', 'المكتب', 'room', 'office', 'room_name', 'department'],
  user_device: ['user_device', 'المستخدم / الجهاز', 'المستخدم', 'الجهاز', 'user', 'employee', 'device_name'],
  rack_name: ['rack_name', 'اسم الراك', 'الراك', 'rack', 'rack_id'],
  patch_panel: ['patch_panel', 'الباتش بانل', 'panel', 'pp', 'patch panel'],
  patch_port: ['patch_port', 'بورت الباتش بانل', 'patch port', 'pp_port', 'panel_port'],
  switch_name: ['switch_name', 'اسم السويتش', 'السويتش', 'switch', 'switch_id'],
  switch_ip: ['switch_ip', 'آي بي السويتش', 'switch ip', 'ip', 'ip_address'],
  switch_port: ['switch_port', 'بورت السويتش', 'switch port', 'port', 'interface', 'sw_port'],
  vlan_id: ['vlan_id', 'رقم الفيلان', 'vlan', 'vlan id', 'vlan_no'],
  vlan_name: ['vlan_name', 'اسم الفيلان', 'vlan name', 'vlan_desc'],
  status: ['status', 'حالة النقطة', 'الحالة', 'state'],
  device_type: ['device_type', 'نوع الجهاز', 'device type', 'type'],
  notes: ['notes', 'ملاحظات', 'الملاحظات', 'comment', 'description']
};

function normalizeHeader(header) {
  if (!header) return '';
  const clean = String(header).trim().toLowerCase();
  for (const [key, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => clean === alias.toLowerCase())) {
      return key;
    }
  }
  return clean;
}

// 1. Download official Excel Template
exports.downloadTemplate = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Network Mapping Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Network Drops Template', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
      { header: 'Drop_ID', key: 'drop_id', width: 18 },
      { header: 'Building', key: 'building', width: 15 },
      { header: 'Floor', key: 'floor', width: 14 },
      { header: 'Room_Office', key: 'room_office', width: 22 },
      { header: 'User_Device', key: 'user_device', width: 22 },
      { header: 'Rack_Name', key: 'rack_name', width: 15 },
      { header: 'Patch_Panel', key: 'patch_panel', width: 16 },
      { header: 'Patch_Port', key: 'patch_port', width: 14 },
      { header: 'Switch_Name', key: 'switch_name', width: 18 },
      { header: 'Switch_IP', key: 'switch_ip', width: 18 },
      { header: 'Switch_Port', key: 'switch_port', width: 16 },
      { header: 'VLAN_ID', key: 'vlan_id', width: 12 },
      { header: 'VLAN_Name', key: 'vlan_name', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Device_Type', key: 'device_type', width: 16 },
      { header: 'Notes', key: 'notes', width: 25 }
    ];

    // Style Header Row
    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Segoe UI' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FF0284C7' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // Sample Example Rows
    const sampleData = [
      {
        drop_id: 'FL01-R101-D1',
        building: 'Main HQ',
        floor: 'Floor 1',
        room_office: 'HR Department - Desk 01',
        user_device: 'Ahmed Yasser (PC)',
        rack_name: 'Rack-01',
        patch_panel: 'PP-A',
        patch_port: 1,
        switch_name: 'SW-Core-01',
        switch_ip: '192.168.10.2',
        switch_port: 'Gi1/0/1',
        vlan_id: 10,
        vlan_name: 'Data_Users',
        status: 'Active',
        device_type: 'PC',
        notes: 'Yellow Cat6 Patch Cord'
      },
      {
        drop_id: 'FL01-R101-D2',
        building: 'Main HQ',
        floor: 'Floor 1',
        room_office: 'HR Department - Desk 01',
        user_device: 'Ahmed Yasser (IP Phone)',
        rack_name: 'Rack-01',
        patch_panel: 'PP-A',
        patch_port: 2,
        switch_name: 'SW-Core-01',
        switch_ip: '192.168.10.2',
        switch_port: 'Gi1/0/2',
        vlan_id: 20,
        vlan_name: 'Voice_VoIP',
        status: 'Active',
        device_type: 'IP Phone',
        notes: 'PoE Enabled'
      },
      {
        drop_id: 'FL01-R102-D1',
        building: 'Main HQ',
        floor: 'Floor 1',
        room_office: 'Finance Office - Desk 02',
        user_device: 'Mariam Ali (Laptop)',
        rack_name: 'Rack-01',
        patch_panel: 'PP-A',
        patch_port: 3,
        switch_name: 'SW-Core-01',
        switch_ip: '192.168.10.2',
        switch_port: 'Gi1/0/3',
        vlan_id: 10,
        vlan_name: 'Data_Users',
        status: 'Active',
        device_type: 'PC',
        notes: ''
      },
      {
        drop_id: 'FL01-R105-PR',
        building: 'Main HQ',
        floor: 'Floor 1',
        room_office: 'Printing Station',
        user_device: 'HP LaserJet Managed',
        rack_name: 'Rack-01',
        patch_panel: 'PP-A',
        patch_port: 4,
        switch_name: 'SW-Core-01',
        switch_ip: '192.168.10.2',
        switch_port: 'Gi1/0/4',
        vlan_id: 30,
        vlan_name: 'Printers',
        status: 'Active',
        device_type: 'Printer',
        notes: 'Static IP 192.168.30.15'
      },
      {
        drop_id: 'FL02-R201-D1',
        building: 'Main HQ',
        floor: 'Floor 2',
        room_office: 'Meeting Room Alpha',
        user_device: 'Cisco Webex Kit',
        rack_name: 'Rack-02',
        patch_panel: 'PP-B',
        patch_port: 1,
        switch_name: 'SW-Floor2-01',
        switch_ip: '192.168.10.3',
        switch_port: 'Gi1/0/1',
        vlan_id: 40,
        vlan_name: 'VideoConf',
        status: 'Active',
        device_type: 'Other',
        notes: 'Wall mount jack'
      },
      {
        drop_id: 'FL02-R202-SPARE',
        building: 'Main HQ',
        floor: 'Floor 2',
        room_office: 'IT Storage Room',
        user_device: 'Spare Drop',
        rack_name: 'Rack-02',
        patch_panel: 'PP-B',
        patch_port: 2,
        switch_name: 'SW-Floor2-01',
        switch_ip: '192.168.10.3',
        switch_port: 'Gi1/0/2',
        vlan_id: 1,
        vlan_name: 'Default',
        status: 'Free',
        device_type: 'PC',
        notes: 'Ready for allocation'
      }
    ];

    sampleData.forEach((item) => {
      const row = sheet.addRow(item);
      row.height = 24;
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.font = { name: 'Segoe UI', size: 10 };
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Network_Drops_Template.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Export All Database Drops to Excel
exports.exportAllExcel = async (req, res) => {
  try {
    const drops = db.prepare('SELECT * FROM drops ORDER BY rack_name, patch_panel, patch_port').all();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Network Mapping Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Network Drops', {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    sheet.columns = [
      { header: 'Drop_ID', key: 'drop_id', width: 18 },
      { header: 'Building', key: 'building', width: 15 },
      { header: 'Floor', key: 'floor', width: 14 },
      { header: 'Room_Office', key: 'room_office', width: 24 },
      { header: 'User_Device', key: 'user_device', width: 22 },
      { header: 'Rack_Name', key: 'rack_name', width: 15 },
      { header: 'Patch_Panel', key: 'patch_panel', width: 16 },
      { header: 'Patch_Port', key: 'patch_port', width: 14 },
      { header: 'Switch_Name', key: 'switch_name', width: 18 },
      { header: 'Switch_IP', key: 'switch_ip', width: 18 },
      { header: 'Switch_Port', key: 'switch_port', width: 16 },
      { header: 'VLAN_ID', key: 'vlan_id', width: 12 },
      { header: 'VLAN_Name', key: 'vlan_name', width: 18 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Device_Type', key: 'device_type', width: 16 },
      { header: 'Notes', key: 'notes', width: 25 },
      { header: 'Updated_At', key: 'updated_at', width: 20 }
    ];

    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10, name: 'Segoe UI' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    drops.forEach(drop => {
      const row = sheet.addRow(drop);
      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        if (colNumber === 14) {
          if (drop.status === 'Active') {
            cell.font = { color: { argb: 'FF16A34A' }, bold: true };
          } else if (drop.status === 'Free') {
            cell.font = { color: { argb: 'FF64748B' }, bold: true };
          } else if (drop.status === 'Reserved') {
            cell.font = { color: { argb: 'FFD97706' }, bold: true };
          } else if (drop.status === 'Damaged') {
            cell.font = { color: { argb: 'FFDC2626' }, bold: true };
          }
        }
      });
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Network_Drops_Export_${timestamp}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting drops:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Import Excel / CSV File with Smart Column Mapping & Upsert
exports.importExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel or CSV file.' });
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0];
    if (!sheet) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'The uploaded file does not contain any sheets.' });
    }

    // Read header row (Row 1)
    const headers = {};
    const headerRow = sheet.getRow(1);
    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const normalizedKey = normalizeHeader(cell.value);
      headers[colNumber] = normalizedKey;
    });

    const headerValues = Object.values(headers);
    const requiredKeys = ['drop_id', 'floor', 'room_office', 'rack_name', 'patch_panel', 'patch_port', 'switch_name', 'switch_port'];
    const missingKeys = requiredKeys.filter(key => !headerValues.includes(key));

    if (missingKeys.length > 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Missing required columns in Excel: ${missingKeys.join(', ')}. Please use the provided template.`
      });
    }

    const upsertStmt = db.prepare(`
      INSERT INTO drops (
        drop_id, building, floor, room_office, user_device,
        rack_name, patch_panel, patch_port, switch_name, switch_ip,
        switch_port, vlan_id, vlan_name, status, device_type, notes,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(drop_id) DO UPDATE SET
        building = excluded.building,
        floor = excluded.floor,
        room_office = excluded.room_office,
        user_device = excluded.user_device,
        rack_name = excluded.rack_name,
        patch_panel = excluded.patch_panel,
        patch_port = excluded.patch_port,
        switch_name = excluded.switch_name,
        switch_ip = excluded.switch_ip,
        switch_port = excluded.switch_port,
        vlan_id = excluded.vlan_id,
        vlan_name = excluded.vlan_name,
        status = excluded.status,
        device_type = excluded.device_type,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `);

    const rowsToInsert = [];

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowObj = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const key = headers[colNumber];
        if (key) {
          rowObj[key] = cell.value !== null && cell.value !== undefined ? String(cell.value).trim() : '';
        }
      });

      if (!rowObj.drop_id) return; // skip empty rows

      const drop_id = String(rowObj.drop_id).trim();
      const building = rowObj.building ? String(rowObj.building).trim() : '';
      const floor = rowObj.floor ? String(rowObj.floor).trim() : 'Floor 1';
      const room_office = rowObj.room_office ? String(rowObj.room_office).trim() : 'General';
      const user_device = rowObj.user_device ? String(rowObj.user_device).trim() : '';
      const rack_name = rowObj.rack_name ? String(rowObj.rack_name).trim() : 'Rack-01';
      const patch_panel = rowObj.patch_panel ? String(rowObj.patch_panel).trim() : 'PP-A';
      const patch_port = parseInt(rowObj.patch_port, 10) || 1;
      const switch_name = rowObj.switch_name ? String(rowObj.switch_name).trim() : 'SW-01';
      const switch_ip = rowObj.switch_ip ? String(rowObj.switch_ip).trim() : '';
      const switch_port = rowObj.switch_port ? String(rowObj.switch_port).trim() : 'Gi1/0/1';
      const vlan_id = parseInt(rowObj.vlan_id, 10) || 1;
      const vlan_name = rowObj.vlan_name ? String(rowObj.vlan_name).trim() : '';
      
      let status = rowObj.status ? String(rowObj.status).trim() : 'Active';
      const validStatuses = ['Active', 'Free', 'Reserved', 'Damaged'];
      const matchedStatus = validStatuses.find(s => s.toLowerCase() === status.toLowerCase());
      status = matchedStatus || 'Active';

      let device_type = rowObj.device_type ? String(rowObj.device_type).trim() : 'PC';
      const notes = rowObj.notes ? String(rowObj.notes).trim() : '';

      rowsToInsert.push({
        drop_id,
        building,
        floor,
        room_office,
        user_device,
        rack_name,
        patch_panel,
        patch_port,
        switch_name,
        switch_ip,
        switch_port,
        vlan_id,
        vlan_name,
        status,
        device_type,
        notes
      });
    });

    let importedCount = 0;
    if (rowsToInsert.length > 0) {
      db.exec('BEGIN TRANSACTION;');
      try {
        for (const rowData of rowsToInsert) {
          upsertStmt.run(
            rowData.drop_id,
            rowData.building,
            rowData.floor,
            rowData.room_office,
            rowData.user_device,
            rowData.rack_name,
            rowData.patch_panel,
            rowData.patch_port,
            rowData.switch_name,
            rowData.switch_ip,
            rowData.switch_port,
            rowData.vlan_id,
            rowData.vlan_name,
            rowData.status,
            rowData.device_type,
            rowData.notes
          );
        }
        db.exec('COMMIT;');
        importedCount = rowsToInsert.length;
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: `Successfully imported / synchronized ${importedCount} network drops.`,
      importedCount
    });
  } catch (error) {
    console.error('Error in importExcel:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// 4. Seed Sample Demonstration Data
exports.seedSampleData = (req, res) => {
  try {
    const sampleRows = [
      { drop_id: 'FL01-R101-D1', building: 'HQ Building', floor: 'Floor 1', room_office: 'HR Office - Desk 01', user_device: 'Ahmed Yasser (Workstation)', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 1, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/1', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: 'Cat6 Blue 1.5m' },
      { drop_id: 'FL01-R101-D2', building: 'HQ Building', floor: 'Floor 1', room_office: 'HR Office - Desk 01', user_device: 'Ahmed Yasser (IP Phone)', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 2, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/2', vlan_id: 20, vlan_name: 'Voice_VoIP', status: 'Active', device_type: 'IP Phone', notes: 'PoE+ class 3' },
      { drop_id: 'FL01-R102-D1', building: 'HQ Building', floor: 'Floor 1', room_office: 'HR Office - Desk 02', user_device: 'Mariam Khaled', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 3, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/3', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL01-R102-D2', building: 'HQ Building', floor: 'Floor 1', room_office: 'HR Office - Desk 02', user_device: 'Mariam Khaled (VoIP)', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 4, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/4', vlan_id: 20, vlan_name: 'Voice_VoIP', status: 'Active', device_type: 'IP Phone', notes: '' },
      { drop_id: 'FL01-R103-PR', building: 'HQ Building', floor: 'Floor 1', room_office: 'Finance - Corridor', user_device: 'Canon ImageRunner Print', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 5, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/5', vlan_id: 30, vlan_name: 'Printers', status: 'Active', device_type: 'Printer', notes: 'Static IP 192.168.30.12' },
      { drop_id: 'FL01-R104-D1', building: 'HQ Building', floor: 'Floor 1', room_office: 'Finance Office - Desk 01', user_device: 'Tamer Hassan (PC)', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 6, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/6', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL01-R104-D2', building: 'HQ Building', floor: 'Floor 1', room_office: 'Finance Office - Desk 02', user_device: 'Mohamed Sayed (PC)', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 7, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/7', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL01-R105-AP', building: 'HQ Building', floor: 'Floor 1', room_office: 'Main Reception Area', user_device: 'Aruba AP-515 Ceiling', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 8, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/8', vlan_id: 50, vlan_name: 'Wireless_AP', status: 'Active', device_type: 'Access Point', notes: 'Trunk port / PoE+' },
      { drop_id: 'FL01-R106-CAM', building: 'HQ Building', floor: 'Floor 1', room_office: 'Main Entrance Gate', user_device: 'Hikvision Dome Cam 4K', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 9, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/9', vlan_id: 60, vlan_name: 'CCTV_Security', status: 'Active', device_type: 'CCTV', notes: 'NVR recording 24/7' },
      { drop_id: 'FL01-R107-D1', building: 'HQ Building', floor: 'Floor 1', room_office: 'IT Support Desk', user_device: 'Helpdesk Tech 1', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 10, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/10', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL01-R107-D2', building: 'HQ Building', floor: 'Floor 1', room_office: 'IT Support Desk', user_device: 'Helpdesk Tech 2', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 11, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/11', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL01-R108-D1', building: 'HQ Building', floor: 'Floor 1', room_office: 'Legal Office', user_device: 'Vacant Desk', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 12, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/12', vlan_id: 10, vlan_name: 'Data_Users', status: 'Free', device_type: 'PC', notes: 'Available port' },
      { drop_id: 'FL01-R108-D2', building: 'HQ Building', floor: 'Floor 1', room_office: 'Legal Office', user_device: 'Reserved for New Lawyer', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 13, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/13', vlan_id: 10, vlan_name: 'Data_Users', status: 'Reserved', device_type: 'PC', notes: 'Hold until next week' },
      { drop_id: 'FL01-R109-D1', building: 'HQ Building', floor: 'Floor 1', room_office: 'Warehouse Entrance', user_device: 'Damaged Keyston Jack', rack_name: 'Rack-01', patch_panel: 'PP-A', patch_port: 14, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/14', vlan_id: 1, vlan_name: 'Default', status: 'Damaged', device_type: 'Other', notes: 'Cable cut inside conduit, needs repull' },

      { drop_id: 'FL02-R201-D1', building: 'HQ Building', floor: 'Floor 2', room_office: 'Software Dev Lab - Desk 1', user_device: 'Senior Fullstack Dev', rack_name: 'Rack-01', patch_panel: 'PP-B', patch_port: 1, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/15', vlan_id: 15, vlan_name: 'Dev_Network', status: 'Active', device_type: 'PC', notes: '1Gbps full duplex' },
      { drop_id: 'FL02-R201-D2', building: 'HQ Building', floor: 'Floor 2', room_office: 'Software Dev Lab - Desk 2', user_device: 'Backend Engineer', rack_name: 'Rack-01', patch_panel: 'PP-B', patch_port: 2, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/16', vlan_id: 15, vlan_name: 'Dev_Network', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL02-R202-SRV', building: 'HQ Building', floor: 'Floor 2', room_office: 'Server Staging Bench', user_device: 'Dell PowerEdge R640 Test', rack_name: 'Rack-01', patch_panel: 'PP-B', patch_port: 3, switch_name: 'SW-Core-01', switch_ip: '192.168.10.2', switch_port: 'Gi1/0/17', vlan_id: 100, vlan_name: 'Server_Mgmt', status: 'Active', device_type: 'Server', notes: 'iDRAC Dedicated' },

      { drop_id: 'FL02-R203-D1', building: 'HQ Building', floor: 'Floor 2', room_office: 'Executive Boardroom', user_device: 'Cisco Webex Room Bar', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 1, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/1', vlan_id: 40, vlan_name: 'VideoConf', status: 'Active', device_type: 'Other', notes: 'Table pop-up box' },
      { drop_id: 'FL02-R203-D2', building: 'HQ Building', floor: 'Floor 2', room_office: 'Executive Boardroom', user_device: 'Display TV Smart', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 2, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/2', vlan_id: 40, vlan_name: 'VideoConf', status: 'Active', device_type: 'Other', notes: 'Wall mounted 85 inch' },
      { drop_id: 'FL02-R204-D1', building: 'HQ Building', floor: 'Floor 2', room_office: 'CEO Office - Main Desk', user_device: 'Executive iMac 27', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 3, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/3', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: 'High priority VIP' },
      { drop_id: 'FL02-R204-D2', building: 'HQ Building', floor: 'Floor 2', room_office: 'CEO Office - Phone', user_device: 'Cisco 8845 Video Phone', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 4, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/4', vlan_id: 20, vlan_name: 'Voice_VoIP', status: 'Active', device_type: 'IP Phone', notes: 'PoE powered' },
      { drop_id: 'FL02-R205-AP', building: 'HQ Building', floor: 'Floor 2', room_office: 'Floor 2 Hallway', user_device: 'Aruba AP-515 Ceiling 02', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 5, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/5', vlan_id: 50, vlan_name: 'Wireless_AP', status: 'Active', device_type: 'Access Point', notes: 'PoE+ class 4' },
      { drop_id: 'FL02-R206-CAM', building: 'HQ Building', floor: 'Floor 2', room_office: 'Emergency Staircase 2', user_device: 'Hikvision IP Cam', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 6, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/6', vlan_id: 60, vlan_name: 'CCTV_Security', status: 'Active', device_type: 'CCTV', notes: '' },
      { drop_id: 'FL02-R207-D1', building: 'HQ Building', floor: 'Floor 2', room_office: 'Operations Center - Desk 1', user_device: 'NOC Operator 1', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 7, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/7', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL02-R207-D2', building: 'HQ Building', floor: 'Floor 2', room_office: 'Operations Center - Desk 2', user_device: 'NOC Operator 2', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 8, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/8', vlan_id: 10, vlan_name: 'Data_Users', status: 'Active', device_type: 'PC', notes: '' },
      { drop_id: 'FL02-R208-SP1', building: 'HQ Building', floor: 'Floor 2', room_office: 'Expansion Area 2A', user_device: 'Spare Drop', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 9, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/9', vlan_id: 1, vlan_name: 'Default', status: 'Free', device_type: 'PC', notes: 'Unused drop' },
      { drop_id: 'FL02-R208-SP2', building: 'HQ Building', floor: 'Floor 2', room_office: 'Expansion Area 2B', user_device: 'Spare Drop', rack_name: 'Rack-02', patch_panel: 'PP-C', patch_port: 10, switch_name: 'SW-Floor2-01', switch_ip: '192.168.10.3', switch_port: '1/10', vlan_id: 1, vlan_name: 'Default', status: 'Free', device_type: 'PC', notes: 'Unused drop' }
    ];

    const stmt = db.prepare(`
      INSERT INTO drops (
        drop_id, building, floor, room_office, user_device,
        rack_name, patch_panel, patch_port, switch_name, switch_ip,
        switch_port, vlan_id, vlan_name, status, device_type, notes,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(drop_id) DO UPDATE SET
        building = excluded.building,
        floor = excluded.floor,
        room_office = excluded.room_office,
        user_device = excluded.user_device,
        rack_name = excluded.rack_name,
        patch_panel = excluded.patch_panel,
        patch_port = excluded.patch_port,
        switch_name = excluded.switch_name,
        switch_ip = excluded.switch_ip,
        switch_port = excluded.switch_port,
        vlan_id = excluded.vlan_id,
        vlan_name = excluded.vlan_name,
        status = excluded.status,
        device_type = excluded.device_type,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `);

    db.exec('BEGIN TRANSACTION;');
    try {
      for (const r of sampleRows) {
        stmt.run(
          r.drop_id, r.building, r.floor, r.room_office, r.user_device,
          r.rack_name, r.patch_panel, r.patch_port, r.switch_name, r.switch_ip,
          r.switch_port, r.vlan_id, r.vlan_name, r.status, r.device_type, r.notes
        );
      }
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }

    res.json({
      success: true,
      message: `Successfully seeded ${sampleRows.length} realistic network drops.`,
      count: sampleRows.length
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Reset / Clear Database
exports.resetDatabase = (req, res) => {
  try {
    db.exec('DELETE FROM drops;');
    res.json({ success: true, message: 'All database drops have been cleared.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
