const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongod;

const connect = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
};

const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod.stop();
};

const clearAllCollections = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

const clearCollections = async (...names) => {
  for (const name of names) {
    const col = mongoose.connection.collections[name];
    if (col) await col.deleteMany({});
  }
};

module.exports = { connect, disconnect, clearAllCollections, clearCollections };
