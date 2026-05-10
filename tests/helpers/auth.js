const request = require("supertest");
const app = require("../../src/app");

const registerAndLogin = async ({ name, email, password, roles }) => {
  await request(app).post("/api/users/register").send({ name, email, password, roles });
  const res = await request(app).post("/api/users/login").send({ email, password });
  return res.body.token;
};

module.exports = { registerAndLogin };
