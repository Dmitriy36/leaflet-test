const sql = require('mssql');

// RDS SQL Server Configuration
const config = {
  user: 'admin',           // Replace with your RDS master username
  password: 'LkA554C',       // Replace with your RDS master password
  server: 'integrated-apar-apat.c1vwa9fou9fe.us-east-2.rds.amazonaws.com', // Replace with your RDS endpoint
  database: 'your_database_name',  // Replace with your database name
  port: 1433,                      // Default SQL Server port
  options: {
    encrypt: true,                 // Use encryption (required for RDS)
    trustServerCertificate: true,  // Trust self-signed certificates
    enableArithAbort: true,
    connectionTimeout: 30000,      // 30 seconds
    requestTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

async function testConnection() {
  console.log('Attempting to connect to RDS SQL Server...');
  console.log(`Server: ${config.server}:${config.port}`);
  console.log(`Database: ${config.database}`);
  console.log(`User: ${config.user}`);
  console.log('---');

  let pool;
 
  try {
    // Create connection pool
    pool = await sql.connect(config);
    console.log('✓ Successfully connected to RDS SQL Server!');
   
    // Test query
    const result = await pool.request().query('SELECT @@VERSION AS version');
    console.log('\n✓ Test query executed successfully!');
    console.log('SQL Server Version:', result.recordset[0].version);
   
    // Additional test - list databases
    const dbResult = await pool.request().query('SELECT name FROM sys.databases');
    console.log('\n✓ Available databases:');
    dbResult.recordset.forEach(db => console.log(`  - ${db.name}`));
   
    return true;
  } catch (err) {
    console.error('\n✗ Connection Error:');
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
   
    if (err.code === 'ESOCKET') {
      console.error('\nTroubleshooting: Network/Socket error');
      console.error('- Verify security group allows inbound traffic on port 1433');
      console.error('- Check if RDS instance is in the same VPC or publicly accessible');
      console.error('- Verify endpoint hostname is correct');
    } else if (err.code === 'ELOGIN') {
      console.error('\nTroubleshooting: Login failed');
      console.error('- Verify username and password are correct');
      console.error('- Check if user has proper permissions');
    } else if (err.code === 'ETIMEOUT') {
      console.error('\nTroubleshooting: Connection timeout');
      console.error('- Security groups might be blocking the connection');
      console.error('- RDS might not be publicly accessible');
    }
   
    console.error('\nFull error details:', err);
    return false;
  } finally {
    // Close the connection pool
    if (pool) {
      await pool.close();
      console.log('\n✓ Connection closed');
    }
  }
}

// Express.js example (optional - for web server)
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/test-db', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT @@VERSION AS version');
    await pool.close();
   
    res.json({
      success: true,
      message: 'Database connection successful',
      version: result.recordset[0].version
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Run the connection test
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Everything is working! Starting Express server...');
    app.listen(PORT, () => {
      console.log(`\nServer running on http://localhost:${PORT}`);
      console.log(`Test database endpoint: http://localhost:${PORT}/test-db`);
      console.log(`Health check endpoint: http://localhost:${PORT}/health`);
    });
  } else {
    console.log('\n⚠ Fix the connection issues above before starting the server');
    process.exit(1);
  }
});

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});