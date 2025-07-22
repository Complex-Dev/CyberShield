// server/db.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DATABASE_URL;

if (!uri) {
  throw new Error("❌ DATABASE_URL must be defined in your .env file.");
}

const client = new MongoClient(uri);

let db;

export async function connectToDatabase() {
  try {
    if (!db) {
      await client.connect();
      db = client.db("cyberguard"); // Replace with your DB name if different
      console.log("✅ MongoDB connected successfully");
    }
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}
