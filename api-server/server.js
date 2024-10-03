const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Use Body-Parser Middleware to parse JSON payloads
app.use(bodyParser.json());

// PostgreSQL Pool Configuration for Docker Container with `test_database`
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'test_database', // Use the `test_database`
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Define a POST API Endpoint to Insert Data into `test_database`
app.post('/api/users', async (req, res) => {
    const { first_name, last_name, email } = req.body;

    if (!first_name || !last_name || !email) {
        return res.status(400).send('All fields (first_name, last_name, email) are required.');
    }

    try {
        const query = `INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3) RETURNING *`;
        const values = [first_name, last_name, email];
        const result = await pool.query(query, values);

        res.status(201).json({ message: 'User added successfully!', user: result.rows[0] });
    } catch (err) {
        console.error('Error executing query in test_database:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Define a GET API Endpoint to Return All Tables in the `test_database`
app.get('/api/tables', async (req, res) => {
    try {
        const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        const result = await pool.query(query);
        const tables = result.rows.map((row) => row.table_name);

        res.status(200).json({ message: 'Tables fetched successfully from test_database!', tables });
    } catch (err) {
        console.error('Error fetching tables from test_database:', err.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Start the Express server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
