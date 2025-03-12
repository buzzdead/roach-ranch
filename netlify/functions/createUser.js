// netlify/functions/createUser.js
const { db } = require('../../drizzle/db');
const { users } = require('../../drizzle/schema');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const userData = JSON.parse(event.body);
    
    if (!userData.name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Username is required' })
      };
    }

    const newUser = await db.insert(users).values(userData).returning();
    
    return {
      statusCode: 201,
      body: JSON.stringify(newUser[0])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error creating user' })
    };
  }
};