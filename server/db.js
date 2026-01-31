import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Direct configuration (bypass SSL issues)
const pool = new Pool({
    host: 'dpg-d5udpk14tr6s73emcjng-a',
    port: 5432,
    database: 'budgetnatin',
    user: 'budgetnatin_user',
    password: 'fbuFeg7zhlJ5z5lbIACX5s1UXKhTjxZ6',
    ssl: false // Disable SSL for now
});

console.log('Database config loaded');

// Simple connection test
pool.query('SELECT 1')
    .then(() => console.log('✅ Database test query successful'))
    .catch(err => console.error('❌ Database test failed:', err.message));

export default pool;