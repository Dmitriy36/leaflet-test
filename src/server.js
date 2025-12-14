
const sql = require("mssql");
const express = require("express");
const path = require("path");
const app = express();
const qryResult='';
const connResult ='';
const connErr ='';

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// const config = {
//     server: "integrated-apar-apat.c1vwa9fou9fe.us-east-2.rds.amazonaws.com",
//     database: "Integrated_APAR",
//     user: "admin",
//     password: "g-Y~aPz8-i*Mk~O~M2*j]LkA554C",
//     port: 1433,
//     options: {
//         encrypt: true, // Use encryption for AWS RDS
//         trustServerCertificate: false,
//      }
// };

// app.get("/api/dbTest", (req, res) => {  
// res.json(connResult + ", " +connErr)
// });

// app.get("/api/nondbTest", (req, res) => {  
// const testString = "I can see.";
// res.json(testString)
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

app.get("/api/answer", (req, res) => {
  const answer = "yes"
  res.send(json(answer))
});





app.listen(8080, () => {
  console.log("server is listening on port 8080");
});

