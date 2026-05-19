// Set required env vars before any module (including app.js) is loaded.
// dotenv will not override these since they are already set.
process.env.JWT_SECRET = "test-jwt-secret-key";           // Fake secret key for signing test tokens
process.env.JWT_EXPIRES = "1d";                           // Test tokens expire in 1 day
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key"; // Fake secret key for signing test refresh tokens
process.env.JWT_REFRESH_EXPIRES = "7d";                   // Test refresh tokens expire in 7 days