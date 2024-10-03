const {Client } = require('pg');
require('dotenv').config();

// Function to create a new client connection for table operations in the test database
function createTestDatabaseClient() {
    return new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
    });
}

// Function to create a new client connection for the root database (e.g., `postgres`)
function createRootDatabaseClient() {
    return new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_ROOT, // Use root database for managing other databases
    });
}

// Helper function to execute a query using a new client connection for `test_database`
async function executeTestDbQuery(query, params = []) {
    const client = createTestDatabaseClient();
    await client.connect();
    try {
        console.log('Connected to PostgreSQL test_database');
        return await client.query(query, params);
    } catch (error) {
        console.error('Error executing query in test_database:', error);
        throw error; // Rethrow error for further handling
    } finally {
        await client.end();
        console.log('Disconnected from PostgreSQL test_database');
    }
}

// Helper function to execute a query using a new client connection for root database
async function executeRootDbQuery(query, params = []) {
    const client = createRootDatabaseClient();
    await client.connect();
    try {
        console.log('Connected to PostgreSQL root database');
        return await client.query(query, params);
    } catch (error) {
        console.error('Error executing query in root database:', error);
        throw error; // Rethrow error for further handling
    } finally {
        await client.end();
        console.log('Disconnected from PostgreSQL root database');
    }
}

// Function to create a database using a root database connection
async function createDatabase(dbName) {
    await executeRootDbQuery(`CREATE DATABASE "${dbName}"`);
    console.log(`Database '${dbName}' created successfully!`);
}

// Function to delete a database using a root database connection
async function deleteDatabase(dbName) {
    await executeRootDbQuery(
        `SELECT pg_terminate_backend(pg_stat_activity.pid)
         FROM pg_stat_activity
         WHERE pg_stat_activity.datname = $1`, [dbName]
    );
    await executeRootDbQuery(`DROP DATABASE IF EXISTS "${dbName}"`);
    console.log(`Database '${dbName}' deleted successfully!`);
}

// Function to create a table in `test_database`
async function createTable(tableName, columns) {
    if (!tableName || !Array.isArray(columns) || columns.length === 0) {
        throw new Error('Invalid table name or columns definition.');
    }

    const columnsDefinition = columns.join(', ');
    const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnsDefinition})`;

    try {
        const result = await executeTestDbQuery(createTableQuery);
        console.log(`Table '${tableName}' created successfully in test_database! Row count: ${result.rowCount || 0}`);
        return result;
    } catch (error) {
        console.error(`Error creating table '${tableName}' in test_database:`, error.message);
        throw error;
    }
}

// Function to delete a table in `test_database`
async function deleteTable(tableName) {
    await executeTestDbQuery(`DROP TABLE IF EXISTS "${tableName}"`);
    console.log(`Table '${tableName}' deleted successfully in test_database!`);
}

// Function to insert a user in `test_database`
async function insertUser(first_name, last_name, email) {
    await executeTestDbQuery(
        `INSERT INTO "users" (first_name, last_name, email) VALUES ($1, $2, $3)`,
        [first_name, last_name, email]
    );
    console.log(`User '${first_name}' '${last_name}' with email '${email}' added successfully in test_database!`);
}

// Function to get a user by email from `test_database`
async function getUserByEmail(email) {
    const result = await executeTestDbQuery(
        `SELECT * FROM "users" WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        console.log(`No user found with email '${email}' in test_database`);
        return null;
    }
    return result.rows[0];
}

// Function to delete a user by email in `test_database`
async function deleteUserByEmail(email) {
    const deleteQuery = `DELETE FROM "users" WHERE email = $1`;
    const result = await executeTestDbQuery(deleteQuery, [email]);

    if (result.rowCount === 0) {
        console.log(`No user found with email '${email}' in test_database`);
        return null; // Return null if no user was deleted
    }

    console.log(`User with email '${email}' deleted successfully in test_database!`);
}

// Function to get a user by first name from `test_database`
async function getUserByFirstName(first_name) {
    const result = await executeTestDbQuery(
        `SELECT * FROM "users" WHERE first_name = $1`,
        [first_name]
    );

    if (result.rows.length === 0) {
        console.log(`No user found with name '${first_name}' in test_database`);
        return null;
    }
    return result.rows[0];
}

// Function to get all users from `test_database`
async function getAllUsers() {
    const result = await executeTestDbQuery(`SELECT * FROM "users"`);
    return result.rows;
}

// Export the database functions
module.exports = {
    createDatabase,
    deleteDatabase,
    createTable, // <-- Added to export createTable function
    deleteTable,
    insertUser,
    getUserByEmail,
    deleteUserByEmail,
    getUserByFirstName,
    getAllUsers
};
