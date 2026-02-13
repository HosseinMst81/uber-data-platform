require("dotenv").config({ path: "../.env" });
const pool = require("../src/models/db");

async function runSilverETL() {
  const client = await pool.connect();
  try {
    console.log("🚀 Starting Silver Layer ETL ...");
    await client.query("BEGIN");

    // 1. Create schema and table if not exists (Feature Engineering columns included)
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS silver;

      CREATE TABLE IF NOT EXISTS silver.cleaned_dataset (
        booking_id           TEXT PRIMARY KEY,
        customer_id          TEXT,
        vehicle_type         TEXT,
        booking_status       TEXT,
        booking_value        NUMERIC(10,2),
        ride_distance        NUMERIC(10,2),
        payment_method       TEXT,
        trip_timestamp       TIMESTAMP,
        pickup_hour          INTEGER,
        day_of_week          INTEGER,
        day_name             TEXT,
        month                INTEGER,
        year                 INTEGER,
        is_weekend           BOOLEAN,
        unified_cancellation_reason TEXT,
        driver_rating        NUMERIC(3,2),
        customer_rating      NUMERIC(3,2),
        driver_rating_imputed  BOOLEAN DEFAULT FALSE,
        customer_rating_imputed BOOLEAN DEFAULT FALSE,
        is_cancelled         BOOLEAN
      );
    `);

    // 2. Clear previous data for a clean slate
    await client.query("TRUNCATE silver.cleaned_dataset;");
    console.log("🧹 Truncated silver.cleaned_dataset");

    // 3. Insert transformed data from bronze with correct column names
    await client.query(`
      INSERT INTO silver.cleaned_dataset (
        booking_id, customer_id, vehicle_type, booking_status,
        booking_value, ride_distance, payment_method,
        trip_timestamp,
        pickup_hour, day_of_week, day_name, month, year, is_weekend,
        unified_cancellation_reason,
        driver_rating, customer_rating,
        is_cancelled
      )
      SELECT
        booking_id,
        customer_id,
        vehicle_type,
        booking_status,
        booking_value,
        ride_distance,
        payment_method,
        -- Combine date and time into timestamp
        (date + time)::TIMESTAMP AS trip_timestamp,
        -- Extract hour from time
        EXTRACT(HOUR FROM time) AS pickup_hour,
        -- Extract day of week (0=Sunday, 6=Saturday)
        EXTRACT(DOW FROM date) AS day_of_week,
        -- Get full day name
        TO_CHAR(date, 'FMDay') AS day_name,
        -- Extract month
        EXTRACT(MONTH FROM date) AS month,
        -- Extract year
        EXTRACT(YEAR FROM date) AS year,
        -- Check if weekend (Sunday or Saturday)
        CASE WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN TRUE ELSE FALSE END AS is_weekend,
        -- Unified cancellation reason: pick reason from the column with non-null indicator
        CASE
          WHEN cancelled_by_customer IS NOT NULL THEN customer_cancel_reason
          WHEN cancelled_by_driver IS NOT NULL THEN driver_cancel_reason
          WHEN incomplete_rides IS NOT NULL THEN incomplete_reason
          ELSE 'Reason Not Specified'  -- Default value instead of NULL
        END AS unified_cancellation_reason,
        driver_rating,
        customer_rating,
        -- Mark as cancelled if booking status is not 'Completed'
        booking_status != 'Completed' AS is_cancelled
      FROM bronze.raw_dataset
      ON CONFLICT (booking_id) DO NOTHING;
    `);
    console.log(
      "✅ Base data inserted with feature engineering and unified reasons"
    );

    // 4. Impute missing ratings per vehicle type (only for Completed trips)
    await client.query(`
      WITH avg_per_vehicle AS (
        SELECT
          vehicle_type,
          AVG(driver_rating) FILTER (
            WHERE booking_status = 'Completed' AND driver_rating IS NOT NULL
          ) AS avg_driver,
          AVG(customer_rating) FILTER (
            WHERE booking_status = 'Completed' AND customer_rating IS NOT NULL
          ) AS avg_customer
        FROM silver.cleaned_dataset
        GROUP BY vehicle_type
      )
      UPDATE silver.cleaned_dataset s
      SET
        driver_rating = COALESCE(s.driver_rating, a.avg_driver, 4.5),
        customer_rating = COALESCE(s.customer_rating, a.avg_customer, 4.5),
        driver_rating_imputed = CASE
          WHEN s.driver_rating IS NULL AND s.booking_status = 'Completed' THEN TRUE
          ELSE FALSE
        END,
        customer_rating_imputed = CASE
          WHEN s.customer_rating IS NULL AND s.booking_status = 'Completed' THEN TRUE
          ELSE FALSE
        END
      FROM avg_per_vehicle a
      WHERE s.vehicle_type = a.vehicle_type
        AND s.booking_status = 'Completed';
    `);
    console.log("⭐ Ratings imputed (per vehicle type) and imputed flags set");

    await client.query("COMMIT");
    console.log("🎉 Silver Layer ETL completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Silver Layer ETL failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runSilverETL().catch(console.error);
