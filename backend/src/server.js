const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    engine: 'Node.js SQLite WAL',
    version: '1.0.0'
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// Automatically seed sample data if database is empty on first startup
try {
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM drops').get().count;
  if (rowCount === 0) {
    console.log('⚡ Empty database detected. Auto-seeding initial network mapping demo data...');
    const excelController = require('./controllers/excelController');
    excelController.seedSampleData({ body: {} }, { json: () => {}, status: () => ({ json: () => {} }) });
    console.log('✅ Initial demo data seeded successfully.');
  }
} catch (err) {
  console.error('Initial check warning:', err.message);
}

// Serve Frontend build static files in production if available
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.json({ message: 'Network Mapping API Backend is running. Frontend dev server is at http://localhost:5173' });
    }
  });
});

// Start standalone server if not running as serverless function
if (require.main === module || (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME)) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Network Mapping Platform Backend is active!`);
    console.log(`🌐 Local API URL: http://localhost:${PORT}`);
    console.log(`📡 Network Drops API: http://localhost:${PORT}/api/drops`);
    console.log(`====================================================`);
  });
}

module.exports = app;
