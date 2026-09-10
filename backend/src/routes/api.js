const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const os = require('os');

// Configure multer for temporary uploads
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

const dropsController = require('../controllers/dropsController');
const statsController = require('../controllers/statsController');
const excelController = require('../controllers/excelController');

// Drops routes
router.get('/drops', dropsController.getAllDrops);
router.get('/drops/:id', dropsController.getDropById);
router.post('/drops', dropsController.createDrop);
router.put('/drops/:id', dropsController.updateDrop);
router.delete('/drops/:id', dropsController.deleteDrop);
router.get('/racks', dropsController.getRacksOverview);

// Stats route
router.get('/stats', statsController.getStats);

// Excel routes
router.get('/export/template', excelController.downloadTemplate);
router.get('/export/excel', excelController.exportAllExcel);
router.post('/import/excel', upload.single('file'), excelController.importExcel);
router.post('/seed-sample', excelController.seedSampleData);
router.post('/reset-db', excelController.resetDatabase);

module.exports = router;
