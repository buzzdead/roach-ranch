// netlify/functions/updateUserScore.js
const { db } = require('../../drizzle/db');
const { users } = require('../../drizzle/schema');
const { eq } = require('drizzle-orm');

exports.handler = async function(event) {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { id } = event.queryStringParameters;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'User ID is required' })
    };
  }

  try {
    const { score } = JSON.parse(event.body);
    
    if (score === undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Score is required' })
      };
    }

    const updatedUser = await db.update(users)
      .set({ score })
      .where(eq(users.id, id))
      .returning();
    
    if (updatedUser.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(updatedUser[0])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error updating user score' })
    };
  }
};