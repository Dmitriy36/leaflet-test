
const sql = require("mssql");
const express = require("express");
const path = require("path");
const app = express();
const qryResult='';
const connResult ='';
const connErr ='';

app.use(express.json());

const config = {
    server: "integrated-apar-apat.c1vwa9fou9fe.us-east-2.rds.amazonaws.com",
    database: "Integrated_APAR",
    user: "admin",
    password: "g-Y~aPz8-i*Mk~O~M2*j]LkA554C",
    port: 1433,
    options: {
        encrypt: true, // Use encryption for AWS RDS
        trustServerCertificate: false,
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


    app.get('/api/forks', async (req, res) => {
        try {
            const result = await pool.request()
                .query('select name from [Inventory].[establishConnectivity] where id=1');
            res.json(result.recordset[0] || null);
        } catch (error) {
            console.error('Query error:', error);
            res.status(500).json({ error: error.message });
        }
    });



app.get("/api/dbTest", (req, res) => {  
res.json(connResult + ", " +connErr)
});

app.get("/api/nondbTest", (req, res) => {  
const testString = "I can see.";
res.json(testString)
});

app.get("/api/users", (req, res) => {
  const users = [
    {
      id: "1",
      name: "shaun",
    },
    {
      id: "2",
      name: "joe",
    },
    {
      id: "3",
      name: "zeus",
    },
  ];
  res.json(users);
});

app.get("/api/answer", (req, res) => {
  const answer = "yes"
  res.send(json(answer))
});


app.use(express.static(path.join(__dirname, "public")));


app.listen(8080, () => {
  console.log("server is listening on port 8080");
});

