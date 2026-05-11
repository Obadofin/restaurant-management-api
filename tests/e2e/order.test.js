const request = require("supertest");
const app = require("../../src/app");
const db = require("../helpers/db");
const { registerAndLogin } = require("../helpers/auth");

beforeAll(() => db.connect());
afterEach(() => db.clearAllCollections());
afterAll(() => db.disconnect());

// ── Test users ─────────────────────────────────────────────────────────────
const adminUser = {
  name: "Admin User",
  email: "admin@example.com",
  password: "password123",
  roles: ["admin"],
};

const customerUser = {
  name: "Customer User",
  email: "customer@example.com",
  password: "password123",
  roles: ["customer"],
};

// ── Helper: create a menu item ─────────────────────────────────────────────
const createMenuItemAndCategory = async (adminToken) => {
  // Create category first
  const categoryRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Main Course", description: "Main dishes" });

  const categoryId = categoryRes.body.data._id;

  // Create menu item
  const menuRes = await request(app)
    .post("/api/menu")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Jollof Rice",
      description: "Nigerian Jollof Rice",
      price: 1500,
      category: categoryId,
      isAvailable: true,
    });

  return menuRes.body.data._id;
};

// ══════════════════════════════════════════════════════════════════════════
// POST /api/orders — Create Order
// ══════════════════════════════════════════════════════════════════════════
describe("POST /api/orders", () => {
  it("creates an order successfully and returns 201", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 2 }] });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.totalPrice).toBe(3000);
    expect(res.body.data.items[0].name).toBe("Jollof Rice");
  });

  it("calculates totalPrice automatically", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 3 }] });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.totalPrice).toBe(4500);
  });

  it("returns 422 if items array is empty", async () => {
    const customerToken = await registerAndLogin(customerUser);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [] });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 422 if menuItemId does not exist", async () => {
    const customerToken = await registerAndLogin(customerUser);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId: "64f1b2c3d4e5f6a7b8c9d0e1", quantity: 1 }] });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 if user is not authenticated", async () => {
    const res = await request(app)
      .post("/api/orders")
      .send({ items: [{ menuItemId: "64f1b2c3d4e5f6a7b8c9d0e1", quantity: 1 }] });

    expect(res.statusCode).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/orders/me — Get My Orders
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/orders/me", () => {
  it("returns only the authenticated user's orders", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    // Create two orders for customer
    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 1 }] });

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 2 }] });

    const res = await request(app)
      .get("/api/orders/me")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
  });

  it("returns 401 if not authenticated", async () => {
    const res = await request(app).get("/api/orders/me");
    expect(res.statusCode).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// PATCH /api/orders/:id/status — Update Order Status
// ══════════════════════════════════════════════════════════════════════════
describe("PATCH /api/orders/:id/status", () => {
  it("admin can update order status from pending to preparing", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 1 }] });

    const orderId = orderRes.body.data._id;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "preparing" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("preparing");
  });

  it("returns 400 for invalid status transition", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 1 }] });

    const orderId = orderRes.body.data._id;

    // Try to jump from pending to completed directly
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "completed" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 403 if customer tries to update status", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    const orderRes = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 1 }] });

    const orderId = orderRes.body.data._id;

    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "preparing" });

    expect(res.statusCode).toBe(403);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/orders/admin — Get All Orders
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/orders/admin", () => {
  it("admin can retrieve all orders", async () => {
    const adminToken = await registerAndLogin(adminUser);
    const customerToken = await registerAndLogin(customerUser);
    const menuItemId = await createMenuItemAndCategory(adminToken);

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ items: [{ menuItemId, quantity: 1 }] });

    const res = await request(app)
      .get("/api/orders/admin")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  it("returns 403 if customer tries to access all orders", async () => {
    const customerToken = await registerAndLogin(customerUser);

    const res = await request(app)
      .get("/api/orders/admin")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("returns 401 if not authenticated", async () => {
    const res = await request(app).get("/api/orders/admin");
    expect(res.statusCode).toBe(401);
  });
});