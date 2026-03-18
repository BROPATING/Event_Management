import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: process.env.DB_PATH || "./evently.db",
  synchronize: false,        // ← MUST be false for submission
  logging: false,
  entities: [__dirname + "/entities/*.ts"],
  migrations: [__dirname + "/migrations/*.ts"],
});