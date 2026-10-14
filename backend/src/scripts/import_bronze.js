const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pool = require("../models/db");

// Resolve the dataset relative to THIS file, so the importer works regardless
// of the current working directory (local dev, Docker, CI).
const CSV_PATH = path.resolve(
  __dirname,
  "../../../database/original_dataset.csv"
);

// Must match the positional column order declared in
// database/init/01_bronze_schema.sql
const COLUMN_COUNT = 17;

// Rows per multi-row INSERT: 500 x 17 = 8500 bind parameters, comfortably
// below PostgreSQL's 65535 limit and far faster than one round-trip per row.
const BATCH_SIZE = 500;

const INSERT_PREFIX = "INSERT INTO bronze.raw_dataset VALUES ";

/**
 * Convert a parsed CSV row into a positional values array.
 * The source encodes missing values as the literal string "null".
 */
const toValues = (row) => {
  const values = Object.values(row).map((value) =>
    value === "null" ? null : value
  );

  if (values.length !== COLUMN_COUNT) {
    throw new Error(
      `Malformed row: expected ${COLUMN_COUNT} columns, received ${values.length}`
    );
  }

  return values;
};

/** Build and execute one multi-row INSERT for a batch of value arrays. */
const insertBatch = (client, batch) => {
  const placeholders = batch
    .map((_, rowIndex) => {
      const base = rowIndex * COLUMN_COUNT;
      const tuple = Array.from(
        { length: COLUMN_COUNT },
        (_, colIndex) => `$${base + colIndex + 1}`
      );
      return `(${tuple.join(", ")})`;
    })
    .join(", ");

  return client.query(INSERT_PREFIX + placeholders, batch.flat());
};

const importData = async () => {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`Dataset not found at ${CSV_PATH}`);
  }

  const client = await pool.connect();
  let imported = 0;

  try {
    console.log(`📥 Importing ${CSV_PATH}`);

    await client.query("BEGIN");

    // Full reload, matching the TRUNCATE-then-load pattern used by the Silver
    // and Gold stages, so re-running the pipeline stays idempotent.
    await client.query("TRUNCATE TABLE bronze.raw_dataset");

    // `for await` applies backpressure: no unbounded queue of in-flight queries.
    const stream = fs.createReadStream(CSV_PATH).pipe(csv());

    let batch = [];

    for await (const row of stream) {
      batch.push(toValues(row));

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(client, batch);
        imported += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await insertBatch(client, batch);
      imported += batch.length;
    }

    await client.query("COMMIT");
    console.log(`✅ Bronze import finished — ${imported} rows inserted`);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("❌ Bronze import failed:", err.message);
    throw err;
  } finally {
    // Release the client and close the pool so the process can exit.
    client.release();
    await pool.end();
  }
};

importData().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
