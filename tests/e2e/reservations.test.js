const request = require("supertest");
const app = require("../../src/app");
const db = require("../helpers/db");
const { registerAndLogin } = require("../helpers/auth");

let adminToken, staffToken, customerToken, customer2Token;

beforeAll(async () => {
  await db.connect();
  adminToken = await registerAndLogin({ name: "Admin", email: "admin@test.com", password: "password123", roles: ["admin"] });
  staffToken = await registerAndLogin({ name: "Staff", email: "staff@test.com", password: "password123", roles: ["staff"] });
  customerToken = await registerAndLogin({ name: "Customer", email: "customer@test.com", password: "password123" });
  customer2Token = await registerAndLogin({ name: "Customer2", email: "customer2@test.com", password: "password123" });
});

afterEach(() => db.clearCollections("reservations", "tables"));

afterAll(() => db.disconnect());

const FUTURE_DATE = "2027-06-15";

const createTable = async () => {
  const res = await request(app)
    .post("/api/tables")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ tableNumber: 1, capacity: 4 });
  return res.body.data._id;
};

const makeReservation = (token, tableId, overrides = {}) =>
  request(app)
    .post("/api/reservations")
    .set("Authorization", `Bearer ${token}`)
    .send({ table: tableId, date: FUTURE_DATE, time: "19:00", partySize: 2, ...overrides });

// ══════════════════════════════════════════════════════════════════════════
// POST /api/reservations
// ══════════════════════════════════════════════════════════════════════════
describe("POST /api/reservations", () => {
  it("returns 401 when not authenticated", async () => {
    const tableId = await createTable();
    const res = await request(app)
      .post("/api/reservations")
      .send({ table: tableId, date: FUTURE_DATE, time: "19:00", partySize: 2 });
    expect(res.statusCode).toBe(401);
  });

  it("customer can create a reservation with status pending", async () => {
    const tableId = await createTable();
    const res = await makeReservation(customerToken, tableId);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("pending");
    expect(res.body.data.partySize).toBe(2);
  });

  it("returns 404 if table does not exist", async () => {
    const res = await makeReservation(customerToken, "000000000000000000000000");
    expect(res.statusCode).toBe(404);
  });

  it("returns 409 on double-booking (same table, date, and time)", async () => {
    const tableId = await createTable();
    await makeReservation(customerToken, tableId);
    const res = await makeReservation(customerToken, tableId);
    expect(res.statusCode).toBe(409);
  });

  it("allows the same table at a different time", async () => {
    const tableId = await createTable();
    await makeReservation(customerToken, tableId, { time: "19:00" });
    const res = await makeReservation(customerToken, tableId, { time: "21:00" });
    expect(res.statusCode).toBe(201);
  });

  it("returns 400 on validation failure (missing partySize)", async () => {
    const tableId = await createTable();
    const res = await request(app)
      .post("/api/reservations")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ table: tableId, date: FUTURE_DATE, time: "19:00" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if time format is invalid", async () => {
    const tableId = await createTable();
    const res = await makeReservation(customerToken, tableId, { time: "7pm" });
    expect(res.statusCode).toBe(400);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/reservations
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/reservations", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get("/api/reservations");
    expect(res.statusCode).toBe(401);
  });

  it("customer sees only their own reservations", async () => {
    const tableId = await createTable();
    await makeReservation(customerToken, tableId, { time: "18:00" });
    await makeReservation(customer2Token, tableId, { time: "20:00" });

    const res = await request(app).get("/api/reservations").set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it("admin sees all reservations", async () => {
    const tableId = await createTable();
    await makeReservation(customerToken, tableId, { time: "18:00" });
    await makeReservation(customer2Token, tableId, { time: "20:00" });

    const res = await request(app).get("/api/reservations").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("staff sees all reservations", async () => {
    const tableId = await createTable();
    await makeReservation(customerToken, tableId, { time: "18:00" });

    const res = await request(app).get("/api/reservations").set("Authorization", `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// GET /api/reservations/:id
// ══════════════════════════════════════════════════════════════════════════
describe("GET /api/reservations/:id", () => {
  it("customer can view their own reservation", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app).get(`/api/reservations/${id}`).set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data._id).toBe(id);
  });

  it("returns 403 when customer tries to view another customer's reservation", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app).get(`/api/reservations/${id}`).set("Authorization", `Bearer ${customer2Token}`);
    expect(res.statusCode).toBe(403);
  });

  it("admin can view any reservation", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app).get(`/api/reservations/${id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it("returns 404 for a non-existent reservation", async () => {
    const res = await request(app).get("/api/reservations/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// PUT /api/reservations/:id/status
// ══════════════════════════════════════════════════════════════════════════
describe("PUT /api/reservations/:id/status", () => {
  it("returns 403 when customer tries to update status", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/reservations/${id}/status`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ status: "confirmed" });
    expect(res.statusCode).toBe(403);
  });

  it("staff can confirm a reservation and table status becomes reserved", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/reservations/${id}/status`)
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ status: "confirmed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("confirmed");

    const tableRes = await request(app).get(`/api/tables/${tableId}`);
    expect(tableRes.body.data.status).toBe("reserved");
  });

  it("cancelling a reservation reverts table status to available", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    await request(app)
      .put(`/api/reservations/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "confirmed" });

    const res = await request(app)
      .put(`/api/reservations/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "cancelled" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe("cancelled");

    const tableRes = await request(app).get(`/api/tables/${tableId}`);
    expect(tableRes.body.data.status).toBe("available");
  });

  it("returns 400 for an invalid status value", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app)
      .put(`/api/reservations/${id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "invalid-status" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for a non-existent reservation", async () => {
    const res = await request(app)
      .put("/api/reservations/000000000000000000000000/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "confirmed" });
    expect(res.statusCode).toBe(404);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// DELETE /api/reservations/:id
// ══════════════════════════════════════════════════════════════════════════
describe("DELETE /api/reservations/:id", () => {
  it("returns 403 when customer tries to delete", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app).delete(`/api/reservations/${id}`).set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it("admin can delete a reservation", async () => {
    const tableId = await createTable();
    const created = await makeReservation(customerToken, tableId);
    const id = created.body.data._id;

    const res = await request(app).delete(`/api/reservations/${id}`).set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual({});
  });

  it("returns 404 for a non-existent reservation", async () => {
    const res = await request(app).delete("/api/reservations/000000000000000000000000").set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
