const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "UQ.AX#2z~]XGtkn5wwI3oIq7D#GK",
  server:
    process.env.DB_HOST ||
    "integrated-apar-apat.c1vwa9fou9fe.us-east-2.rds.amazonaws.com",
  database: "Integrated_APAR",
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 25, // Maximum connections in pool
    min: 5, // Minimum connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  },
};

console.log("DB_USER:", process.env.DB_USER);
console.log(
  "DB_PASSWORD:",
  process.env.DB_PASSWORD ? "***loaded***" : "NOT LOADED"
);
console.log("Using user:", config.user);

// Create pool once when module loads
const poolPromise = sql.connect(config);

module.exports = { poolPromise };
