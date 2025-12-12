const sql = require("mssql");
const dbConfig = require("./dbConfig");
const express = require("express");
const path = require("path");
const app = express();

const dbPort = process.env.PORT;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

// console.log(dbUser, dbPort, dbPass);

const connectAndQuery = async () => {
  try {
    // Establishes a connection pool to the SQL Server
    await sql.connect(dbConfig);
    console.log("Database connected successfully.");

    // Execute a simple query
    // const result = await sql.query`SELECT top 5 * FROM YourTableName`; // Use input parameters to prevent SQL injection

    // return result.recordsets[0];
  } catch (err) {
    console.error("Database connection or query failed:", err);
    throw err; // Propagate the error for handling in the route
  }
};

connectAndQuery();
app.use(express.static(path.join(__dirname, "public")));

// app.get("/api/dbTest", (req, res) => {
//   res.json(connectAndQuery);
// });

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

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
