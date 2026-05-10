# Restaurant Management API

A RESTful API for managing a restaurant — built with **Node.js**, **Express 5**, **MongoDB (Mongoose)**, and **JWT** authentication.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

---

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server (with hot-reload)
yarn dev

# Start production server
yarn start
```

Server runs on `http://localhost:5000` by default.

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/restaurant-management-db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1d
JWT_REFRESH_SECRET=your_refresh_jwt_secret
JWT_REFRESH_EXPIRES=30d
```

---

## API Documentation

Full API reference — endpoints, request/response shapes, auth requirements, and role permissions — is documented in [API.md](API.md).
