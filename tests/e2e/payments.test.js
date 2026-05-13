const request = require("supertest");
const app = require("../../src/app");
const db = require("../helpers/db");
const { registerAndLogin } = require("../helpers/auth");

let adminToken, staffToken, customerToken;

beforeAll(async () => {
  await db.connect();
  adminToken = await registerAndLogin({ name: "Admin", email: "admin@test.com", password: "password123", roles: ["admin"] });
  staffToken = await registerAndLogin({ name: "Staff", email: "staff@test.com", password: "password123", roles: ["staff"] });
  customerToken = await registerAndLogin({ name: "Customer", email: "customer@test.com", password: "password123" });
});

afterEach(() => db.clearCollections("payments", "orders", "menuitems", "categories"));

afterAll(() => db.disconnect());

// ── Helpers ─────────────────────────────────────────────────────────────────

// Creates a category → menu item → order and returns the orderId and totalPrice
const createOrder = async () => {
  const catRes = await request(app)
    .post("/api/categories")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Mains", description: "Main dishes" });
  const categoryId = catRes.body.data._id;

  const menuRes = await request(app)
    .post("/api/menu")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ name: "Jollof Rice", price: 1500, category: categoryId, isAvailable: true });
  const menuItemId = menuRes.body.data._id;

  const orderRes = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ items: [{ menuItemId, quantity: 2 }] });

  return { orderId: orderRes.body.data._id, totalPrice: orderRes.body.data.totalPrice };
};

// ══════════════════════════════════════════════════════════════════════════
// POST /api/payments/process
// ══════════════════════════════════════════════════════════════════════════
describe("POST /api/payments/process", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app)
      .post("/api/payments/process")
      .send({ amount: 25.99, paymentMethod: "card" });
    expect(res.statusCode).toBe(401);
  });

  it("processes a standalone payment and returns success with a transactionId", async () => {
    const res = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 25.99, paymentMethod: "card" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("success");
    expect(res.body.data.amount).toBe(25.99);
    expect(res.body.data.paymentMethod).toBe("card");
    expect(res.body.data.transactionId).toBeDefined();
  });

  it("accepts cash as a payment method", async () => {
    const res = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 10, paymentMethod: "cash" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.paymentMethod).toBe("cash");
  });

  it("generates unique transactionIds for consecutive payments", async () => {
    const res1 = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 10, paymentMethod: "card" });

    const res2 = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 20, paymentMethod: "cash" });

    expect(res1.body.data.transactionId).not.toBe(res2.body.data.transactionId);
  });

  it("uses the order totalPrice when an orderId is provided", async () => {
    const { orderId, totalPrice } = await createOrder();

    const res = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ order: orderId, paymentMethod: "card" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.amount).toBe(totalPrice);
    expect(res.body.data.order).toBeDefined();
  });

  it("returns 404 when the provided orderId does not exist", async () => {
    const res = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ order: "000000000000000000000000", paymentMethod: "card" });

    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when amount is missing and no orderId provided", async () => {
    const res = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ paymentMethod: "card" });

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for an invalid payment method", async () => {
    const res = await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 10, paymentMethod: "crypto" });

    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/payments/me
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/payments/me", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/payments/me");
    expect(res.statusCode).toBe(401);
  });

  it("returns only the authenticated user's payments", async () => {
    await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 10, paymentMethod: "card" });

    await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 20, paymentMethod: "cash" });

    await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ amount: 30, paymentMethod: "card" });

    const res = await request(app).get("/api/payments/me").set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it("returns an empty list when the user has no payments", async () => {
    const res = await request(app).get("/api/payments/me").set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/payments
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/payments", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/payments");
    expect(res.statusCode).toBe(401);
  });

  it("returns 403 when customer tries to access all payments", async () => {
    const res = await request(app).get("/api/payments").set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 when staff tries to access all payments", async () => {
    const res = await request(app).get("/api/payments").set("Authorization", `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("admin can retrieve all payments", async () => {
    await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ amount: 10, paymentMethod: "card" });

    await request(app)
      .post("/api/payments/process")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ amount: 20, paymentMethod: "cash" });

    const res = await request(app).get("/api/payments").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });
});
