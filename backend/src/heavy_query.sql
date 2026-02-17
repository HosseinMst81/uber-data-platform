
-- غیرفعال کردن استفاده از ایندکس
SET enable_indexscan = off;

EXPLAIN ANALYZE
SELECT
    vehicle_type,
    payment_method,
    COUNT(*) AS total_trips,
    SUM(booking_value) AS total_revenue,
    AVG(driver_rating) AS avg_driver_rating
FROM gold.gold_dataset
WHERE
    booking_status = 'Completed'
    AND vehicle_type = 'Uber XL'
    AND trip_timestamp >= '2024-03-01'
    AND trip_timestamp < '2024-03-10'
GROUP BY vehicle_type, payment_method
ORDER BY total_revenue DESC;



-- ایندکس گذاری
CREATE INDEX idx_covering_force
ON gold.gold_dataset 
(booking_status, vehicle_type, trip_timestamp)
INCLUDE (booking_value, payment_method, driver_rating);


-- مجبور به استفاده از اینکس
SET enable_seqscan = OFF;
