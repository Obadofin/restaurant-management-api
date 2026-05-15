require("dotenv").config({ path: ".env" });
const crypto = require("crypto");
const mongoose = require("mongoose");
const colors = require("colors");

const User = require("../models/user.model");
const Category = require("../models/category.model");
const MenuItem = require("../models/menu.model");
const Table = require("../models/table.model");
const Reservation = require("../models/reservation.model");
const Order = require("../models/order.model");
const Payment = require("../models/payment.model");
const { ROLES, TABLE_STATUS, RESERVATION_STATUS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } = require("../core/constants");

// ─── Seed Data ────────────────────────────────────────────────────────────────

const users = [
  { name: "Admin User", email: "admin@restaurant.com", password: "admin123", roles: [ROLES.ADMIN] },
  { name: "Staff Member", email: "staff@restaurant.com", password: "staff123", roles: [ROLES.STAFF] },
  { name: "John Customer", email: "john@example.com", password: "customer123", roles: [ROLES.CUSTOMER] },
];

const categories = [
  { name: "Appetizers", description: "Light starters to begin your meal" },
  { name: "Main Course", description: "Hearty main dishes" },
  { name: "Desserts", description: "Sweet endings to your meal" },
  { name: "Beverages", description: "Hot and cold drinks" },
];

const buildMenuItems = (categoryMap) => [
  // Appetizers
  { name: "Bruschetta", description: "Toasted bread topped with fresh tomatoes, garlic, and basil", price: 7.99, category: categoryMap["Appetizers"], isAvailable: true },
  { name: "Calamari", description: "Lightly breaded fried squid served with marinara sauce", price: 10.99, category: categoryMap["Appetizers"], isAvailable: true },
  { name: "Caesar Salad", description: "Romaine lettuce, croutons, parmesan, and Caesar dressing", price: 9.99, category: categoryMap["Appetizers"], isAvailable: true },
  // Main Course
  { name: "Grilled Salmon", description: "Fresh Atlantic salmon with lemon butter and seasonal veg", price: 24.99, category: categoryMap["Main Course"], isAvailable: true },
  { name: "Ribeye Steak", description: "12oz prime ribeye, cooked to your preference", price: 34.99, category: categoryMap["Main Course"], isAvailable: true },
  { name: "Chicken Parmesan", description: "Breaded chicken breast, marinara, mozzarella, with pasta", price: 18.99, category: categoryMap["Main Course"], isAvailable: true },
  { name: "Mushroom Risotto", description: "Creamy arborio rice with wild mushrooms and parmesan", price: 16.99, category: categoryMap["Main Course"], isAvailable: true },
  // Desserts
  { name: "Tiramisu", description: "Classic Italian dessert with espresso-soaked ladyfingers", price: 7.99, category: categoryMap["Desserts"], isAvailable: true },
  { name: "Chocolate Lava Cake", description: "Warm chocolate cake with a molten center, with ice cream", price: 8.99, category: categoryMap["Desserts"], isAvailable: true },
  { name: "Cheesecake", description: "New York style cheesecake with a graham cracker crust", price: 6.99, category: categoryMap["Desserts"], isAvailable: false },
  // Beverages
  { name: "Fresh Lemonade", description: "Freshly squeezed lemonade with mint", price: 3.99, category: categoryMap["Beverages"], isAvailable: true },
  { name: "Sparkling Water", description: "500ml bottle of sparkling mineral water", price: 2.99, category: categoryMap["Beverages"], isAvailable: true },
  { name: "Espresso", description: "Double shot of freshly ground espresso", price: 3.49, category: categoryMap["Beverages"], isAvailable: true },
];

const tables = [
  { tableNumber: 1, capacity: 2, status: TABLE_STATUS.AVAILABLE, location: "indoor" },
  { tableNumber: 2, capacity: 2, status: TABLE_STATUS.AVAILABLE, location: "indoor" },
  { tableNumber: 3, capacity: 4, status: TABLE_STATUS.AVAILABLE, location: "indoor" },
  { tableNumber: 4, capacity: 4, status: TABLE_STATUS.OCCUPIED, location: "indoor" },
  { tableNumber: 5, capacity: 4, status: TABLE_STATUS.AVAILABLE, location: "outdoor" },
  { tableNumber: 6, capacity: 6, status: TABLE_STATUS.RESERVED, location: "outdoor" },
  { tableNumber: 7, capacity: 6, status: TABLE_STATUS.AVAILABLE, location: "outdoor" },
  { tableNumber: 8, capacity: 8, status: TABLE_STATUS.AVAILABLE, location: "private" },
  { tableNumber: 9, capacity: 10, status: TABLE_STATUS.MAINTENANCE, location: "private" },
  { tableNumber: 10, capacity: 12, status: TABLE_STATUS.AVAILABLE, location: "private" },
];

const buildReservations = (tableMap, userMap) => [
  {
    customer: userMap["john@example.com"],
    table: tableMap[6],
    date: new Date("2027-06-15"),
    time: "19:00",
    partySize: 5,
    status: RESERVATION_STATUS.CONFIRMED,
    specialRequests: "Window seat preferred",
  },
  {
    customer: userMap["john@example.com"],
    table: tableMap[3],
    date: new Date("2027-07-04"),
    time: "20:00",
    partySize: 3,
    status: RESERVATION_STATUS.PENDING,
  },
  {
    customer: userMap["staff@restaurant.com"],
    table: tableMap[8],
    date: new Date("2027-06-20"),
    time: "18:30",
    partySize: 8,
    status: RESERVATION_STATUS.PENDING,
    specialRequests: "Team dinner, vegetarian options needed",
  },
];

// ─── Seeder ───────────────────────────────────────────────────────────────────

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected".cyan.underline);

  // Clear existing data
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), MenuItem.deleteMany({}), Table.deleteMany({}), Reservation.deleteMany({}), Order.deleteMany({}), Payment.deleteMany({})]);
  console.log("Existing data cleared".yellow);

  // Users (bcrypt handled by pre-save hook)
  const createdUsers = await User.create(users);
  const userMap = createdUsers.reduce((acc, u) => {
    acc[u.email] = u._id;
    return acc;
  }, {});
  console.log(`${createdUsers.length} users seeded`.green);

  // Categories
  const createdCategories = await Category.insertMany(categories);
  const categoryMap = createdCategories.reduce((acc, cat) => {
    acc[cat.name] = cat._id;
    return acc;
  }, {});
  console.log(`${createdCategories.length} categories seeded`.green);

  // Menu items
  const menuItems = buildMenuItems(categoryMap);
  await MenuItem.insertMany(menuItems);
  console.log(`${menuItems.length} menu items seeded`.green);

  // Tables
  await Table.insertMany(tables);
  console.log(`${tables.length} tables seeded`.green);

  // Reservations (tableMap keyed by tableNumber for readability)
  const createdTables = await Table.find().sort({ tableNumber: 1 });
  const tableMap = createdTables.reduce((acc, t) => {
    acc[t.tableNumber] = t._id;
    return acc;
  }, {});
  const reservations = buildReservations(tableMap, userMap);
  await Reservation.insertMany(reservations);
  console.log(`${reservations.length} reservations seeded`.green);

  console.log("\nSeeding complete!".green.bold);
  console.log("\nTest credentials:".cyan);
  console.log(`  Admin    — admin@restaurant.com  / admin123`);
  console.log(`  Staff    — staff@restaurant.com  / staff123`);
  console.log(`  Customer — john@example.com      / customer123`);
};

const destroy = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected".cyan.underline);

  await Promise.all([User.deleteMany({}), Category.deleteMany({}), MenuItem.deleteMany({}), Table.deleteMany({}), Reservation.deleteMany({}), Order.deleteMany({}), Payment.deleteMany({})]);

  console.log("All data destroyed".red.bold);
};

// ─── CLI ──────────────────────────────────────────────────────────────────────

const run = async () => {
  try {
    if (process.argv[2] === "--destroy") {
      await destroy();
    } else {
      await seed();
    }
  } catch (err) {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
