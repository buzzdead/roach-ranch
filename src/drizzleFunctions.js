// src/drizzleFunctions.js - frontend version
export async function getAllUsers() {
  const response = await fetch('/.netlify/functions/getUsers');
  if (!response.ok) throw new Error('Failed to fetch users');
  return await response.json();
}

export async function getUserById(id) {
  const response = await fetch(`/.netlify/functions/getUserById?id=${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return await response.json();
}

export async function createUser(userData) {
  const response = await fetch('/.netlify/functions/createUser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return await response.json();
}

export async function updateUserScore(id, newScore) {
  const response = await fetch(`/.netlify/functions/updateUserScore?id=${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ score: newScore }),
  });
  if (!response.ok) throw new Error('Failed to update user score');
  return await response.json();
}