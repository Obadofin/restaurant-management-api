const request = require("supertest"); // Library for making HTTP requests to the Express app in tests
const app = require("../../src/app"); // Import the Express application to test against
const db = require("../helpers/db"); // Helper module for managing the test database connection and cleanup
const { registerAndLogin } = require("../helpers/auth"); // Helper function to register a user and return their auth token for use in tests

let adminToken, staffToken, customerToken; // Variables to hold authentication tokens for different user roles, set up before tests run

// Set up three test users with different roles before any tests run
beforeAll(async () => {
  await db.connect();
  adminToken = await registerAndLogin({ name: "Admin", email: "admin@test.com", password: "password123", roles: ["admin"] });
  staffToken = await registerAndLogin({ name: "Staff", email: "staff@test.com", password: "password123", roles: ["staff"] });
  customerToken = await registerAndLogin({ name: "Customer", email: "customer@test.com", password: "password123" });
});

// Only clear categories between tests — users persist for the whole file
afterEach(() => db.clearCollections("categories"));

afterAll(() => db.disconnect());

// Tests for listing all categories (public — no login needed)
describe("GET /api/categories", () => {
  it("returns 200 with an empty list when no categories exist", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns all categories sorted by name", async () => {
    await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Soups" });
    await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Appetizers" });

    const res = await request(app).get("/api/categories");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].name).toBe("Appetizers");  // Alphabetically first
  });
});

// Tests for viewing a single category (public — no login needed)
describe("GET /api/categories/:id", () => {
  it("returns 200 with the category", async () => {
    const created = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Drinks" });
    const id = created.body.data._id;

    const res = await request(app).get(`/api/categories/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Drinks");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/categories/000000000000000000000000");
    expect(res.statusCode).toBe(404);
  });
});

// Tests for creating a category (admin or staff only)
describe("POST /api/categories", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).post("/api/categories").send({ name: "Drinks" });
    expect(res.statusCode).toBe(401);  // Not logged in
  });

  it("returns 403 when a customer tries to create a category", async () => {
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${customerToken}`).send({ name: "Drinks" });
    expect(res.statusCode).toBe(403);  // Logged in but wrong role
  });

  it("allows staff to create a category", async () => {
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${staffToken}`).send({ name: "Drinks", description: "Cold beverages" });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Drinks");
    expect(res.body.data.description).toBe("Cold beverages");
  });

  it("allows admin to create a category", async () => {
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Desserts" });
    expect(res.statusCode).toBe(201);
  });

  it("returns 400 on validation failure (name too short)", async () => {
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "A" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 on duplicate category name", async () => {
    await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Drinks" });
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Drinks" });
    expect(res.statusCode).toBe(400);
  });
});

// Tests for updating a category (admin or staff only)
describe("PUT /api/categories/:id", () => {
  let categoryId;

  // Create a fresh category before each update test
  beforeEach(async () => {
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Starters" });
    categoryId = res.body.data._id;
  });

  it("allows admin to update a category", async () => {
    const res = await request(app).put(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${adminToken}`).send({ name: "Appetizers" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Appetizers");
  });

  it("allows staff to update a category", async () => {
    const res = await request(app).put(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${staffToken}`).send({ description: "Updated desc" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.description).toBe("Updated desc");
  });

  it("returns 403 when a customer tries to update", async () => {
    const res = await request(app).put(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${customerToken}`).send({ name: "Appetizers" });
    expect(res.statusCode).toBe(403);
  });

  it("returns 400 if body is empty", async () => {
    const res = await request(app).put(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${adminToken}`).send({});
    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for a non-existent category", async () => {
    const res = await request(app).put("/api/categories/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`).send({ name: "Ghost" });
    expect(res.statusCode).toBe(404);
  });
});

// Tests for deleting a category (admin only)
describe("DELETE /api/categories/:id", () => {
  let categoryId;

  // Create a fresh category before each delete test
  beforeEach(async () => {
    const res = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "To Delete" });
    categoryId = res.body.data._id;
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).delete(`/api/categories/${categoryId}`);
    expect(res.statusCode).toBe(401);
  });

  it("returns 403 when staff tries to delete a category", async () => {
    const res = await request(app).delete(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 when customer tries to delete a category", async () => {
    const res = await request(app).delete(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("allows admin to delete a category", async () => {
    const res = await request(app).delete(`/api/categories/${categoryId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for a non-existent category", async () => {
    const res = await request(app).delete("/api/categories/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});