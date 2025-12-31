const sql = require("mssql");
const express = require("express");
const path = require("path");
const { poolPromise } = require("./db");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/inventory", async (req, res) => {
  try {
    const VAMCIds = req.body.vamcIds; // Receives array from frontend

    if (!VAMCIds || VAMCIds.length === 0) {
      return res.status(400).json({ error: "No VAMCIds provided" });
    }

    const pool = await poolPromise;
    const request = pool.request();
    VAMCIds.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const params = VAMCIds.map((id, index) => `@id${index}`).join(",");
    const result = await request.query(
      ` Select Coalesce(Cast(VAMC as nVarchar(3)),'---Total---') as VAMC, Sum(Case When Item='forks' Then Qty Else 0 End) as TotalForks, Sum(Case When Item='spoons' Then Qty Else 0 End) as TotalSpoons From [Inventory].[Forks_Spoons] Where VAMC IN (${params}) Group by rollup(VAMC) `
    );
    res.json({ data: result.recordset }); // Returns query results
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/financial-report", async (req, res) => {
  try {
    const VAMCIds = req.body.vamcIds; // Receives array from frontend

    if (!VAMCIds || VAMCIds.length === 0) {
      return res.status(400).json({ error: "No VAMCIds provided" });
    }

    const pool = await poolPromise;
    const request = pool.request;
    VAMCIds.forEach((id, index) => {
      request.input(`id${index}`, sql.Int, id);
    });

    const params = VAMCIds.map((id, index) => `@id${index}`).join(",");
    // const result = await request.query(
    //   ` Select Coalesce(Cast(VAMC as nVarchar(3)),'---Total---') as VAMC, Sum(Case When Item='forks' Then Qty Else 0 End) as TotalForks, Sum(Case When Item='spoons' Then Qty Else 0 End) as TotalSpoons From [Inventory].[Forks_Spoons] Where VAMC IN (${params}) Group by rollup(VAMC) `
    // );
    const result = await pool
      .request()
      .input(params)
      .execute("[dbo].[CPA_Detail]");
    res.json({ data: result.recordset }); // Returns query results
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/byregion", async (req, res) => {
  try {
    const region = req.body.region;

    if (!region || region.length === 0) {
      return res.status(400).json({ error: "No region provided" });
    }

    const pool = await poolPromise;
    const request = pool.request();

    const result = await request.query(
      `select ExternalId, FacilityName, Longitude, Latitude, VaVisnNumber, Region, TimeZoneId from [Meta].[Facilities_Geo] where region=${region}`
    );
    res.json({ data: result.recordset }); // Returns query results
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/byvisn", async (req, res) => {
  try {
    const visn = req.body.visn;

    if (!visn || visn.length === 0) {
      return res.status(400).json({ error: "No VISN provided" });
    }

    const pool = await poolPromise;
    const request = pool.request();

    const result = await request.query(
      `select ExternalId, FacilityName, Longitude, Latitude, VaVisnNumber, Region, TimeZoneId from [Meta].[Facilities_Geo] where vavisnnumber=${visn}`
    );
    res.json({ data: result.recordset }); // Returns query results
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

app.listen(8080, "0.0.0.0", () => {
  console.log("server is listening on port 8080");
});
