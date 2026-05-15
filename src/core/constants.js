const ROLES = {
  CUSTOMER: "customer",
  ADMIN: "admin",
  STAFF: "staff",
};

const TABLE_STATUS = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  MAINTENANCE: "maintenance",
};

const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};

const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const PAYMENT_STATUS = {
  SUCCESS: "success",
  FAILED: "failed",
  PENDING: "pending",
};

const PAYMENT_METHOD = {
  CARD: "card",
  CASH: "cash",
};

module.exports = { ROLES, TABLE_STATUS, RESERVATION_STATUS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD };
