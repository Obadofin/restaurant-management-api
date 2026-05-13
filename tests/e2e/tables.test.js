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

afterEach(() => db.clearCollections("tables"));

afterAll(() => db.disconnect());

const baseTable = { tableNumber: 1, capacity: 4, location: "indoor" };

// ══════════════════════════════════════════════════════════════════════════
// GET /api/tables
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/tables", () => {
  it("returns 200 with an empty list when no tables exist", async () => {
    const res = await request(app).get("/api/tables");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it("returns tables sorted by tableNumber ascending", async () => {
    await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send({ tableNumber: 3, capacity: 6 });
    await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send({ tableNumber: 1, capacity: 2 });

    const res = await request(app).get("/api/tables");
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].tableNumber).toBe(1);
    expect(res.body.data[1].tableNumber).toBe(3);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/tables/:id
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/tables/:id", () => {
  it("returns 200 with the table", async () => {
    const created = await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send(baseTable);
    const id = created.body.data._id;

    const res = await request(app).get(`/api/tables/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.tableNumber).toBe(1);
    expect(res.body.data.location).toBe("indoor");
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await request(app).get("/api/tables/000000000000000000000000");
    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// POST /api/tables
// ══════════════════════════════════════════════════════════════════════════
describe("POST /api/tables", () => {
  it("returns 401 when no token is provided", async () => {
    const res = await request(app).post("/api/tables").send(baseTable);
    expect(res.statusCode).toBe(401);
  });

  it("returns 403 when a staff tries to create a table", async () => {
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${staffToken}`).send(baseTable);
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 when a customer tries to create a table", async () => {
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${customerToken}`).send(baseTable);
    expect(res.statusCode).toBe(403);
  });

  it("allows admin to create a table and defaults status to available", async () => {
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send(baseTable);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tableNumber).toBe(1);
    expect(res.body.data.capacity).toBe(4);
    expect(res.body.data.status).toBe("available");
  });

  it("returns 400 on duplicate table number", async () => {
    await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send(baseTable);
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send(baseTable);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 on validation failure (missing capacity)", async () => {
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send({ tableNumber: 1 });
    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/tables/:id
// ══════════════════════════════════════════════════════════════════════════
describe("PUT /api/tables/:id", () => {
  let tableId;

  beforeEach(async () => {
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send(baseTable);
    tableId = res.body.data._id;
  });

  it("allows admin to update capacity", async () => {
    const res = await request(app).put(`/api/tables/${tableId}`).set("Authorization", `Bearer ${adminToken}`).send({ capacity: 8 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.capacity).toBe(8);
  });

  it("allows staff to update status", async () => {
    const res = await request(app).put(`/api/tables/${tableId}`).set("Authorization", `Bearer ${staffToken}`).send({ status: "maintenance" });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("maintenance");
  });

  it("returns 403 when customer tries to update", async () => {
    const res = await request(app).put(`/api/tables/${tableId}`).set("Authorization", `Bearer ${customerToken}`).send({ capacity: 2 });
    expect(res.statusCode).toBe(403);
  });

  it("returns 404 for a non-existent table", async () => {
    const res = await request(app).put("/api/tables/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`).send({ capacity: 2 });
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 if body is empty", async () => {
    const res = await request(app).put(`/api/tables/${tableId}`).set("Authorization", `Bearer ${adminToken}`).send({});
    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// DELETE /api/tables/:id
// ══════════════════════════════════════════════════════════════════════════
describe("DELETE /api/tables/:id", () => {
  let tableId;

  beforeEach(async () => {
    const res = await request(app).post("/api/tables").set("Authorization", `Bearer ${adminToken}`).send(baseTable);
    tableId = res.body.data._id;
  });

  it("returns 401 when no token is provided", async () => {
    const res = await request(app).delete(`/api/tables/${tableId}`);
    expect(res.statusCode).toBe(401);
  });

  it("returns 403 when staff tries to delete", async () => {
    const res = await request(app).delete(`/api/tables/${tableId}`).set("Authorization", `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("returns 403 when customer tries to delete", async () => {
    const res = await request(app).delete(`/api/tables/${tableId}`).set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("allows admin to delete a table", async () => {
    const res = await request(app).delete(`/api/tables/${tableId}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({});
  });

  it("returns 404 for a non-existent table", async () => {
    const res = await request(app).delete("/api/tables/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
