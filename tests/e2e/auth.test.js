const request = require("supertest"); // Library for making HTTP requests to the Express app in tests
const app = require("../../src/app"); // Import the Express application to test against
const db = require("../helpers/db"); // Helper module for managing the test database connection and cleanup

// Test lifecycle hooks: connect to test database before all tests, clean up between each, disconnect after all
beforeAll(() => db.connect());
afterEach(() => db.clearAllCollections());
afterAll(() => db.disconnect());

// Reusable sample user data for multiple tests
const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

// Tests for the registration endpoint
describe("POST /api/users/register", () => {
  it("registers a new user and returns 201", async () => {
    const res = await request(app).post("/api/users/register").send(validUser);
    expect(res.statusCode).toBe(201);                          // Expect "Created" status
    expect(res.body.success).toBe(true);                         // Expect success flag to be true
    expect(res.body.data.email).toBe(validUser.email);             // Expect the saved email to match
    expect(res.body.data.roles).toEqual(["customer"]);           // Expect default role assignment
  });

  it("assigns provided roles on registration", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, roles: ["admin"] });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.roles).toContain("admin");              // Expect custom role to be saved
  });

  it("returns 400 if email is already in use", async () => {
    await request(app).post("/api/users/register").send(validUser);  // First registration succeeds
    const res = await request(app).post("/api/users/register").send(validUser);  // Duplicate should fail
    expect(res.statusCode).toBe(400);                            // Expect "Bad Request" for duplicate
    expect(res.body.success).toBe(false);
  });

  it("returns 400 if name is missing", async () => {
    const res = await request(app).post("/api/users/register").send({ email: validUser.email, password: validUser.password });
    expect(res.statusCode).toBe(400);                            // Expect rejection when required field is absent
  });

  it("returns 400 if password is too short", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, password: "123" });
    expect(res.statusCode).toBe(400);                            // Expect rejection for failing minimum length rule
  });

  it("returns 400 if email is invalid", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, email: "not-an-email" });
    expect(res.statusCode).toBe(400);                            // Expect rejection for malformed email
  });

  it("returns 400 if role is invalid", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, roles: ["superuser"] });
    expect(res.statusCode).toBe(400);                            // Expect rejection for non-existent role
  });
});

// Tests for the login endpoint
describe("POST /api/users/login", () => {
  // Register the test user fresh before each login test so credentials exist
  beforeEach(async () => {
    await request(app).post("/api/users/register").send(validUser);
  });

  it("returns 200 with access and refresh tokens on valid credentials", async () => {
    const res = await request(app).post("/api/users/login").send({ email: validUser.email, password: validUser.password });
    expect(res.statusCode).toBe(200);                            // Expect "OK" for successful login
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();                        // Expect an access token in response
    expect(res.body.refreshToken).toBeDefined();                 // Expect a refresh token in response
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app).post("/api/users/login").send({ email: validUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);                            // Expect "Unauthorized" for bad password
  });

  it("returns 401 for unknown email", async () => {
    const res = await request(app).post("/api/users/login").send({ email: "ghost@example.com", password: "password123" });
    expect(res.statusCode).toBe(401);                            // Expect "Unauthorized" for non-existent account
  });
});