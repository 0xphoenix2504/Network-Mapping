const db = require('./src/config/database');
const dropsController = require('./src/controllers/dropsController');
const statsController = require('./src/controllers/statsController');
const excelController = require('./src/controllers/excelController');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { Writable } = require('node:stream');

// Helper to mock express req/res
function createMockReqRes(params = {}, query = {}, body = {}, file = null) {
  let statusCode = 200;
  let responseData = null;
  let headers = {};
  const chunks = [];

  const req = { params, query, body, file };
  const res = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(Buffer.from(chunk));
      callback();
    }
  });

  res.status = function(code) {
    statusCode = code;
    return res;
  };
  res.setHeader = function(name, value) {
    headers[name] = value;
    return res;
  };
  res.json = function(data) {
    responseData = data;
    return res;
  };
  res.send = function(data) {
    responseData = data;
    return res;
  };

  return { req, res, getResult: () => ({ statusCode, responseData, headers, buffer: Buffer.concat(chunks) }) };
}

async function runAllTests() {
  console.log('\n=============================================================');
  console.log('🧪 STARTING AUTOMATED TEST SUITE FOR NETTRACE PLATFORM');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // TEST 1: Database Initialization
  console.log('\n[TEST GROUP 1] Database & Tables Check');
  try {
    const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='drops'").get();
    assert(tableInfo && tableInfo.name === 'drops', 'Drops table exists in SQLite database');

    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all();
    assert(indexes.length >= 5, `Database indexes initialized correctly (${indexes.length} indexes found)`);
  } catch (err) {
    assert(false, `Database check failed: ${err.message}`);
  }

  // TEST 2: Seed Sample Data
  console.log('\n[TEST GROUP 2] Sample Data Seeding');
  try {
    const { req, res, getResult } = createMockReqRes();
    excelController.seedSampleData(req, res);
    const result = getResult();
    assert(result.responseData && result.responseData.success === true, 'seedSampleData executed successfully');
    
    const count = db.prepare('SELECT COUNT(*) as count FROM drops').get().count;
    assert(count > 0, `Database has ${count} records after seeding`);
  } catch (err) {
    assert(false, `Seed test failed: ${err.message}`);
  }

  // TEST 3: Stats Controller
  console.log('\n[TEST GROUP 3] Stats & Analytics API');
  try {
    const { req, res, getResult } = createMockReqRes();
    statsController.getStats(req, res);
    const result = getResult();
    const data = result.responseData;
    
    assert(data && data.success === true, 'getStats returned success');
    assert(data.stats.totalDrops > 0, `Total drops reported: ${data.stats.totalDrops}`);
    assert(typeof data.stats.utilizationRate === 'number', `Utilization rate calculated: ${data.stats.utilizationRate}%`);
    assert(Array.isArray(data.filters.floors) && data.filters.floors.length > 0, 'Floors filter list populated');
    assert(Array.isArray(data.filters.racks) && data.filters.racks.length > 0, 'Racks filter list populated');
    assert(Array.isArray(data.vlanSummary), 'VLAN distribution summary generated');
    assert(Array.isArray(data.switchCapacity), 'Switch capacity summary generated');
  } catch (err) {
    assert(false, `Stats test failed: ${err.message}`);
  }

  // TEST 4: Drops CRUD Operations
  console.log('\n[TEST GROUP 4] Drops CRUD API');
  let createdDropId = null;
  try {
    // 4.1 GetAll with search
    const { req: req1, res: res1, getResult: getRes1 } = createMockReqRes({}, { limit: 10 });
    dropsController.getAllDrops(req1, res1);
    const resDrops = getRes1().responseData;
    assert(resDrops && resDrops.success === true && Array.isArray(resDrops.data), 'getAllDrops returns array of drops');

    // 4.2 Create Drop
    const newDropData = {
      drop_id: `TEST-DP-${Date.now().toString().slice(-4)}`,
      building: 'HQ Main',
      floor: 'Floor 1',
      room_office: 'Room 101-A',
      user_device: 'Ahmed Test PC',
      rack_name: 'Rack-01',
      patch_panel: 'PP-A',
      patch_port: 24,
      switch_name: 'SW-Core-01',
      switch_ip: '192.168.10.1',
      switch_port: 'Gi1/0/24',
      vlan_id: 10,
      vlan_name: 'Management',
      status: 'Active',
      device_type: 'PC',
      notes: 'Automated test record'
    };

    const { req: req2, res: res2, getResult: getRes2 } = createMockReqRes({}, {}, newDropData);
    dropsController.createDrop(req2, res2);
    const createRes = getRes2().responseData;
    assert(createRes && createRes.success === true, `createDrop created: ${newDropData.drop_id}`);
    createdDropId = createRes.data?.id;

    // 4.3 Get Drop By ID
    if (createdDropId) {
      const { req: req3, res: res3, getResult: getRes3 } = createMockReqRes({ id: createdDropId });
      dropsController.getDropById(req3, res3);
      const getSingleRes = getRes3().responseData;
      assert(getSingleRes && getSingleRes.data && getSingleRes.data.drop_id === newDropData.drop_id, 'getDropById fetched correct drop');

      // 4.4 Update Drop
      const updateData = { ...newDropData, status: 'Reserved', notes: 'Updated notes via test' };
      const { req: req4, res: res4, getResult: getRes4 } = createMockReqRes({ id: createdDropId }, {}, updateData);
      dropsController.updateDrop(req4, res4);
      const updateRes = getRes4().responseData;
      assert(updateRes && updateRes.success === true && updateRes.data.status === 'Reserved', 'updateDrop updated status to Reserved');

      // 4.5 Delete Drop
      const { req: req5, res: res5, getResult: getRes5 } = createMockReqRes({ id: createdDropId });
      dropsController.deleteDrop(req5, res5);
      const deleteRes = getRes5().responseData;
      assert(deleteRes && deleteRes.success === true, 'deleteDrop deleted test drop');
    }
  } catch (err) {
    assert(false, `Drops CRUD test failed: ${err.message}`);
  }

  // TEST 5: Racks Overview & Matrix
  console.log('\n[TEST GROUP 5] Racks & Port Matrix Overview');
  try {
    const { req, res, getResult } = createMockReqRes();
    dropsController.getRacksOverview(req, res);
    const racksRes = getResult().responseData;
    assert(racksRes && racksRes.success === true && typeof racksRes.data === 'object', 'getRacksOverview returns racks hierarchy');
    const rackKeys = Object.keys(racksRes.data);
    assert(rackKeys.length > 0, `Racks found in matrix: ${rackKeys.join(', ')}`);
  } catch (err) {
    assert(false, `Racks overview test failed: ${err.message}`);
  }

  // TEST 6: Excel Template & Export
  console.log('\n[TEST GROUP 6] Excel Generator & Export');
  try {
    // 6.1 Template Export
    const { req: reqT, res: resT, getResult: getResT } = createMockReqRes();
    await excelController.downloadTemplate(reqT, resT);
    const resTemplate = getResT();
    assert(resTemplate.headers['Content-Disposition'] && resTemplate.headers['Content-Disposition'].includes('.xlsx'), 'downloadTemplate generates valid Excel headers');

    // 6.2 Full Export
    const { req: reqE, res: resE, getResult: getResE } = createMockReqRes();
    await excelController.exportAllExcel(reqE, resE);
    const resExport = getResE();
    assert(resExport.headers['Content-Disposition'] && resExport.headers['Content-Disposition'].includes('.xlsx'), 'exportAllExcel generates valid full Excel export');
  } catch (err) {
    assert(false, `Excel export test failed: ${err.message}`);
  }

  // TEST 7: Excel Import Simulation
  console.log('\n[TEST GROUP 7] Excel Import & Upsert Workflow');
  try {
    // Create temporary Excel workbook
    const testWorkbook = new ExcelJS.Workbook();
    const sheet = testWorkbook.addWorksheet('Network Drops');
    sheet.columns = [
      { header: 'Drop_ID', key: 'drop_id' },
      { header: 'Building', key: 'building' },
      { header: 'Floor', key: 'floor' },
      { header: 'Room_Office', key: 'room_office' },
      { header: 'User_Device', key: 'user_device' },
      { header: 'Rack_Name', key: 'rack_name' },
      { header: 'Patch_Panel', key: 'patch_panel' },
      { header: 'Patch_Port', key: 'patch_port' },
      { header: 'Switch_Name', key: 'switch_name' },
      { header: 'Switch_IP', key: 'switch_ip' },
      { header: 'Switch_Port', key: 'switch_port' },
      { header: 'VLAN_ID', key: 'vlan_id' },
      { header: 'VLAN_Name', key: 'vlan_name' },
      { header: 'Status', key: 'status' },
      { header: 'Device_Type', key: 'device_type' },
      { header: 'Notes', key: 'notes' }
    ];

    const testImportDropId = `IMP-TEST-${Date.now().toString().slice(-4)}`;
    sheet.addRow({
      drop_id: testImportDropId,
      building: 'HQ',
      floor: 'Floor 2',
      room_office: 'Meeting Room B',
      user_device: 'Conference Cam',
      rack_name: 'Rack-02',
      patch_panel: 'PP-B',
      patch_port: 10,
      switch_name: 'SW-Access-01',
      switch_ip: '192.168.20.1',
      switch_port: 'Gi1/0/10',
      vlan_id: 30,
      vlan_name: 'CCTV_Voice',
      status: 'Active',
      device_type: 'CCTV',
      notes: 'Imported via test suite'
    });

    const tempFilePath = path.join(os.tmpdir(), `test_import_${Date.now()}.xlsx`);
    await testWorkbook.xlsx.writeFile(tempFilePath);

    const { req: reqI, res: resI, getResult: getResI } = createMockReqRes({}, {}, {}, { path: tempFilePath, originalname: 'test_import.xlsx' });
    await excelController.importExcel(reqI, resI);
    const importRes = getResI().responseData;

    assert(importRes && importRes.success === true, 'importExcel processed uploaded workbook');
    assert(typeof importRes.importedCount === 'number' && importRes.importedCount >= 1, `Imported count: ${importRes.importedCount} drops`);

    // Clean up
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    db.prepare('DELETE FROM drops WHERE drop_id = ?').run(testImportDropId);
  } catch (err) {
    assert(false, `Excel import test failed: ${err.message}`);
  }

  console.log('\n=============================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests();
