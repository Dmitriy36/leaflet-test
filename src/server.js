
const sql = require("mssql");
const express = require("express");
const path = require("path");
const {poolPromise} = require('./db')

const app = express();
const qryResult='';
const connResult ='';
const connErr ='';

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get('/test', async (req, res)=>{
  try{
    const pool = await poolPromise;
    const result = await pool.request().query('Select * from Inventory.establishConnectivity where id = 1');
    res.json({new:'not using conn pool yet',data:result.recordset});
  } catch (err){
    res.status(500).json({error:err.message});
  }
});

app.get('/api/sites', async(req,res)=>{
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('Select ExternalId, FacilityName, Longitude, Latitude, VaVisnNumber, Region, TimeZoneId From Meta.Facilities_Geo ');
    
    res.json(result.recordset);
} catch(err){
  res.status(500).json({error:err.message});
}
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





app.listen(8080, '0.0.0.0.', () => {
  console.log("server is listening on port 8080");
});

