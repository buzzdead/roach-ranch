// netlify/functions/getUsers.js
const { db } = require('../../drizzle/db');
const { users } = require('../../drizzle/schema');
const { eq } = require('drizzle-orm');

exports.handler = async function(event) {
  try {
    const allUsers = await db.select().from(users);
    return {
      statusCode: 200,
      body: JSON.stringify(allUsers)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching users' })
    };
  }
};