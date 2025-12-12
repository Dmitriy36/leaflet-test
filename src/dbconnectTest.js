const sql = require("mssql");
const express = require("express");
const path = require("path");
const app = express();
const qryResult='';
const connResult ='';
const connErr ='';
app.use(express.json());

// Database config - replace with your actual values
const config = {
    server: 'your-rds-endpoint.amazonaws.com',
    database: 'your_database_name', 
    user: 'your_username',
    password: 'your_password',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool;

// Connect to database
sql.connect(config).then(p => {
    pool = p;
    console.log('Connected to SQL Server');
}).catch(err => {
    console.error('Database connection failed:', err);
});

// API endpoint
app.get('/users', async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM users');
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use(express.static(path.join(__dirname, "public")));


app.listen(8080, () => {
  console.log("server is listening on port 8080");
});