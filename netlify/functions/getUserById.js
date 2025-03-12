// netlify/functions/getUserById.js
const { db } = require('../../drizzle/db');
const { users } = require('../../drizzle/schema');
const { eq } = require('drizzle-orm');

exports.handler = async function(event) {
  const { id } = event.queryStringParameters;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'User ID is required' })
    };
  }

  try {
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(user[0])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching user' })
    };
  }
};