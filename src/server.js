const sql = require("mssql");
const express = require("express");
const path = require("path");
const { poolPromise } = require("./db");

const app = express();
const qryResult = "";
const connResult = "";
const connErr = "";

const VAMCIds = [402, 405];

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/test", async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    // add parameters to request
    VAMCIds.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const params = VAMCIds.map((id, index) => `@id${index}`).join(",");

    const result =
      await request.query(`Select Coalesce(Cast(VAMC as nVarchar(3)),'Total') as VAMC,
Sum(Case When Item='forks' Then Qty Else 0 End) as TotalForks,
Sum(Case When Item='spoons' Then Qty Else 0 End) as TotalSpoons
From [Inventory].[ForksSpoons]
Where VAMC IN (${params})
Group by rollup(VAMC)`);
    res.json({ new: "not using conn pool yet", data: result.recordset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/sites", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        "Select ExternalId, FacilityName, Longitude, Latitude, VaVisnNumber, Region, TimeZoneId From Meta.Facilities_Geo "
      );

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  const answer = "yes";
  res.send(json(answer));
});

app.listen(8080, "0.0.0.0.", () => {
  console.log("server is listening on port 8080");
});
