const pool = require('../models/db');

// Helper function to safely parse numeric values
const safeNumber = (value, fallback = null) => {
  if (value == null) return fallback;
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
};

// ============================================
// (KPIs)
// ============================================
const getKPIs = async (req, res) => {
  const { startDate, endDate, vehicleType } = req.query;

  const client = await pool.connect();

  try {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    // Apply filters
    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
        COUNT(*) AS total_bookings,
        COUNT(*) FILTER (WHERE is_cancelled = FALSE) AS successful_bookings,
        SUM(booking_value) FILTER (WHERE is_cancelled = FALSE) AS total_revenue,
        ROUND(
          (COUNT(*) FILTER (WHERE is_cancelled = FALSE)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
          2
        ) AS success_rate
      FROM gold.gold_dataset
      ${whereSQL}
    `;

    const result = await client.query(query, values);
    const row = result.rows[0];

    return res.json({
      total_bookings: safeNumber(row.total_bookings, 0),
      successful_bookings: safeNumber(row.successful_bookings, 0),
      total_revenue: safeNumber(row.total_revenue, 0),
      success_rate: safeNumber(row.success_rate, 0),
    });
  } catch (err) {
    console.error('Error fetching KPIs:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
// Pie Chart - cancelation reason
// ============================================
const getCancellationReasons = async (req, res) => {
  const { startDate, endDate, vehicleType } = req.query;

  const client = await pool.connect();

  try {
    let whereClauses = ['is_cancelled = TRUE'];
    let values = [];
    let idx = 1;

    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    const whereSQL = `WHERE ${whereClauses.join(' AND ')}`;

    const query = `
      SELECT
        unified_cancellation_reason AS reason,
        COUNT(*) AS count,
        ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) AS percentage
      FROM gold.gold_dataset
      ${whereSQL}
      GROUP BY unified_cancellation_reason
      ORDER BY count DESC
    `;

    const result = await client.query(query, values);

    return res.json({
      data: result.rows.map((row) => ({
        reason: row.reason,
        count: safeNumber(row.count, 0),
        percentage: safeNumber(row.percentage, 0),
      })),
    });
  } catch (err) {
    console.error('Error fetching cancellation reasons:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
//  Pie Chart - payment methods
// ============================================
const getPaymentMethods = async (req, res) => {
  const { startDate, endDate, vehicleType } = req.query;

  const client = await pool.connect();

  try {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
        payment_method,
        COUNT(*) AS count,
        ROUND((COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER ()) * 100, 2) AS percentage
      FROM gold.gold_dataset
      ${whereSQL}
      GROUP BY payment_method
      ORDER BY count DESC
    `;

    const result = await client.query(query, values);

    return res.json({
      data: result.rows.map((row) => ({
        payment_method: row.payment_method,
        count: safeNumber(row.count, 0),
        percentage: safeNumber(row.percentage, 0),
      })),
    });
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
//  Bar Chart - Car Types
// ============================================
const getVehicleAnalysis = async (req, res) => {
  const { startDate, endDate, vehicleType } = req.query;

  const client = await pool.connect();

  try {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
        vehicle_type,
        COUNT(*) AS total_trips,
        ROUND(AVG(driver_rating), 2) AS avg_driver_rating,
        ROUND(AVG(customer_rating), 2) AS avg_customer_rating,
        SUM(booking_value) AS total_revenue,
        ROUND(AVG(booking_value), 2) AS avg_booking_value
      FROM gold.gold_dataset
      ${whereSQL}
      GROUP BY vehicle_type
      ORDER BY total_trips DESC
    `;

    const result = await client.query(query, values);

    return res.json({
      data: result.rows.map((row) => ({
        vehicle_type: row.vehicle_type,
        total_trips: safeNumber(row.total_trips, 0),
        avg_driver_rating: safeNumber(row.avg_driver_rating, 0),
        avg_customer_rating: safeNumber(row.avg_customer_rating, 0),
        total_revenue: safeNumber(row.total_revenue, 0),
        avg_booking_value: safeNumber(row.avg_booking_value, 0),
      })),
    });
  } catch (err) {
    console.error('Error fetching vehicle analysis:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
// Peak Hours - Line Chart
// ============================================
const getPeakHours = async (req, res) => {
  const { startDate, endDate, vehicleType } = req.query;

  const client = await pool.connect();

  try {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
        pickup_hour AS hour,
        COUNT(*) AS trip_count
      FROM gold.gold_dataset
      ${whereSQL}
      GROUP BY pickup_hour
      ORDER BY pickup_hour
    `;

    const result = await client.query(query, values);

    return res.json({
      data: result.rows.map((row) => ({
        hour: safeNumber(row.hour, 0),
        trip_count: safeNumber(row.trip_count, 0),
      })),
    });
  } catch (err) {
    console.error('Error fetching peak hours:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
// Weekdays based on Trips count
// ============================================
const getWeekdayAnalysis = async (req, res) => {
  const { startDate, endDate, vehicleType } = req.query;

  const client = await pool.connect();

  try {
    let whereClauses = [];
    let values = [];
    let idx = 1;

    if (startDate) {
      whereClauses.push(`trip_timestamp >= $${idx++}`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`trip_timestamp <= $${idx++}`);
      values.push(endDate);
    }

    if (vehicleType) {
      whereClauses.push(`vehicle_type = $${idx++}`);
      values.push(vehicleType);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT
        day_name,
        COUNT(*) AS trip_count,
        ROUND(AVG(booking_value), 2) AS avg_revenue
      FROM gold.gold_dataset
      ${whereSQL}
      GROUP BY day_name
      ORDER BY 
        CASE day_name
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END
    `;

    const result = await client.query(query, values);

    return res.json({
      data: result.rows.map((row) => ({
        day_name: row.day_name,
        trip_count: safeNumber(row.trip_count, 0),
        avg_revenue: safeNumber(row.avg_revenue, 0),
      })),
    });
  } catch (err) {
    console.error('Error fetching weekday analysis:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
// Filters: Vehicle Types
// ============================================
const getVehicleTypes = async (req, res) => {
  const client = await pool.connect();

  try {
    const query = `
      SELECT DISTINCT vehicle_type
      FROM gold.gold_dataset
      ORDER BY vehicle_type
    `;

    const result = await client.query(query);

    return res.json({
      vehicle_types: result.rows.map((row) => row.vehicle_type),
    });
  } catch (err) {
    console.error('Error fetching vehicle types:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// ============================================
// Exports
// ============================================
module.exports = {
  getKPIs,
  getCancellationReasons,
  getPaymentMethods,
  getVehicleAnalysis,
  getPeakHours,
  getWeekdayAnalysis,
  getVehicleTypes,
};