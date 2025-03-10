import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema'

// Use the connection pooler URL
const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export default db;