const axios = require('axios');
// Gold dataset schema for prompt injection
const GOLD_SCHEMA = `
Database Schema - Gold Layer (gold.gold_dataset):
Table: gold.gold_dataset
Columns:
- booking_id (TEXT, PRIMARY KEY): Unique booking identifier (e.g., 'CNR1234567')
- trip_timestamp (TIMESTAMP): Date and time of the trip
- pickup_hour (INTEGER): Hour of day (0-23)
- day_name (TEXT): Day of week name (e.g., 'Monday', 'Tuesday')
- is_weekend (BOOLEAN): Whether the trip occurred on weekend
- booking_status (TEXT): Status of booking (e.g., 'Completed', 'Cancelled')
- customer_id (TEXT): Customer identifier
- vehicle_type (TEXT): Type of vehicle (e.g., 'Sedan', 'Auto', 'eBike', 'Bike', 'Moto', 'Mini', 'XL', 'Go')
- unified_cancellation_reason (TEXT): Reason for cancellation if applicable
- booking_value (NUMERIC): Trip fare/revenue in dollars
- ride_distance (NUMERIC): Trip distance in kilometers
- revenue_per_km (NUMERIC): Revenue per kilometer
- driver_rating (NUMERIC): Driver rating (0-5)
- customer_rating (NUMERIC): Customer rating (0-5)
- payment_method (TEXT): Payment method used (e.g., 'Cash', 'Credit Card', 'Digital Wallet')
- driver_rating_imputed (BOOLEAN): Whether driver rating was imputed
- customer_rating_imputed (BOOLEAN): Whether customer rating was imputed
- is_cancelled (BOOLEAN): Whether the trip was cancelled

Important Notes:
- All monetary values are in dollars (USD)
- All distances are in kilometers
- Ratings are on a scale of 0 to 5
- Always use the schema name 'gold' when querying: gold.gold_dataset
`;

// System prompt with all validation logic
const SYSTEM_PROMPT = `You are a SQL expert assistant for a ride-sharing analytics database. Your job is to convert natural language questions into valid PostgreSQL SELECT queries.

${GOLD_SCHEMA}

CRITICAL RULES YOU MUST FOLLOW:
1. ONLY generate SELECT queries. Absolutely refuse to generate INSERT, UPDATE, DELETE, DROP, TRUNCATE, ALTER, CREATE, GRANT, REVOKE, or any data modification queries.
2. If the user asks for data modification, respond with: "ERROR: Only SELECT queries are allowed. I cannot modify data."
3. If the question is not related to trip analytics (greetings, general questions, coding help, etc.), respond with: "ERROR: Please ask questions about trip analytics data only."
4. Always include a LIMIT clause. Default to LIMIT 100 if not specified.
5. Use proper PostgreSQL syntax and functions.
6. Always use the full table name: gold.gold_dataset
7. Return ONLY the SQL query as plain text. No explanations, no markdown formatting, no code blocks, no backticks.
8. Validate that all referenced columns exist in the schema above.
9. Use appropriate aggregations and GROUP BY clauses when needed.
10. For date filtering, use proper timestamp comparisons.

EXAMPLES OF VALID RESPONSES:

User: "Show me the top 10 highest revenue trips"
Response: SELECT booking_id, booking_value, vehicle_type, trip_timestamp FROM gold.gold_dataset WHERE is_cancelled = FALSE ORDER BY booking_value DESC LIMIT 10;

User: "What's the average rating by vehicle type?"
Response: SELECT vehicle_type, ROUND(AVG(driver_rating), 2) as avg_driver_rating, ROUND(AVG(customer_rating), 2) as avg_customer_rating, COUNT(*) as total_trips FROM gold.gold_dataset WHERE driver_rating IS NOT NULL GROUP BY vehicle_type ORDER BY total_trips DESC LIMIT 100;

User: "How many trips per payment method?"
Response: SELECT payment_method, COUNT(*) as trip_count FROM gold.gold_dataset GROUP BY payment_method ORDER BY trip_count DESC LIMIT 100;

EXAMPLES OF INVALID REQUESTS:

User: "Delete all cancelled trips"
Response: ERROR: Only SELECT queries are allowed. I cannot modify data.

User: "How are you doing today?"
Response: ERROR: Please ask questions about trip analytics data only.

User: "Update the booking value to 100"
Response: ERROR: Only SELECT queries are allowed. I cannot modify data.

User: "Write me a Python function"
Response: ERROR: Please ask questions about trip analytics data only.

Now, carefully analyze the user's question and generate the appropriate SQL query or error message.`;

/**
 * Generate SQL query from natural language question
 */
const generateSQL = async (req, res) => {
  const { question } = req.body;

  // Basic input validation
  if (
    !question ||
    typeof question !== "string" ||
    question.trim().length === 0
  ) {
    return res.status(400).json({ error: "Question is required" });
  }

  if (question.length > 500) {
    return res
      .status(400)
      .json({ error: "Question is too long (max 500 characters)" });
  }

  try {
    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.3-70b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
        temperature: 0.1,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "My Text-to-SQL App",
        },
      }
    );

    const generatedSQL = response.data.choices[0]?.message?.content?.trim();

    if (!generatedSQL) {
      return res.status(500).json({ error: "Failed to generate SQL query" });
    }

    // Check if LLM returned an error (بدون تغییر)
    if (generatedSQL.startsWith("ERROR:")) {
      return res.status(400).json({
        error: "Invalid question",
        message: generatedSQL.replace("ERROR: ", ""),
      });
    }

    // Return the SQL as-is
    return res.json({
      question,
      sql: generatedSQL,
      model: response.data.model, // OpenRouter
    });
  } catch (error) {
    console.error(
      "Error generating SQL:",
      error.response?.data || error.message
    );

    if (error.status === 401) {
      return res.status(500).json({
        error: "API authentication failed",
        message: "Invalid Groq API key",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Too many requests. Please try again later.",
      });
    }

    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

module.exports = {
  generateSQL,
};
