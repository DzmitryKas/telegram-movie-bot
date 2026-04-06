import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';
import * as schema from './schema.js';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL не установлен в .env');
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

export type DbClient = typeof db;
