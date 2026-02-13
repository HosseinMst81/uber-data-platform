SELECT 
    COUNT(*) AS total_rows,
    COUNT(*) FILTER (WHERE unified_cancellation_reason IS NULL) AS null_count
FROM silver.cleaned_dataset;

SELECT 
    unified_cancellation_reason,
    COUNT(*) AS frequency
FROM silver.cleaned_dataset
GROUP BY unified_cancellation_reason
ORDER BY frequency DESC;

SELECT 
    COUNT(*) AS total_completed,
    COUNT(*) FILTER (WHERE driver_rating_imputed = true) AS imputed_driver,
    COUNT(*) FILTER (WHERE customer_rating_imputed = true) AS imputed_customer,
    ROUND(100.0 * COUNT(*) FILTER (WHERE driver_rating_imputed = true) / COUNT(*), 2) AS driver_imputed_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE customer_rating_imputed = true) / COUNT(*), 2) AS customer_imputed_pct
FROM silver.cleaned_dataset
WHERE booking_status = 'Completed';

// میانگین امتیاز ها به تفکیک نوع خودرو
SELECT 
    vehicle_type,
    ROUND(AVG(driver_rating)::NUMERIC, 2) AS avg_driver,
    ROUND(AVG(customer_rating)::NUMERIC, 2) AS avg_customer,
    COUNT(*) AS trip_count
FROM silver.cleaned_dataset
WHERE booking_status = 'Completed'
GROUP BY vehicle_type
ORDER BY avg_driver DESC;

// محاسبه مقادیر نال برای لایه های برنز و نقره و درصد بهبود
-- Comparison of NULL values between Bronze (Raw) and Silver (Cleaned)
WITH bronze_stats AS (
    SELECT 
        'Bronze (Raw Data)' AS layer,
        COUNT(*) AS total_rows,
        SUM(
            (CASE WHEN date IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN time IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN booking_id IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN booking_status IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN customer_id IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN vehicle_type IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN cancelled_by_customer IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN customer_cancel_reason IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN cancelled_by_driver IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN driver_cancel_reason IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN incomplete_rides IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN incomplete_reason IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN booking_value IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN ride_distance IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN driver_rating IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN customer_rating IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN payment_method IS NULL THEN 1 ELSE 0 END)
        ) AS total_null_values
    FROM bronze.raw_dataset
),
silver_stats AS (
    SELECT 
        'Silver (Cleaned Data)' AS layer,
        COUNT(*) AS total_rows,
        SUM(
            (CASE WHEN booking_id IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN booking_status IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN booking_value IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN ride_distance IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN driver_rating IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN customer_rating IS NULL THEN 1 ELSE 0 END) +
            (CASE WHEN unified_cancellation_reason IS NULL THEN 1 ELSE 0 END)
            -- We don't need to count date/time/hour because they were generated without NULLs
        ) AS total_null_values
    FROM silver.silver_cleaned_dataset
)
SELECT 
    b.layer AS "Layer",
    b.total_null_values AS "Null Count",
    s.layer AS "Layer",
    s.total_null_values AS "Null Count",
    (b.total_null_values - s.total_null_values) AS "Nulls Removed",
    ROUND(((b.total_null_values - s.total_null_values)::NUMERIC / NULLIF(b.total_null_values, 0)) * 100, 2) || '%' AS "Data Quality Improvement"
FROM bronze_stats b, silver_stats s;


-- Report GOld:
SELECT COUNT(*) AS total_rows,
       AVG(revenue_per_km) AS avg_revenue_km,
       COUNT(*) FILTER (WHERE revenue_per_km IS NULL) AS null_revenue
FROM gold.gold_dataset;

-- میانگین درامد به تفکیک وسیله:
SELECT 
  vehicle_type,
  COUNT(*) AS ride_count,
  ROUND(AVG(revenue_per_km), 2) AS avg_revenue_per_km
FROM gold.gold_dataset
WHERE revenue_per_km IS NOT NULL
GROUP BY vehicle_type
ORDER BY avg_revenue_per_km DESC;