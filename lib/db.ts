import { MongoClient, Db } from "mongodb";

function getUri(): string {
  const u = process.env.MONGODB_URI;
  if (!u) throw new Error("MONGODB_URI is required");
  return u;
}
const dbName = "portfolio_generator";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(getUri(), {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  db = client.db(dbName);
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
}
