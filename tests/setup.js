// Set required env vars before any module (including app.js) is loaded.
// dotenv will not override these since they are already set.
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.JWT_EXPIRES = "1d";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.JWT_REFRESH_EXPIRES = "7d";
