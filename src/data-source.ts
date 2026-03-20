import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DB_PATH || "./evently.db",
  synchronize: false,        
  logging: false,
  // Tells TypeORM where to find your entity files — User, Event, Tier, Booking. 
  // The `__dirname` means "the current folder" so this resolves to:
  entities: [__dirname + "/entities/*.ts"], 
  migrations: [__dirname + "/migrations/*.ts"],
  // When you run `npm run migration:run` TypeORM looks in this folder and runs any migrations that haven't been applied yet.
});

/**
 * synchronization
  * This is very important. When `true` TypeORM automatically updates your database tables every time you change an entity. 
  * This sounds convenient but it's **dangerous in production** because it can delete your data. 
  * So for submission you set it to `false` and use migrations instead.
 * Logging
  * When true TypeORM prints every SQL query it runs to your console. 
  * Useful for debugging but noisy in production so you keep it false.
 *
 */