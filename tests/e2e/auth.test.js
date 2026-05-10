const request = require("supertest");
const app = require("../../src/app");
const db = require("../helpers/db");

beforeAll(() => db.connect());
afterEach(() => db.clearAllCollections());
afterAll(() => db.disconnect());

const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

describe("POST /api/users/register", () => {
  it("registers a new user and returns 201", async () => {
    const res = await request(app).post("/api/users/register").send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.roles).toEqual(["customer"]);
  });

  it("assigns provided roles on registration", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, roles: ["admin"] });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.roles).toContain("admin");
  });

  it("returns 400 if email is already in use", async () => {
    await request(app).post("/api/users/register").send(validUser);
    const res = await request(app).post("/api/users/register").send(validUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 if name is missing", async () => {
    const res = await request(app).post("/api/users/register").send({ email: validUser.email, password: validUser.password });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if password is too short", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, password: "123" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if email is invalid", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, email: "not-an-email" });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 if role is invalid", async () => {
    const res = await request(app)
      .post("/api/users/register")
      .send({ ...validUser, roles: ["superuser"] });
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /api/users/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/users/register").send(validUser);
  });

  it("returns 200 with access and refresh tokens on valid credentials", async () => {
    const res = await request(app).post("/api/users/login").send({ email: validUser.email, password: validUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app).post("/api/users/login").send({ email: validUser.email, password: "wrongpass" });
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    const res = await request(app).post("/api/users/login").send({ email: "ghost@example.com", password: "password123" });
    expect(res.statusCode).toBe(401);
  });
});
