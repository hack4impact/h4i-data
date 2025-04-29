const dotenv = require('dotenv')
const { Pool } = require('pg')

dotenv.config()

const PASSWORD = process.env.PASSWORD;

const pool = new Pool({
  user: 'johndoe',
  host: 'localhost',
  database: 'mydb',
  password: PASSWORD,
  port: 5432,
});

async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected successfully:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end();
  }
}

testDB();