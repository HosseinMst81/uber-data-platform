const fs = require("fs");
const csv = require("csv-parser");
const pool = require("../models/db");

const importData = async () => {
  const client = await pool.connect();
  fs.createReadStream("../../database/original_dataset.csv")
    .pipe(csv())
    .on("data", async (row) => {
      const values = Object.values(row).map((value) =>
        value === "null" ? null : value
      );
      await client.query(
        `
        INSERT INTO bronze.raw_dataset VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `,
        values
      );
    })
    .on("end", () => console.log("Import done"));
};

importData();
