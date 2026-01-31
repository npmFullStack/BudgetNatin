import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const poolConfig = {
    connectionString: process.env.DATABASE_URL,
};

// Add SSL configuration for production
if (process.env.NODE_ENV === 'production') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

// Connection event handlers
pool.on('connect', () => {
    console.log('✅ PostgreSQL connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err.message);
});

export default pool;