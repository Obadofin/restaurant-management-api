# Restaurant Management API Documentation

> Note: The current repository snapshot contains only `README.md` and no source code, route definitions, or implementation files were available. This document provides a standard API documentation template for the project and can be completed once the actual API source code is added.

## 1. Overview

The Restaurant Management API is intended to support operations for managing restaurants, menus, orders, staff, and customer data. Typical responsibilities include:

- Restaurant creation and management
- Menu and item management
- Order creation, tracking, and updates
- Staff and role management
- Customer lookup and history

## 2. Base URL

`https://api.example.com/v1`

> Replace with the actual deployment URL when available.

## 3. Authentication

### Authorization

All endpoints should require authentication via HTTP headers, typically using Bearer tokens:

```
Authorization: Bearer <token>
```

### Common response codes

- `200 OK` - Request succeeded
- `201 Created` - Resource successfully created
- `204 No Content` - Request succeeded with no response body
- `400 Bad Request` - Invalid request or missing parameters
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 4. Standard API Resource Patterns

### Restaurants

- `GET /restaurants` - List all restaurants
- `POST /restaurants` - Create a new restaurant
- `GET /restaurants/{restaurantId}` - Get details for a specific restaurant
- `PUT /restaurants/{restaurantId}` - Update restaurant information
- `DELETE /restaurants/{restaurantId}` - Delete a restaurant

### Menus

- `GET /restaurants/{restaurantId}/menus` - List menus for a restaurant
- `POST /restaurants/{restaurantId}/menus` - Create a new menu
- `GET /menus/{menuId}` - Get menu details
- `PUT /menus/{menuId}` - Update a menu
- `DELETE /menus/{menuId}` - Delete a menu

### Menu Items

- `GET /menus/{menuId}/items` - List menu items
- `POST /menus/{menuId}/items` - Create a menu item
- `GET /items/{itemId}` - Get item details
- `PUT /items/{itemId}` - Update an item
- `DELETE /items/{itemId}` - Delete an item

### Orders

- `GET /orders` - List all orders
- `POST /orders` - Create a new order
- `GET /orders/{orderId}` - Get order details
- `PUT /orders/{orderId}` - Update order status or details
- `DELETE /orders/{orderId}` - Cancel or remove an order

### Staff and Users

- `GET /staff` - List all staff members
- `POST /staff` - Add a new staff member
- `GET /staff/{staffId}` - Get staff details
- `PUT /staff/{staffId}` - Update staff information
- `DELETE /staff/{staffId}` - Remove a staff member

## 5. Example Request and Response Schemas

### Create Restaurant

**Request**

```json
{
  "name": "Sunrise Diner",
  "address": "123 Main Street",
  "phone": "+1-555-0123",
  "email": "contact@sunrisediner.com",
  "openingHours": "08:00-22:00"
}
```

**Response**

```json
{
  "id": "restaurant_123",
  "name": "Sunrise Diner",
  "address": "123 Main Street",
  "phone": "+1-555-0123",
  "email": "contact@sunrisediner.com",
  "openingHours": "08:00-22:00",
  "createdAt": "2026-05-17T10:00:00Z"
}
```

### Create Order

**Request**

```json
{
  "restaurantId": "restaurant_123",
  "customerId": "customer_456",
  "items": [
    { "itemId": "item_1", "quantity": 2 },
    { "itemId": "item_2", "quantity": 1 }
  ],
  "totalAmount": 39.50,
  "notes": "Extra napkins"
}
```

**Response**

```json
{
  "id": "order_789",
  "restaurantId": "restaurant_123",
  "customerId": "customer_456",
  "items": [
    { "itemId": "item_1", "quantity": 2, "price": 12.00 },
    { "itemId": "item_2", "quantity": 1, "price": 15.50 }
  ],
  "totalAmount": 39.50,
  "status": "pending",
  "createdAt": "2026-05-17T10:05:00Z"
}
```

## 6. Data Models

### Restaurant

- `id` (string)
- `name` (string)
- `address` (string)
- `phone` (string)
- `email` (string)
- `openingHours` (string)
- `createdAt` (string)
- `updatedAt` (string)

### Menu

- `id` (string)
- `restaurantId` (string)
- `name` (string)
- `description` (string)
- `items` (array)
- `createdAt` (string)
- `updatedAt` (string)

### Menu Item

- `id` (string)
- `menuId` (string)
- `name` (string)
- `description` (string)
- `price` (number)
- `available` (boolean)
- `createdAt` (string)
- `updatedAt` (string)

### Order

- `id` (string)
- `restaurantId` (string)
- `customerId` (string)
- `items` (array)
- `totalAmount` (number)
- `status` (string)
- `notes` (string)
- `createdAt` (string)
- `updatedAt` (string)

### Staff

- `id` (string)
- `name` (string)
- `role` (string)
- `email` (string)
- `phone` (string)
- `restaurantId` (string)
- `createdAt` (string)
- `updatedAt` (string)

## 7. Error Response Format

```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "A descriptive error message",
    "details": []
  }
}
```

## 8. Next Steps

1. Add the API source files or route definitions to the repository.
2. Update this document with actual endpoint paths, request bodies, response formats, and authentication details.
3. Include any middleware, rate limiting, or role-based access control rules.
4. Add sample curl commands and SDK usage examples if needed.
