import db from './db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Get all users
export async function getAllUsers() {
  return await db.select().from(users);
}

// Get user by ID
export async function getUserById(id) {
  return await db.select().from(users).where(eq(users.id, id));
}

// Create a new user
export async function createUser(userData) {
  return await db.insert(users).values(userData).returning();
}

// Update user score
export async function updateUserScore(id, newScore) {
  return await db.update(users)
    .set({ score: newScore })
    .where(eq(users.id, id))
    .returning();
}