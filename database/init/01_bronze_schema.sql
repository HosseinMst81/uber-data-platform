-- ==========================================================
--  Uber Data Platform — Bronze layer bootstrap
--  Executed automatically by the official postgres image on FIRST
--  initialisation of an empty data directory
--  (/docker-entrypoint-initdb.d).
--
--  The Silver and Gold schemas/tables are created by the ETL scripts
--  (backend/src/scripts/silver_etl.js, gold_etl.js).
-- ==========================================================

CREATE SCHEMA IF NOT EXISTS bronze;

-- Raw landing table: a faithful, all-TEXT mirror of the source CSV.
-- Nothing is renamed, cast, or dropped here so that ingestion can never
-- fail on dirty data.
--
-- IMPORTANT: the column order below is positional and must stay in sync with
--   * the header order of database/original_dataset.csv
--   * COLUMN_COUNT / the INSERT in backend/src/scripts/import_bronze.js
CREATE TABLE IF NOT EXISTS bronze.raw_dataset (
  date                   TEXT,  -- 1  Date
  time                   TEXT,  -- 2  Time
  booking_id             TEXT,  -- 3  Booking ID
  booking_status         TEXT,  -- 4  Booking Status
  customer_id            TEXT,  -- 5  Customer ID
  vehicle_type           TEXT,  -- 6  Vehicle Type
  cancelled_by_customer  TEXT,  -- 7  Cancelled Rides by Customer
  customer_cancel_reason TEXT,  -- 8  Reason for cancelling by Customer
  cancelled_by_driver    TEXT,  -- 9  Cancelled Rides by Driver
  driver_cancel_reason   TEXT,  -- 10 Driver Cancellation Reason
  incomplete_rides       TEXT,  -- 11 Incomplete Rides
  incomplete_reason      TEXT,  -- 12 Incomplete Rides Reason
  booking_value          TEXT,  -- 13 Booking Value
  ride_distance          TEXT,  -- 14 Ride Distance
  driver_rating          TEXT,  -- 15 Driver Ratings
  customer_rating        TEXT,  -- 16 Customer Rating
  payment_method         TEXT   -- 17 Payment Method
);
