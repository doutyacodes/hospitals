import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema.js',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: '68.178.163.247',
    user: 'devuser_hospitals',
    password: 'Wowfy#user',
    database: 'devuser_hospitals',
    port: 3306,
  },
});
