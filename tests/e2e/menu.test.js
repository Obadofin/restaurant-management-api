const request = require("supertest"); // Library for making HTTP requests to the Express app in tests
const app = require("../../src/app"); // Import the Express application to test against
const db = require("../helpers/db"); // Helper module for managing the test database connection and cleanup
const { registerAndLogin } = require("../helpers/auth"); // Helper function to register a user and return their auth token for use in tests

let adminToken, staffToken, customerToken, categoryId; // Variables to hold authentication tokens for different user roles and a category ID, set up before tests run

// Set up three test users with different roles before any tests run
beforeAll(async () => {
  await db.connect();
  adminToken = await registerAndLogin({ name: "Admin", email: "admin@test.com", password: "password123", roles: ["admin"] });
  staffToken = await registerAndLogin({ name: "Staff", email: "staff@test.com", password: "password123", roles: ["staff"] });
  customerToken = await registerAndLogin({ name: "Customer", email: "customer@test.com", password: "password123" });
});

// Clear only menu items and categories between tests — users persist
afterEach(() => db.clearCollections("menuitems", "categories"));

afterAll(() => db.disconnect());

// Re-create the base category before each test since it gets cleared
beforeEach(async () => {
  const catRes = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Main Course" });
  categoryId = catRes.body.data._id;
});

// Helper to build a valid menu item using the current category
const baseItem = () => ({
  name: "Grilled Salmon",
  description: "Fresh Atlantic salmon",
  price: 18.99,
  category: categoryId,
});

// Tests for listing all menu items (public — no login needed)
describe("GET /api/menu", () => {
  it("returns 200 with an empty list", async () => {
    const res = await request(app).get("/api/menu");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("returns all menu items with populated category", async () => {
    await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(baseItem());

    const res = await request(app).get("/api/menu");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].category.name).toBe("Main Course");  // Category details are included, not just an ID
  });

  it("filters items by ?category= query param", async () => {
    await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(baseItem());

    const otherCat = await request(app).post("/api/categories").set("Authorization", `Bearer ${adminToken}`).send({ name: "Desserts" });
    await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...baseItem(), name: "Ice Cream", category: otherCat.body.data._id });

    const res = await request(app).get(`/api/menu?category=${categoryId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("Grilled Salmon");  // Only shows items from the requested category
  });
});

// Tests for viewing a single menu item (public — no login needed)
describe("GET /api/menu/:id", () => {
  it("returns 200 with the menu item", async () => {
    const created = await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(baseItem());
    const id = created.body.data._id;

    const res = await request(app).get(`/api/menu/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Grilled Salmon");
    expect(res.body.data.category.name).toBe("Main Course");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/menu/000000000000000000000000");
    expect(res.statusCode).toBe(404);
  });
});

// Tests for creating a menu item (admin or staff only)
describe("POST /api/menu", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).post("/api/menu").send(baseItem());
    expect(res.statusCode).toBe(401);  // Not logged in
  });

  it("returns 403 when a customer tries to create a menu item", async () => {
    const res = await request(app).post("/api/menu").set("Authorization", `Bearer ${customerToken}`).send(baseItem());
    expect(res.statusCode).toBe(403);  // Logged in but wrong role
  });

  it("allows admin to create a menu item", async () => {
    const res = await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(baseItem());
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Grilled Salmon");
    expect(res.body.data.price).toBe(18.99);
    expect(res.body.data.isAvailable).toBe(true);  // Defaults to available
    expect(res.body.data.category.name).toBe("Main Course");
  });

  it("allows staff to create a menu item", async () => {
    const res = await request(app).post("/api/menu").set("Authorization", `Bearer ${staffToken}`).send(baseItem());
    expect(res.statusCode).toBe(201);
  });

  it("returns 404 when the provided category does not exist", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...baseItem(), category: "000000000000000000000000" });
    expect(res.statusCode).toBe(404);  // Can't link to a non-existent category
  });

  it("returns 400 on validation failure (negative price)", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...baseItem(), price: -5 });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when name is missing", async () => {
    const { name, ...withoutName } = baseItem();
    const res = await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(withoutName);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when category id is invalid format", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...baseItem(), category: "not-an-id" });
    expect(res.statusCode).toBe(400);  // Must be a valid 24-character MongoDB ID
  });
});

// Tests for updating a menu item (admin or staff only)
describe("PUT /api/menu/:id", () => {
  let menuId;

  // Create a fresh menu item before each update test
  beforeEach(async () => {
    const res = await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(baseItem());
    menuId = res.body.data._id;
  });

  it("allows admin to update price", async () => {
    const res = await request(app).put(`/api/menu/${menuId}`).set("Authorization", `Bearer ${adminToken}`).send({ price: 25.0 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.price).toBe(25);
  });

  it("allows staff to toggle availability", async () => {
    const res = await request(app).put(`/api/menu/${menuId}`).set("Authorization", `Bearer ${staffToken}`).send({ isAvailable: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.isAvailable).toBe(false);  // Marks item as out of stock / unavailable
  });

  it("returns 403 when a customer tries to update", async () => {
    const res = await request(app).put(`/api/menu/${menuId}`).set("Authorization", `Bearer ${customerToken}`).send({ price: 10 });
    expect(res.statusCode).toBe(403);
  });

  it("returns 400 if body is empty", async () => {
    const res = await request(app).put(`/api/menu/${menuId}`).set("Authorization", `Bearer ${adminToken}`).send({});
    expect(res.statusCode).toBe(400);  // Must provide at least one field to change
  });

  it("returns 404 if category in update does not exist", async () => {
    const res = await request(app).put(`/api/menu/${menuId}`).set("Authorization", `Bearer ${adminToken}`).send({ category: "000000000000000000000000" });
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 for a non-existent menu item", async () => {
    const res = await request(app).put("/api/menu/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`).send({ price: 10 });
    expect(res.statusCode).toBe(404);
  });
});

// Tests for deleting a menu item (admin only)
describe("DELETE /api/menu/:id", () => {
  let menuId;

  // Create a fresh menu item before each delete test
  beforeEach(async () => {
    const res = await request(app).post("/api/menu").set("Authorization", `Bearer ${adminToken}`).send(baseItem());
    menuId = res.body.data._id;
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).delete(`/api/menu/${menuId}`);
    expect(res.statusCode).toBe(401);
  });

  it("returns 403 when staff tries to delete a menu item", async () => {
    const res = await request(app).delete(`/api/menu/${menuId}`).set("Authorization", `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(403);  // Staff can edit but not remove items
  });

  it("returns 403 when customer tries to delete a menu item", async () => {
    const res = await request(app).delete(`/api/menu/${menuId}`).set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("allows admin to delete a menu item", async () => {
    const res = await request(app).delete(`/api/menu/${menuId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 for a non-existent menu item", async () => {
    const res = await request(app).delete("/api/menu/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});