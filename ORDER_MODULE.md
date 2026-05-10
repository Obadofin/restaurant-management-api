# Order Module
**Restaurant Management API — Feature: `feature/order-module`**

Complete order lifecycle management — from creation to delivery tracking.

---

## 🎯 Quick Start

**Base URL:** `/api/orders`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/` | Any user | Create order |
| GET | `/me` | Any user | Get my orders |
| PATCH | `/:id/status` | Admin only | Update status |
| GET | `/admin` | Admin only | Get all orders |

---

## 📁 Project Structure

```
src/
├── models/order.model.js           # Schema + business logic
├── controllers/order.controller.js  # Route handlers
├── services/order.service.js        # Business logic
├── routes/order.routes.js           # Endpoint definitions
├── validations/orderValidator.js    # Joi schemas
└── middlewares/orderValidate.js     # Validation middleware
```

## 📊 Data Model

### Order
| Field | Type | Notes |
|-------|------|-------|
| `userId` | ObjectId | Required — from authenticated user |
| `items` | OrderItem[] | Min 1 item required |
| `totalPrice` | Number | **Auto-calculated, never set manually** |
| `status` | String | `pending` \| `preparing` \| `completed` \| `cancelled` |
| `createdAt` / `updatedAt` | Date | Auto timestamps |

### Order Item (Embedded)
| Field | Type | Notes |
|-------|------|-------|
| `menuItemId` | ObjectId | Reference to menu item |
| `name` | String | Snapshot at order time |
| `quantity` | Number | Min: 1 |
| `unitPrice` | Number | Snapshot at order time |
| `subTotal` | Number | Auto-calculated per item |

> 💡 **Why snapshots?** Menu prices change over time. Storing name and price at order creation ensures the order history is accurate.

---

## 🔄 Status Transitions

```
pending ──────► preparing ──────► completed
  │                │
  └────────────────┴──────────────► cancelled
```

- **pending** → `preparing`, `cancelled`
- **preparing** → `completed`, `cancelled`
- **completed** → (terminal)
- **cancelled** → (terminal)

Invalid transitions throw a **400 error**.

---

## 📡 API Endpoints

### POST `/api/orders` — Create Order
**Auth:** Required (any user)

```json
{
  "items": [
    { "menuItemId": "507f1f77bcf86cd799439011", "quantity": 2 }
  ]
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "...",
    "userId": "...",
    "items": [...],
    "totalPrice": 3000,
    "status": "pending"
  }
}
```

**Validation:**
- `items` must be non-empty array
- Each item must have valid `menuItemId` (MongoId) and `quantity` (integer ≥ 1)
- Menu item must exist and be available
- Returns **422** on validation error

---

### GET `/api/orders/me` — Get My Orders
**Auth:** Required

**Response `200`:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

Returns only authenticated user's orders, sorted newest first.

---

### PATCH `/api/orders/:id/status` — Update Status
**Auth:** Required — **Admin only**

```json
{ "status": "preparing" }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Order status updated to \"preparing\"",
  "data": {...}
}
```

**Error `400`:** Invalid status transition

---

### GET `/api/orders/admin` — Get All Orders
**Auth:** Required — **Admin only**

**Response `200`:**
```json
{
  "success": true,
  "count": 42,
  "data": [...]
}
```

---

## ⚠️ Error Responses

| Status | Scenario | Format |
|--------|----------|--------|
| 422 | Validation failed | `{ success: false, message: "..." }` |
| 400 | Invalid state transition | `{ success: false, message: "Invalid transition..." }` |
| 403 | Customer tries to update status | `{ success: false, message: "Forbidden..." }` |
| 404 | Order not found | `{ success: false, message: "Order not found" }` |
| 401 | Not authenticated | `{ success: false, message: "..." }` |

---

## 🔧 Implementation Details

### Validation
- Uses **Joi schemas** in `validations/orderValidator.js`
- Order-specific middleware returns **422** (vs 400 for other routes)
- Validates menu items exist and are available before creating

### Business Logic
- **Pre-save hook** auto-calculates `totalPrice` and `subTotal`
- **Status machine** validates all transitions with `canTransitionTo()` method
- **Service layer** handles enrichment of items with current menu data

### Key Methods (Service)
- `createOrder(userId, items)` — Create and save
- `getUserOrders(userId)` — Get user's orders
- `getAllOrders()` — Get all (admin)
- `updateOrderStatus(orderId, status, user)` — Update with validation

---

## 🧪 Testing

All endpoints fully tested:
```bash
npm run test
# ✅ 7/7 order tests passing
```

**Coverage:**
- Order creation with validation
- Item availability checks
- Status transitions (valid & invalid)
- Role-based access control
- Error scenarios

---

## 📝 Notes for Future Integration

- **MenuItem model** currently imported as-is; ensure it has `name`, `price`, `isAvailable` fields
- **User authentication** uses `req.user._id` from auth middleware
- **Admin role** determined by `req.user.roles` array containing `ROLES.ADMIN`