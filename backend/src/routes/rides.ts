const express = require('express');
const pool = require('../models/db');

const router = express.Router();

// 1. Create Trip
router.post('/', async (req, res) => {
  const {
    date,           // '2025-02-15'
    time,           // '14:30:00'
    vehicle_type,
    payment_method,
    customer_id,
    booking_value,
    ride_distance,
    driver_rating,
    customer_rating
  } = req.body;

  try {
    //  Booking ID 
    const booking_id = 'CNR' + Date.now().toString().slice(-7);

    const result = await pool.query(
      `INSERT INTO gold.gold_dataset (
        booking_id, trip_timestamp, booking_status, customer_id, vehicle_type,
        booking_value, ride_distance, driver_rating, customer_rating,
        payment_method, revenue_per_km, is_cancelled
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        booking_id,
        `${date} ${time}`,
        'Completed',
        customer_id,
        vehicle_type,
        booking_value || 0,
        ride_distance || 0,
        driver_rating || null,
        customer_rating || null,
        payment_method || 'N/A',
        ride_distance > 0 ? (booking_value || 0) / ride_distance : null,
        false
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطا در ایجاد سفر جدید' });
  }
});

// 2. Read - لیست سفرها + فیلتر بر اساس Customer ID
router.get('/', async (req, res) => {
  const { customer_id } = req.query;

  try {
    let query = 'SELECT * FROM gold.gold_dataset ORDER BY trip_timestamp DESC';
    let values = [];

    if (customer_id) {
      query = 'SELECT * FROM gold.gold_dataset WHERE customer_id = $1 ORDER BY trip_timestamp DESC';
      values = [customer_id];
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'خطا در دریافت لیست سفرها' });
  }
});

// 3. Update - تغییر وضعیت سفر (مثلاً به Cancelled یا Incomplete)
router.put('/:booking_id', async (req, res) => {
  const { booking_id } = req.params;
  const { booking_status, unified_cancellation_reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE gold.gold_dataset 
       SET booking_status = $1, 
           unified_cancellation_reason = $2,
           is_cancelled = $1 != 'Completed'
       WHERE booking_id = $3
       RETURNING *`,
      [booking_status, unified_cancellation_reason || null, booking_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'سفر یافت نشد' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'خطا در بروزرسانی' });
  }
});

// 4. Delete - حذف یک سفر
router.delete('/:booking_id', async (req, res) => {
  const { booking_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM gold.gold_dataset WHERE booking_id = $1 RETURNING *',
      [booking_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'سفر یافت نشد' });
    }

    res.json({ message: 'سفر با موفقیت حذف شد', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'خطا در حذف' });
  }
});

module.exports = router;