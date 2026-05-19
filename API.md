# API Documentation

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Categories](#categories)
- [Menu](#menu)
- [Orders](#orders)
- [Tables](#tables)
- [Reservations](#reservations)
- [Payments](#payments)
- [Role Permissions](#role-permissions)
- [Error Responses](#error-responses)

---

## Authentication

Protected endpoints require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Obtain a token by logging in via `POST /api/users/login`.

---

## Users

### Register a new user

```
POST /api/users/register
```

**Request Body**

| Field    | Type     | Required | Description                                                              |
| -------- | -------- | -------- | ------------------------------------------------------------------------ |
| name     | string   | Yes      | Min 3, max 50 characters                                                 |
| email    | string   | Yes      | Valid email address                                                      |
| password | string   | Yes      | Min 6, max 20 characters                                                 |
| roles    | string[] | No       | One or more of: `customer`, `admin`, `staff`. Defaults to `["customer"]` |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "Admin User",
    "email": "admin@example.com",
    "roles": ["admin"]
  }
}
```

---

### Login

```
POST /api/users/login
```

**Request Body**

| Field    | Type   | Required |
| -------- | ------ | -------- |
| email    | string | Yes      |
| password | string | Yes      |

**Response `200`**

```json
{
  "success": true,
  "token": "<access_token>",
  "refreshToken": "<refresh_token>"
}
```

---

## Categories

### Get all categories

```
GET /api/categories
```

Public — no authentication required.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "Main Course",
      "description": "Hearty main dishes",
      "createdAt": "2026-05-10T10:00:00.000Z",
      "updatedAt": "2026-05-10T10:00:00.000Z"
    }
  ]
}
```

---

### Get category by ID

```
GET /api/categories/:id
```

Public — no authentication required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "Main Course",
    "description": "Hearty main dishes",
    "createdAt": "2026-05-10T10:00:00.000Z",
    "updatedAt": "2026-05-10T10:00:00.000Z"
  }
}
```

---

### Create a category

```
POST /api/categories
```

Requires auth. Roles: `admin`, `staff`.

**Request Body**

| Field       | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| name        | string | Yes      | Min 2, max 50 characters. Must be unique |
| description | string | No       | Max 255 characters                       |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "Desserts",
    "description": "Sweet endings",
    "createdAt": "2026-05-10T10:00:00.000Z",
    "updatedAt": "2026-05-10T10:00:00.000Z"
  }
}
```

---

### Update a category

```
PUT /api/categories/:id
```

Requires auth. Roles: `admin`, `staff`.

**Request Body** — at least one field required

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| name        | string | Min 2, max 50 characters |
| description | string | Max 255 characters       |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Delete a category

```
DELETE /api/categories/:id
```

Requires auth. Roles: `admin` only.

**Response `200`**

```json
{
  "success": true,
  "message": "Category deleted"
}
```

---

## Menu

### Get all menu items

```
GET /api/menu
GET /api/menu?category=<categoryId>
```

Public — no authentication required. Optionally filter by `category` (MongoDB ObjectId).

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0e",
      "name": "Grilled Salmon",
      "description": "Fresh Atlantic salmon with herbs",
      "price": 18.99,
      "category": {
        "_id": "664f1a2b3c4d5e6f7a8b9c0d",
        "name": "Main Course",
        "description": "Hearty main dishes"
      },
      "isAvailable": true,
      "image": "https://example.com/salmon.jpg",
      "createdAt": "2026-05-10T10:00:00.000Z",
      "updatedAt": "2026-05-10T10:00:00.000Z"
    }
  ]
}
```

---

### Get menu item by ID

```
GET /api/menu/:id
```

Public — no authentication required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0e",
    "name": "Grilled Salmon",
    "description": "Fresh Atlantic salmon with herbs",
    "price": 18.99,
    "category": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "Main Course"
    },
    "isAvailable": true,
    "image": "https://example.com/salmon.jpg",
    "createdAt": "2026-05-10T10:00:00.000Z",
    "updatedAt": "2026-05-10T10:00:00.000Z"
  }
}
```

---

### Create a menu item

```
POST /api/menu
```

Requires auth. Roles: `admin`, `staff`.

**Request Body**

| Field       | Type    | Required | Description                                    |
| ----------- | ------- | -------- | ---------------------------------------------- |
| name        | string  | Yes      | Min 2, max 100 characters                      |
| description | string  | No       | Max 500 characters                             |
| price       | number  | Yes      | Must be >= 0                                   |
| category    | string  | Yes      | Valid MongoDB ObjectId of an existing category |
| isAvailable | boolean | No       | Defaults to `true`                             |
| image       | string  | No       | Must be a valid URI                            |

**Response `201`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update a menu item

```
PUT /api/menu/:id
```

Requires auth. Roles: `admin`, `staff`.

**Request Body** — at least one field required

| Field       | Type    | Description                                    |
| ----------- | ------- | ---------------------------------------------- |
| name        | string  | Min 2, max 100 characters                      |
| description | string  | Max 500 characters                             |
| price       | number  | Must be >= 0                                   |
| category    | string  | Valid MongoDB ObjectId of an existing category |
| isAvailable | boolean | Toggle item availability                       |
| image       | string  | Must be a valid URI                            |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Delete a menu item

```
DELETE /api/menu/:id
```

Requires auth. Roles: `admin` only.

**Response `200`**

```json
{
  "success": true,
  "message": "Menu item deleted"
}
```

---

## Orders

### Place an order

```
POST /api/orders
```

Requires auth. Any authenticated user.

**Request Body**

| Field | Type    | Required | Description                              |
| ----- | ------- | -------- | ---------------------------------------- |
| items | array   | Yes      | At least one item                        |
| items[].menuItemId | string | Yes | Valid MongoDB ObjectId of a menu item |
| items[].quantity   | number | Yes | Integer, min 1                        |

**Response `201`**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c10",
    "user": "664f1a2b3c4d5e6f7a8b9c0d",
    "items": [
      {
        "menuItem": { "_id": "664f1a2b3c4d5e6f7a8b9c0e", "name": "Grilled Salmon", "price": 18.99 },
        "quantity": 2,
        "price": 18.99
      }
    ],
    "totalPrice": 37.98,
    "status": "pending",
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  }
}
```

---

### Get my orders

```
GET /api/orders/me
```

Requires auth. Returns orders belonging to the authenticated user.

**Response `200`**

```json
{
  "success": true,
  "count": 1,
  "data": [ { ... } ]
}
```

---

### Get all orders

```
GET /api/orders/admin
```

Requires auth. Roles: `admin`, `staff`. Returns all orders in the system.

**Response `200`**

```json
{
  "success": true,
  "count": 5,
  "data": [ { ... } ]
}
```

---

### Update order status

```
PATCH /api/orders/:id/status
```

Requires auth. Roles: `admin`, `staff`.

**Request Body**

| Field  | Type   | Required | Description                                                  |
| ------ | ------ | -------- | ------------------------------------------------------------ |
| status | string | Yes      | One of: `pending`, `preparing`, `completed`, `cancelled`     |

Status transitions are enforced — only valid progressions are accepted (e.g. `pending → preparing`, not `completed → pending`).

**Response `200`**

```json
{
  "success": true,
  "message": "Order status updated to preparing",
  "data": { ... }
}
```

---

## Tables

### Get all tables

```
GET /api/tables
```

Public — no authentication required. Results sorted by `tableNumber` ascending.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c11",
      "tableNumber": 1,
      "capacity": 4,
      "status": "available",
      "location": "indoor",
      "createdAt": "2026-05-19T10:00:00.000Z",
      "updatedAt": "2026-05-19T10:00:00.000Z"
    }
  ]
}
```

---

### Get table by ID

```
GET /api/tables/:id
```

Public — no authentication required.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c11",
    "tableNumber": 1,
    "capacity": 4,
    "status": "available",
    "location": "indoor",
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  }
}
```

---

### Create a table

```
POST /api/tables
```

Requires auth. Roles: `admin` only.

**Request Body**

| Field       | Type   | Required | Description                                                        |
| ----------- | ------ | -------- | ------------------------------------------------------------------ |
| tableNumber | number | Yes      | Integer, min 1. Must be unique                                     |
| capacity    | number | Yes      | Integer, min 1                                                     |
| status      | string | No       | One of: `available`, `occupied`, `reserved`, `maintenance`. Defaults to `available` |
| location    | string | No       | Max 100 characters (e.g. `"indoor"`, `"outdoor"`, `"private"`)    |

**Response `201`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Update a table

```
PUT /api/tables/:id
```

Requires auth. Roles: `admin`, `staff`. At least one field required.

**Request Body**

| Field       | Type   | Description                                                  |
| ----------- | ------ | ------------------------------------------------------------ |
| tableNumber | number | Integer, min 1. Must be unique                               |
| capacity    | number | Integer, min 1                                               |
| status      | string | One of: `available`, `occupied`, `reserved`, `maintenance`   |
| location    | string | Max 100 characters                                           |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Delete a table

```
DELETE /api/tables/:id
```

Requires auth. Roles: `admin` only. Returns `409 Conflict` if the table has active (`pending` or `confirmed`) reservations.

**Response `200`**

```json
{
  "success": true,
  "data": {}
}
```

---

## Reservations

### Get all reservations

```
GET /api/reservations
```

Requires auth. `admin` and `staff` see all reservations; `customer` sees only their own. Results sorted by `date` and `time` ascending.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c12",
      "customer": { "_id": "...", "name": "John Customer", "email": "john@example.com" },
      "table": { "_id": "...", "tableNumber": 6, "capacity": 6, "location": "outdoor" },
      "date": "2027-06-15T00:00:00.000Z",
      "time": "19:00",
      "partySize": 5,
      "status": "confirmed",
      "specialRequests": "Window seat preferred",
      "createdAt": "2026-05-19T10:00:00.000Z",
      "updatedAt": "2026-05-19T10:00:00.000Z"
    }
  ]
}
```

---

### Get reservation by ID

```
GET /api/reservations/:id
```

Requires auth. `customer` receives `403` if the reservation belongs to a different user.

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Create a reservation

```
POST /api/reservations
```

Requires auth. Any authenticated user. The `customer` field is set automatically from the token. Returns `409 Conflict` if the same table is already reserved (status `pending` or `confirmed`) for the same date and time.

**Request Body**

| Field           | Type   | Required | Description                              |
| --------------- | ------ | -------- | ---------------------------------------- |
| table           | string | Yes      | Valid MongoDB ObjectId of an existing table |
| date            | string | Yes      | ISO 8601 date (e.g. `"2027-06-15"`)      |
| time            | string | Yes      | `HH:MM` format (e.g. `"19:00"`)          |
| partySize       | number | Yes      | Integer, min 1                           |
| specialRequests | string | No       | Max 500 characters                       |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c12",
    "customer": { "_id": "...", "name": "John Customer", "email": "john@example.com" },
    "table": { "_id": "...", "tableNumber": 6, "capacity": 6, "location": "outdoor" },
    "date": "2027-06-15T00:00:00.000Z",
    "time": "19:00",
    "partySize": 5,
    "status": "pending",
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  }
}
```

---

### Update reservation status

```
PUT /api/reservations/:id/status
```

Requires auth. Roles: `admin`, `staff`. Automatically syncs the linked table's status: confirming a reservation sets the table to `reserved`; cancelling sets it back to `available` if no other active reservations exist.

**Request Body**

| Field  | Type   | Required | Description                                         |
| ------ | ------ | -------- | --------------------------------------------------- |
| status | string | Yes      | One of: `pending`, `confirmed`, `cancelled`         |

**Response `200`**

```json
{
  "success": true,
  "data": { ... }
}
```

---

### Delete a reservation

```
DELETE /api/reservations/:id
```

Requires auth. Roles: `admin` only.

**Response `200`**

```json
{
  "success": true,
  "data": {}
}
```

---

## Payments

### Process a payment

```
POST /api/payments/process
```

Requires auth. Any authenticated user. If an `order` ID is provided, the `amount` is taken from the order's `totalPrice` (any `amount` in the body is ignored). If no order is provided, `amount` is required. Every successful payment generates a unique `transactionId`.

**Request Body**

| Field         | Type   | Required              | Description                                         |
| ------------- | ------ | --------------------- | --------------------------------------------------- |
| order         | string | No                    | Valid MongoDB ObjectId of an existing order         |
| amount        | number | Required if no `order` | Minimum `0.01`                                    |
| paymentMethod | string | Yes                   | One of: `card`, `cash`                              |

**Response `201`**

```json
{
  "success": true,
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c13",
    "user": { "_id": "...", "name": "John Customer", "email": "john@example.com" },
    "order": { "_id": "...", "status": "completed", "totalPrice": 37.98 },
    "amount": 37.98,
    "paymentMethod": "card",
    "status": "success",
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "processedAt": "2026-05-19T10:00:00.000Z",
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  }
}
```

---

### Get my payments

```
GET /api/payments/me
```

Requires auth. Returns all payments made by the authenticated user, sorted by `processedAt` descending.

**Response `200`**

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

### Get all payments

```
GET /api/payments
```

Requires auth. Roles: `admin` only. Returns all payments, sorted by `processedAt` descending.

**Response `200`**

```json
{
  "success": true,
  "data": [ { ... } ]
}
```

---

## Role Permissions

| Endpoint                       | customer | staff | admin |
| ------------------------------ | -------- | ----- | ----- |
| Register / Login               | ✅       | ✅    | ✅    |
| GET categories / menu          | ✅       | ✅    | ✅    |
| GET tables                     | ✅       | ✅    | ✅    |
| POST / PUT categories          | ❌       | ✅    | ✅    |
| POST / PUT menu items          | ❌       | ✅    | ✅    |
| PUT tables                     | ❌       | ✅    | ✅    |
| GET reservations               | own only | ✅    | ✅    |
| POST orders                    | ✅       | ✅    | ✅    |
| POST reservations              | ✅       | ✅    | ✅    |
| POST payments/process          | ✅       | ✅    | ✅    |
| GET orders/me                  | ✅       | ✅    | ✅    |
| GET payments/me                | ✅       | ✅    | ✅    |
| PATCH orders/:id/status        | ❌       | ✅    | ✅    |
| PUT reservations/:id/status    | ❌       | ✅    | ✅    |
| GET orders/admin               | ❌       | ✅    | ✅    |
| POST tables                    | ❌       | ❌    | ✅    |
| DELETE categories              | ❌       | ❌    | ✅    |
| DELETE menu items              | ❌       | ❌    | ✅    |
| DELETE tables                  | ❌       | ❌    | ✅    |
| DELETE reservations            | ❌       | ❌    | ✅    |
| GET payments (all)             | ❌       | ❌    | ✅    |

---

## Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| 400    | Bad request / validation error                              |
| 401    | Missing or invalid token                                    |
| 403    | Forbidden — insufficient role or resource ownership         |
| 404    | Resource not found                                          |
| 409    | Conflict — duplicate entry or active reservations exist     |
| 500    | Internal server error                                       |
