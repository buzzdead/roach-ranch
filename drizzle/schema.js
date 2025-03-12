const { pgTable, serial, text, integer } = require('drizzle-orm/pg-core');
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  score: integer('score').default(0),
});
module.exports = { users };