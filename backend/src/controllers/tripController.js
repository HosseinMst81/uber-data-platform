const pool = require('../models/db');
const { v4: uuidv4 } = require('uuid');

// ========== CREATE ==========
// Create a new trip with default status 'Completed'
const createTrip = async (req, res) => {
  const {
    date,               // format: YYYY-MM-DD
    time,               // format: HH:MI:SS
    customer_id,
    vehicle_type,
    booking_value,
    ride_distance,
    payment_method,
    driver_rating,
    customer_rating,
  } = req.body;

  // Basic validation: required fields must exist
  if (!date || !time || !customer_id || !vehicle_type || booking_value === undefined || ride_distance === undefined || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If ratings provided, they must be between 0 and 5
  if ((driver_rating !== undefined && (driver_rating < 0 || driver_rating > 5)) ||
      (customer_rating !== undefined && (customer_rating < 0 || customer_rating > 5))) {
    return res.status(400).json({ error: 'Ratings must be between 0 and 5' });
  }

  const booking_id = uuidv4(); // generate unique booking ID
  const client = await pool.connect();
  try {
    const insertQuery = `
      INSERT INTO gold.dataset (
        booking_id, customer_id, vehicle_type, booking_status,
        booking_value, ride_distance, payment_method,
        trip_timestamp, pickup_hour, day_of_week, day_name,
        month, year, is_weekend,
        unified_cancellation_reason,
        driver_rating, customer_rating,
        driver_rating_imputed, customer_rating_imputed,
        is_cancelled,
        revenue_per_km
      ) VALUES (
        $1, $2, $3, 'Completed',
        $4, $5, $6,
        ($7 || ' ' || $8)::TIMESTAMP,
        EXTRACT(HOUR FROM ($7 || ' ' || $8)::TIMESTAMP),
        EXTRACT(DOW FROM ($7 || ' ' || $8)::TIMESTAMP),
        TO_CHAR(($7 || ' ' || $8)::TIMESTAMP, 'FMDay'),
        EXTRACT(MONTH FROM ($7 || ' ' || $8)::TIMESTAMP),
        EXTRACT(YEAR FROM ($7 || ' ' || $8)::TIMESTAMP),
        CASE WHEN EXTRACT(DOW FROM ($7 || ' ' || $8)::TIMESTAMP) IN (0,6) THEN TRUE ELSE FALSE END,
        'Reason Not Specified',
        $9, $10,
        FALSE, FALSE,
        FALSE,
        CASE WHEN $5 > 0 THEN ROUND(($4 / $5)::NUMERIC, 2) ELSE NULL END
      )
      RETURNING *;
    `;

    const values = [
      booking_id, customer_id, vehicle_type,
      booking_value, ride_distance, payment_method,
      date, time,
      driver_rating || null, customer_rating || null
    ];

    const result = await client.query(insertQuery, values);
    res.status(201).json({ message: 'Trip created successfully', trip: result.rows[0] });
  } catch (err) {
    console.error('Create trip error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Booking ID already exists' });
    }
    if (err.code === '23514') {
      return res.status(400).json({ error: 'Ratings must be between 0 and 5' });
    }
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ========== READ with filters ==========
// Get list of trips with optional filters and pagination
const getTrips = async (req, res) => {
  const {
    vehicle_type,
    payment_method,
    start_date,
    end_date,
    min_booking_value,
    max_booking_value,
    limit = 100,
    offset = 0,
  } = req.query;

  let whereConditions = [];
  let values = [];
  let paramIndex = 1;

  if (vehicle_type) {
    whereConditions.push(`vehicle_type = $${paramIndex++}`);
    values.push(vehicle_type);
  }
  if (payment_method) {
    whereConditions.push(`payment_method = $${paramIndex++}`);
    values.push(payment_method);
  }
  if (start_date) {
    whereConditions.push(`trip_timestamp >= $${paramIndex++}::DATE`);
    values.push(start_date);
  }
  if (end_date) {
    whereConditions.push(`trip_timestamp <= $${paramIndex++}::DATE + interval '1 day' - interval '1 second'`);
    values.push(end_date);
  }
  if (min_booking_value) {
    whereConditions.push(`booking_value >= $${paramIndex++}`);
    values.push(min_booking_value);
  }
  if (max_booking_value) {
    whereConditions.push(`booking_value <= $${paramIndex++}`);
    values.push(max_booking_value);
  }

  const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Count total matching records
  const countQuery = `SELECT COUNT(*) FROM gold.dataset ${whereClause}`;
  // Fetch data with sorting and pagination
  const dataQuery = `
    SELECT * FROM gold.dataset
    ${whereClause}
    ORDER BY trip_timestamp DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const countValues = values.slice();
  const dataValues = [...values, limit, offset];

  const client = await pool.connect();
  try {
    const countResult = await client.query(countQuery, countValues);
    const dataResult = await client.query(dataQuery, dataValues);
    res.json({
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
      trips: dataResult.rows,
    });
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ========== UPDATE (only status) ==========
// Update booking status of a specific trip
const updateTripStatus = async (req, res) => {
  const { id } = req.params;
  const { booking_status } = req.body;

  if (!booking_status) {
    return res.status(400).json({ error: 'booking_status is required' });
  }

  const client = await pool.connect();
  try {
    const updateQuery = `
      UPDATE gold.dataset
      SET booking_status = $1,
          is_cancelled = ($1 != 'Completed')
      WHERE booking_id = $2
      RETURNING *;
    `;
    const result = await client.query(updateQuery, [booking_status, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip status updated', trip: result.rows[0] });
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ========== DELETE ==========
// Delete a trip by its booking_id
const deleteTrip = async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    const result = await client.query('DELETE FROM gold.dataset WHERE booking_id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully', trip: result.rows[0] });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({ error: 'Internal server error' });
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