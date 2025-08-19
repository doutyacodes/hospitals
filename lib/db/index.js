import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

// DATABASE_URL should look like: mysql://user:password@host:3306/dbname
const pool = mysql.createPool({
  host: '68.178.163.247',
  user: 'devuser_hospitals',
  password: 'Wowfy#user',
  database: 'devuser_hospitals',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = drizzle(pool, { schema, mode: 'default' });