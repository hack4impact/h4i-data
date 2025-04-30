const dotenv = require('dotenv')
const { Pool } = require('pg')

dotenv.config()

// added
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

const PASSWORD = process.env.PASSWORD;

/*const pool = new Pool({
  user: 'johndoe',
  host: 'localhost',
  database: 'mydb',
  password: PASSWORD,
  port: 5432,
});*/

// connect to supabase
const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


async function testDB() {
  try {
    const members = await prisma.member.findMany();
    console.log('Connected successfully: ', members);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end();
  }
}

testDB();