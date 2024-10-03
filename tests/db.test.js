const { test, expect } = require('@playwright/test');
const { getUserByEmail, getUserByFirstName, deleteUserByEmail } = require('../database/db');
const axios = require('axios');

// User details for testing
const firstName = 'John';
const lastName = 'Doe';
const userEmail = 'john.doe@example.com';
const apiURL = 'http://localhost:3000/api/users';
const tablesURL = 'http://localhost:3000/api/tables';

// Before all tests, ensure the server and database are ready, and create a user
test.beforeAll(async () => {
    try {
        // Step 1: Make a GET request to verify tables exist
        const tablesResponse = await axios.get(tablesURL);
        console.log('Tables fetched successfully:', tablesResponse.data.tables);

        // Step 2: Create the user via the POST API
        const userData = {
            first_name: firstName,
            last_name: lastName,
            email: userEmail,
        };
        const response = await axios.post(apiURL, userData);
        console.log('User created successfully:', response.data);
    } catch (error) {
        console.error('Error during test setup:', error.message);
    }
});

// After all tests, delete the user from the database
test.afterAll(async () => {
    try {
        await deleteUserByEmail(userEmail);
        console.log(`User with email '${userEmail}' deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting user '${userEmail}':`, error.message);
    }
});

// Utility function to validate user retrieval
const checkUserRetrieved = (dbUserValue, expectedValue) => {
    expect(dbUserValue).not.toBeNull(); // Ensure a user is returned
    expect(dbUserValue).toBe(expectedValue); // Use toBe for exact match
};

// Test: Retrieve a user by email
test('Retrieve a user by email', async () => {
    const dbUser = await getUserByEmail(userEmail);
    checkUserRetrieved(dbUser.email, userEmail);
});

// Test: Retrieve a user by first name
test('Retrieve a user by first name', async () => {
    const dbUser = await getUserByFirstName(firstName);
    checkUserRetrieved(dbUser.first_name, firstName);
});
