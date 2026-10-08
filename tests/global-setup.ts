import { MongoMemoryServer } from "mongodb-memory-server";

let server: MongoMemoryServer;

// Set MONGOMS_SYSTEM_BINARY to a local mongod to skip the first-run download.
export async function setup() {
  server = await MongoMemoryServer.create();
  process.env.TEST_MONGO_URI = server.getUri();
}

export async function teardown() {
  await server.stop();
}
