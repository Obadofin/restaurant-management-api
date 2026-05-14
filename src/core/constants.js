// These are the three types of users in our system.
// Think of them like name tags: each person can only wear one.
const ROLES = {
  CUSTOMER: "customer",  // Regular people who buy things or use the service
  ADMIN: "admin",        // The boss who can change anything and manage everyone
  STAFF: "staff",        // Employees who help run things but don't have full boss powers
};

// Makes the roles available for other files to use
module.exports = { ROLES };