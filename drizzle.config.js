require('dotenv').config({ path: '.env' });

module.exports = {
  schema: './db/schema.js',
  out: './db/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL, // Changed from connectionString to url
  },
};