import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log("Connected to MySql Database");

export default pool;
  