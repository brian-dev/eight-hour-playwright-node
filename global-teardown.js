const { deleteDatabase, deleteTable } = require('./database/db');
const { exec } = require('child_process');
const util = require('util');
require('dotenv').config();

const execPromise = util.promisify(exec);

// Function to stop and remove PostgreSQL Docker container
const stopPostgresContainer = async () => {
    try {
        const command = 'docker stop postgres && docker rm postgres';
        const { stdout } = await execPromise(command);
        console.log(`PostgreSQL container stopped and removed: ${stdout.trim()}`);
    } catch (error) {
        console.error(`Error stopping PostgreSQL container: ${error.message}`);
        throw error;
    }
};

async function globalTeardown() {
    const tableName = 'users';

    try {
        console.log('Starting global teardown...');

        // Stop the server if it was started during global setup
        if (global.serverProcess) {
            console.log('Stopping the server process...');
            global.serverProcess.kill('SIGTERM'); // Gracefully stop the server using SIGTERM
            await new Promise((resolve) => {
                global.serverProcess.on('close', resolve); // Wait until the server process fully exits
            });
            console.log('Server process stopped successfully.');
        }

        // Delete table and database
        console.log(`Deleting table: ${tableName} from database: ${process.env.DB_NAME}`);
        await deleteTable(tableName);
        console.log(`Table ${tableName} deleted successfully.`);

        console.log(`Deleting database: ${process.env.DB_NAME}`);
        await deleteDatabase(process.env.DB_NAME);
        console.log(`Database ${process.env.DB_NAME} deleted successfully.`);

        // Stop and remove the PostgreSQL container
        await stopPostgresContainer();
        console.log('PostgreSQL container stopped successfully.');

        console.log('Global teardown completed successfully.');
    } catch (error) {
        console.error('Global teardown failed:', error);
    }
}

module.exports = globalTeardown;
