// Import supertest for testing API endpoints
const request = require("supertest");

// Import the Express application
const app = require("../../src/app");


// ======================= REGISTER & LOGIN HELPER =======================
// Utility function used in tests
// It registers a user, logs them in, and returns the auth token
const registerAndLogin = async ({ name, email, password, roles }) => {

  // Create a new user account
  await request(app)
    .post("/api/users/register")
    .send({
      name,
      email,
      password,
      roles
    });

  // Log in with the created account
  const res = await request(app)
    .post("/api/users/login")
    .send({
      email,
      password
    });

  // Return JWT token for authenticated test requests
  return res.body.token;
};


// Export helper function for use in test files
module.exports = {
  registerAndLogin
};