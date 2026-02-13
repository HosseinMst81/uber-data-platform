require("dotenv").config({ path: "../.env" });
const pool = require("../src/models/db");

async function runGoldETL() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting Gold Layer ETL ...");

    await client.query("BEGIN");

    // 1. Create schema and final Gold table with optimized types, PK, and CHECK constraints
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS gold;

      CREATE TABLE IF NOT EXISTS gold.gold_dataset (
        booking_id TEXT PRIMARY KEY,
        trip_timestamp TIMESTAMP,
        pickup_hour INTEGER,
        day_name TEXT,
        is_weekend BOOLEAN,
        booking_status TEXT,
        customer_id TEXT,
        vehicle_type TEXT,
        unified_cancellation_reason TEXT,
        booking_value NUMERIC(10,2),
        ride_distance NUMERIC(10,2),
        revenue_per_km NUMERIC(10,2),
        driver_rating NUMERIC(3,2) CHECK (driver_rating BETWEEN 0 AND 5),
        customer_rating NUMERIC(3,2) CHECK (customer_rating BETWEEN 0 AND 5),
        payment_method TEXT,
        driver_rating_imputed BOOLEAN,
        customer_rating_imputed BOOLEAN,
        is_cancelled BOOLEAN
      );
    `);

    console.log("🛠 Gold table schema created/verified");

    // 2. Clear previous Gold data for clean run
    await client.query("TRUNCATE TABLE gold.gold_dataset;");

    // 3. Insert enriched data from Silver with revenue_per_km calculation
    await client.query(`
      INSERT INTO gold.gold_dataset (
        booking_id,
        trip_timestamp,
        pickup_hour,
        day_name,
        is_weekend,
        booking_status,
        customer_id,
        vehicle_type,
        unified_cancellation_reason,
        booking_value,
        ride_distance,
        revenue_per_km,
        driver_rating,
        customer_rating,
        payment_method,
        driver_rating_imputed,
        customer_rating_imputed,
        is_cancelled
      )
      SELECT
        booking_id,
        trip_timestamp,
        pickup_hour,
        day_name,
        is_weekend,
        booking_status,
        customer_id,
        vehicle_type,
        unified_cancellation_reason,
        booking_value,
        ride_distance,
        -- Calculate revenue per km safely: NULL if distance = 0 or NULL
        CASE 
          WHEN ride_distance > 0 THEN booking_value / ride_distance 
          ELSE NULL 
        END AS revenue_per_km,
        driver_rating,
        customer_rating,
        payment_method,
        driver_rating_imputed,
        customer_rating_imputed,
        is_cancelled
      FROM silver.cleaned_dataset
      ON CONFLICT (booking_id) DO NOTHING;
    `);

    console.log("✅ Data transferred to Gold with revenue_per_km enriched");

    await client.query("COMMIT");
    console.log("🎉 Gold Layer ETL completed successfully!");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Gold ETL failed - rolled back:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

runGoldETL().catch(console.error);