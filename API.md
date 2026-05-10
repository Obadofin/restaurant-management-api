# API Documentation

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Categories](#categories)
- [Menu](#menu)
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

## Role Permissions

| Endpoint              | customer | staff | admin |
| --------------------- | -------- | ----- | ----- |
| Register / Login      | ✅       | ✅    | ✅    |
| GET categories / menu | ✅       | ✅    | ✅    |
| POST / PUT categories | ❌       | ✅    | ✅    |
| POST / PUT menu items | ❌       | ✅    | ✅    |
| DELETE categories     | ❌       | ❌    | ✅    |
| DELETE menu items     | ❌       | ❌    | ✅    |

---

## Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "Error description"
}
```

| Status | Meaning                        |
| ------ | ------------------------------ |
| 400    | Bad request / validation error |
| 401    | Missing or invalid token       |
| 403    | Forbidden — insufficient role  |
| 404    | Resource not found             |
| 500    | Internal server error          |
