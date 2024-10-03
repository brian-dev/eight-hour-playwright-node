const { spawn, exec } = require('child_process');
const util = require('util');
const { createTable, createDatabase, deleteDatabase } = require('./database/db');
const path = require('path');
require('dotenv').config();

const execPromise = util.promisify(exec);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Remove the existing Docker container if it exists
const removeExistingContainer = async () => {
    try {
        await execPromise('docker rm -f postgres');
        console.log('Removed existing PostgreSQL container.');
    } catch (error) {
        if (error.code !== 1) {
            console.error(`Error removing PostgreSQL container: ${error.message}`);
            throw error;
        }
    }
};

// Start the PostgreSQL Docker container
const startPostgresContainer = async () => {
    const command = `
    docker run --name postgres \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD='${process.env.DB_PASSWORD}' \
    -d -p 5433:5432 postgres
  `;
    await execPromise(command);
    console.log('PostgreSQL container started.');
};

// Wait for PostgreSQL to be fully ready
const waitForPostgres = async () => {
    for (let i = 0; i < 10; i++) {
        try {
            await execPromise('docker exec postgres pg_isready -U postgres');
            console.log('PostgreSQL is ready.');
            return;
        } catch {
            await delay(2000);
        }
    }
    throw new Error('PostgreSQL did not become ready in time.');
};

// Create the users table after creating the database
const setupTestDatabase = async () => {
    const dbName = 'test_database';
    try {
        // Connect to root database (e.g., `postgres`) to delete the existing `test_database`
        console.log(`Checking if database '${dbName}' already exists...`);
        await deleteDatabase(dbName, true); // Updated to use root database
        console.log(`Database '${dbName}' deleted successfully.`);

        // Create a fresh test database using root database connection
        console.log(`Creating new database: ${dbName}`);
        await createDatabase(dbName);
        console.log(`Database '${dbName}' created successfully.`);

        // Create the users table in the newly created test database
        console.log('Creating the users table in test_database...');
        await createTable('users', [
            'id SERIAL PRIMARY KEY',
            'first_name VARCHAR(50) NOT NULL',
            'last_name VARCHAR(50) NOT NULL',
            'email VARCHAR(100) UNIQUE NOT NULL',
            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
        ]);
        console.log('Users table created successfully in test_database.');
    } catch (error) {
        console.error(`Error setting up the test database: ${error.message}`);
        throw error;
    }
};

// Global setup function for Playwright
async function globalSetup() {
    try {
        console.log('Starting global setup...');
        await removeExistingContainer();
        await startPostgresContainer();
        await waitForPostgres();

        // Step 1: Create the test database and set up the users table
        await setupTestDatabase();

        // Optional delay to ensure synchronization
        await delay(2000);

        // Step 2: Start the Express server using the child process
        console.log('Starting the server...');
        const serverPath = path.join(__dirname, 'server.js');
        global.serverProcess = spawn('node', [serverPath], { stdio: 'inherit' });
        console.log('Global setup completed successfully.');
    } catch (error) {
        console.error('Global setup failed:', error.message);
        throw error;
    }
}

module.exports = globalSetup;
