const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://qa_user:qa_password@localhost:5434/qa_dashboard',
  playwrightRoot: path.resolve(__dirname, '../../'),
  artifactsDir: path.resolve(__dirname, '../../test-results/artifacts'),
  runsStorageDir: path.resolve(__dirname, '../../test-results/runs-storage'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
