// These are the three types of users in our system.
// Think of them like name tags: each person can only wear one.
const ROLES = {
  CUSTOMER: "customer",  // Regular people who buy things or use the service
  ADMIN: "admin",        // The boss who can change anything and manage everyone
  STAFF: "staff",        // Employees who help run things but don't have full boss powers
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
