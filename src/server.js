const sql = require("mssql");
const express = require("express");
const path = require("path");
const { poolPromise, poolPromiseOtherDB } = require("./db");

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.post("/inventory", async (req, res) => {
  // forks
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

app.get("/api/item-inventory", async (req, res) => {
  try {
    const itemNumber = req.query.item_number;
    const vamcIds = req.query.vamc_ids; // Expects comma-separated string: "123,456,789"

    console.log("itemNumber: ", itemNumber);
    console.log("VAMC IDs: ", vamcIds);
    console.log("VAMCIds type: ", typeof vamcIds);

    if (!itemNumber) {
      return res.status(400).json({ error: "No item_number provided" });
    }

    if (!vamcIds || vamcIds.length === 0) {
      return res.status(400).json({ error: "No vamc_ids provided" });
    }

    const pool = await poolPromise; // or poolPromiseOtherDB depending on your database

    const result = await pool
      .request()
      .input("ItemNumber", sql.VarChar(50), itemNumber)
      .input("VAMCIds", sql.VarChar(1000), vamcIds)
      .execute("SP_InventoryCheck"); // Replace with your actual SP name

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /api/item-inventory:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/financial-report", async (req, res) => {
  try {
    const VAMCIds = req.body.vamcIds;

    if (!VAMCIds || VAMCIds.length === 0) {
      return res.status(400).json({ error: "No VAMCIds provided" });
    }

    // Sort VAMCIds in ascending order
    VAMCIds.sort((a, b) => a - b);

    const pool = await poolPromise;
    const idListString = VAMCIds.join(",");

    // Get detail rows
    const detailResult = await pool
      .request()
      .input("VAMCList", sql.VarChar(1000), idListString)
      .execute("CPA_Detail");
    console.log("detail result structure: ", detailResult);
    // Get totals for each station
    const totalsPromises = VAMCIds.map(
      (id) => pool.request().input("VAMC_Id", sql.Int, id).execute("CPA_Total") // Your new totals stored procedure
    );

    const totalsResults = await Promise.all(totalsPromises);

    // Combine details and totals
    const allRows = [];
    let grandTotal = 0;
    VAMCIds.forEach((id, index) => {
      // Add detail rows for this station
      const stationDetails = detailResult.recordset.filter(
        (row) => row.station_number === id
      );
      allRows.push(...stationDetails);

      // Add total row for this station
      if (
        totalsResults[index] &&
        totalsResults[index].recordset &&
        totalsResults[index].recordset.length > 0
      ) {
        const totalRow = totalsResults[index].recordset[0];
        allRows.push(totalRow);
        grandTotal += totalRow.Transaction_Amount || 0; // Add to grand total
      }
    });

    // Add grand total row
    allRows.push({
      station_number: "--- Grand Total ---",
      date_of_request: null,
      requesting_service: null,
      vendor: null,
      cost_center: null,
      purchase_order_obligation_no: null,
      originator_of_request: null,
      approving_official: null,
      Committed_Estimated_Cost: null,
      Transaction_Amount: grandTotal,
    });
    res.json({ data: allRows });
  } catch (err) {
    console.error("Error in /financial-report:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/issues-by-station", async (req, res) => {
  try {
    const VAMCIds = req.body.vamcIds;
    if (!VAMCIds || VAMCIds.length === 0) {
      return res.status(400).json({ error: "No VAMCIds provided" });
    }
    // Sort VAMCIds in ascending order
    VAMCIds.sort((a, b) => a - b);

    const pool = await poolPromiseOtherDB; // Use your other database pool
    const idListString = VAMCIds.join(",");

    // Get detail rows
    const detailResult = await pool
      .request()
      .input("VAMCList", sql.VarChar(1000), idListString)
      .execute("sp_IssuesByVAMCDetails");

    console.log("detail result structure: ", detailResult);

    // Get totals for each station
    const totalsPromises = VAMCIds.map((id) =>
      pool
        .request()
        .input("VAMC_Id", sql.Int, id)
        .execute("sp_IssuesByVAMCTotals")
    );
    const totalsResults = await Promise.all(totalsPromises);

    // Combine details and totals
    const allRows = [];
    let grandTotal = 0;

    VAMCIds.forEach((id, index) => {
      // Add detail rows for this station
      const stationDetails = detailResult.recordset.filter(
        (row) => row.station_number === id
      );
      allRows.push(...stationDetails);

      // Add total row for this station
      if (
        totalsResults[index] &&
        totalsResults[index].recordset &&
        totalsResults[index].recordset.length > 0
      ) {
        const totalRow = totalsResults[index].recordset[0];
        allRows.push(totalRow);
        grandTotal += totalRow.Transaction_Amount || 0;
      }
    });

    // Add grand total row
    allRows.push({
      AppTransID: "--- Grand Total ---",
      StationId: null,
      StationName: null,
      EntryDate: null,
      PatShortSSN: null,
      PatientName: null,
      RequestDate: null,
      Item: null,
      ItemIEN: null,
      Qty: null,
      Total: grandTotal,
    });

    res.json({ data: allRows });
  } catch (err) {
    console.error("Error in /new-report:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/duplicate-issues", async (req, res) => {
  try {
    console.log("Starting duplicate-issues endpoint");
    const pool = await poolPromiseOtherDB;
    console.log("Pool connected");

    const result = await pool.request().execute("sp_GetDuplicateIssues");

    console.log("Query executed, rows:", result.recordset.length);
    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /duplicate-issues:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/issue-details", async (req, res) => {
  try {
    const { patSSN } = req.body;
    const pool = await poolPromiseOtherDB;

    const result = await pool
      .request()
      .input("PatShortSSN", sql.VarChar(50), patSSN)
      .execute("sp_GetDuplicateIssueDetails");

    res.json({ data: result.recordset });
  } catch (err) {
    console.error("Error in /issue-details:", err);
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
    console.log("success rows: " + result.recordset.length);
    res.json(result.recordset);
  } catch (err) {
    console.error("ERROR in /api/sites: ", err.message);
    console.error("Full error: ", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(8080, "0.0.0.0", () => {
  console.log("server is listening on port 8080");
});
