# Order Module Documentation
**Restaurant Management API — Feature Branch: `feature/order-module`**

---

## Overview

The Order Module handles the full lifecycle of customer orders — from creation and validation through to status progression and retrieval. It is built on Express.js with Mongoose for MongoDB and uses `express-validator` for request validation.

---

## Folder Structure

```
├── models/
│   ├── Order.js          # Order schema + business logic
│   └── MenuItem.js       # Temporary stub — replace with Menu module's model
├── controllers/
│   └── orderController.js
├── services/
│   └── orderService.js
├── routes/
│   └── orderRoutes.js
├── middleware/
│   ├── errorHandler.js   # Temporary — replace with Auth module's version
│   └── validate.js
└── app.js
```

---

## Data Model

### Order Schema (`models/Order.js`)

| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId (ref: User) | Required. Set from `req.user._id` |
| `items` | Array of orderItemSchema | At least one item required |
| `totalPrice` | Number | **Auto-calculated. Never set manually.** |
| `status` | String (enum) | Default: `pending` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### Order Item Sub-Schema

| Field | Type | Notes |
|-------|------|-------|
| `menuItemId` | ObjectId (ref: MenuItem) | Required |
| `name` | String | Snapshot of name at order time |
| `quantity` | Number | Min: 1 |
| `unitPrice` | Number | Snapshot of price at order time |
| `subTotal` | Number | Auto-calculated by pre-save hook |

> **Why snapshot name and price?** Menu prices can change. Storing them at order time ensures the order always reflects what the customer actually paid.

---

## Status Transitions

Allowed transitions are enforced by the model. Invalid transitions throw a `400` error.

```
pending ──► preparing ──► completed
   │
   └──────────────────────────────► cancelled
              │
              └───────────────────► cancelled
```

| From | To (allowed) |
|------|-------------|
| pending | preparing, cancelled |
| preparing | completed, cancelled |
| completed | _(none)_ |
| cancelled | _(none)_ |

---

## API Endpoints

### Base URL: `/api/orders`

---

### POST `/api/orders`
**Create a new order**

- Auth: Required (any authenticated user)
- Request body:
```json
{
  "items": [
    { "menuItemId": "<ObjectId>", "quantity": 2 }
  ]
}
```
- Notes: `totalPrice` and `status` cannot be set manually. The service validates each item exists and is available in the menu, then enriches the items with current name and price from the database.
- Response `201`:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": { ...order }
}
```

---

### GET `/api/orders/me`
**Get the authenticated user's orders**

- Auth: Required
- Returns all orders belonging to `req.user._id`, sorted newest first.
- Response `200`:
```json
{
  "success": true,
  "count": 2,
  "data": [ ...orders ]
}
```

---

### PATCH `/api/orders/:id/status`
**Update order status**

- Auth: Required — **Admin only**
- Request body:
```json
{ "status": "preparing" }
```
- Enforces valid status transitions. Returns `400` if transition is not allowed.
- Response `200`:
```json
{
  "success": true,
  "message": "Order status updated to \"preparing\"",
  "data": { ...order }
}
```

---

### GET `/api/orders/admin/orders`
**Get all orders (admin)**

- Auth: Required — **Admin only**
- Response `200`:
```json
{
  "success": true,
  "count": 10,
  "data": [ ...orders ]
}
```

---

## Validation Rules

| Endpoint | Rules |
|----------|-------|
| POST `/api/orders` | `items` must be a non-empty array; each item must have a valid `menuItemId` (MongoId) and `quantity` (integer ≥ 1); `totalPrice` and `status` are blocked |
| PATCH `/:id/status` | `id` must be a valid MongoId; `status` must be one of the allowed enum values |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Validation errors (422) include a field-level breakdown:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "items", "message": "items must be a non-empty array" }
  ]
}
```

---

## Integration Notes for Teammates

### Auth Module
The routes currently use a **temporary `protect` stub** that fakes a logged-in admin user. When the Auth module is ready, replace the stub in `routes/orderRoutes.js` with the real `protect` and `restrictTo` middleware:

```js
// Remove this:
const protect = (req, res, next) => {
  req.user = { _id: "64f1b2c3d4e5f6a7b8c9d0e1", role: "admin" };
  next();
};

// Replace with:
const { protect, restrictTo } = require('../middleware/auth');
```

### Menu Module
`models/MenuItem.js` is a **temporary stub**. The Order Service expects the MenuItem model to have these fields:

| Field | Type | Required |
|-------|------|----------|
| `name` | String | Yes |
| `price` | Number | Yes |
| `isAvailable` | Boolean | Yes |

When the Menu module is merged, delete `models/MenuItem.js` and update the import in `services/orderService.js` to point to the correct path.

### Error Handler
`middleware/errorHandler.js` is a temporary version. When the Auth module's error handler is available and merged, remove this file and update the import in `app.js`.

---

## Dependencies

```json
{
  "express": "^4.x",
  "mongoose": "^7.x",
  "express-validator": "^7.x",
  "dotenv": "^16.x"
}
```

---

## Environment Variables

Create a `.env` file (see `.env.example`):

```
PORT=4000
MONGO_URI=<your MongoDB connection string>
```