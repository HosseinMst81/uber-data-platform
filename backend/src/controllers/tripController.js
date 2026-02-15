const pool = require('../models/db');

// Helper function to safely parse numeric values with fallback
const safeNumber = (value, fallback = null) => {
  if (value == null) return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

// Normalize a trip row from DB so numeric/boolean fields are proper types (pg returns decimals as strings)
const normalizeTripRow = (row) => {
  if (!row || typeof row !== 'object') return row;
  return {
    ...row,
    booking_value: safeNumber(row.booking_value, 0),
    ride_distance: safeNumber(row.ride_distance, 0),
    driver_rating: safeNumber(row.driver_rating, null),
    customer_rating: safeNumber(row.customer_rating, null),
    revenue_per_km: safeNumber(row.revenue_per_km, null),
    driver_rating_imputed: Boolean(row.driver_rating_imputed),
    customer_rating_imputed: Boolean(row.customer_rating_imputed),
    is_cancelled: Boolean(row.is_cancelled),
  };
};

// 1. CREATE - Create a new trip (status defaults to 'Completed')
// src/controllers/tripController.js - فقط تابع createTrip رو با این جایگزین کن
const createTrip = async (req, res) => {
  const {
    date,             // YYYY-MM-DD
    time,             // HH:MM:SS
    customer_id,
    vehicle_type,
    booking_value,
    ride_distance,
    payment_method,
    driver_rating,
    customer_rating,
  } = req.body;

  // Required fields validation
  if (
    !date ||
    !time ||
    !customer_id ||
    !vehicle_type ||
    booking_value == null ||
    ride_distance == null ||
    !payment_method
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Optional ratings validation (0–5)
  const driverRat = Number(driver_rating);
  const customerRat = Number(customer_rating);

  if (
    (!isNaN(driverRat) && (driverRat < 0 || driverRat > 5)) ||
    (!isNaN(customerRat) && (customerRat < 0 || customerRat > 5))
  ) {
    return res.status(400).json({ error: 'Ratings must be between 0 and 5' });
  }

  const client = await pool.connect();

  try {
    // Generate booking_id similar to dataset format
    const booking_id = `CNR${Math.floor(1000000 + Math.random() * 9000000)}`;

    const trip_timestamp = `${date} ${time}`;

    const query = `
      INSERT INTO gold.gold_dataset (
        booking_id, customer_id, vehicle_type, booking_status,
        booking_value, ride_distance, payment_method, trip_timestamp,
        driver_rating, customer_rating,
        unified_cancellation_reason,
        driver_rating_imputed, customer_rating_imputed,
        is_cancelled,
        revenue_per_km
      ) VALUES (
        $1, $2, $3, 'Completed',
        $4, $5, $6, $7::TIMESTAMP,
        $8, $9,
        'Reason Not Specified',
        FALSE, FALSE,
        FALSE,
        CASE 
          WHEN $5::NUMERIC > 0 THEN ROUND( ($4::NUMERIC / $5::NUMERIC), 2 ) 
          ELSE NULL 
        END
      )
      RETURNING *;
    `;

    const values = [
      booking_id,
      customer_id,
      vehicle_type,
      booking_value,
      ride_distance,
      payment_method,
      trip_timestamp,
      driverRat || null,
      customerRat || null,
    ];

    const result = await client.query(query, values);

    return res.status(201).json({
      message: 'Trip created successfully',
      trip: normalizeTripRow(result.rows[0]),
    });
  } catch (err) {
    console.error('Error creating trip:', err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Booking ID conflict' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Rating value out of range' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// 2. READ - Get all trips or filter by customer_id
const getTrips = async (req, res) => {
  const {
    customer_id,
    startDate,
    endDate,
    vehicleType,
    limit = 10,
    offset = 0,
  } = req.query;

  const parsedLimit = Math.min(Number(limit) || 10, 100);
  const parsedOffset = Number(offset) || 0;

  const client = await pool.connect();

  try {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    // Filter by customer_id
    if (customer_id) {
      whereClauses.push(`customer_id = $${idx++}`);
      values.push(customer_id);
    }

    // Filter by vehicle_type
    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    // Filter by date range
    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    const whereSQL =
      whereClauses.length > 0
        ? `WHERE ${whereClauses.join(" AND ")}`
        : "";

    // Get total count (for pagination)
    const countQuery = `
      SELECT COUNT(*) 
      FROM gold.gold_dataset
      ${whereSQL}
    `;

    const countResult = await client.query(countQuery, values);
    const total = Number(countResult.rows[0].count);

    // Get paginated data
    const dataQuery = `
      SELECT *
      FROM gold.gold_dataset
      ${whereSQL}
      ORDER BY trip_timestamp DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    const dataResult = await client.query(dataQuery, [
      ...values,
      parsedLimit,
      parsedOffset,
    ]);

    return res.json({
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      totalPages: Math.ceil(total / parsedLimit),
      trips: dataResult.rows.map(normalizeTripRow),
    });
  } catch (err) {
    console.error("Error fetching trips:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};


// 3. UPDATE - Change trip status (and is_cancelled flag)
const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { booking_status } = req.body;

  if (!booking_status) {
    return res.status(400).json({ error: 'booking_status is required' });
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE gold.gold_dataset
       SET booking_status = $1,
           is_cancelled = ($1 != 'Completed')
       WHERE booking_id = $2
       RETURNING *`,
      [booking_status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.json({
      message: 'Trip status updated successfully',
      trip: normalizeTripRow(result.rows[0]),
    });
  } catch (err) {
    console.error('Error updating trip status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// 4. DELETE - Remove a trip by booking_id
const deleteTrip = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();

  try {
    const result = await client.query(
      'DELETE FROM gold.gold_dataset WHERE booking_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.json({
      message: 'Trip deleted successfully',
      deleted_trip: normalizeTripRow(result.rows[0]),
    });
  } catch (err) {
    console.error('Error deleting trip:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

module.exports = {
  createTrip,
  getTrips,
  updateTripStatus,
  deleteTrip,
};