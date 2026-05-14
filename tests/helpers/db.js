const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;  // Holds the in-memory database instance

// Spins up a temporary MongoDB database that lives only in RAM (fast, no disk needed)
const connect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

// Tears down the temporary database and closes the connection
const disconnect = async () => {
  await mongoose.connection.dropDatabase();   // Wipes all test data
  await mongoose.connection.close();            // Closes the connection
  await mongod.stop();                          // Shuts down the in-memory server
};

// Deletes every record from every collection (full reset between tests)
const clearAllCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Deletes records from specific collections only (partial reset between tests)
const clearCollections = async (...names) => {
  for (const name of names) {
    const col = mongoose.connection.collections[name];
    if (col) await col.deleteMany({});
  }
};

module.exports = { connect, disconnect, clearAllCollections, clearCollections };