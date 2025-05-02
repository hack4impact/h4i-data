const dotenv = require('dotenv')
const { Pool } = require('pg')

dotenv.config()

// added
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

// const PASSWORD = process.env.PASSWORD;

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

// connects to the db and lists the db 
async function connectToDB() {
  try {
    await prisma.$connect()
    const members = await prisma.member.findMany();
    console.log('Connected successfully: ', members);
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

// adds a member to the db with name, university,
// prints verification of insertion
async function addMember(name, university) {
  try {
    const newMember = await prisma.member.create({
      data: {
        name: name,
        university: university
      },
    })
    console.log(`Inserted Member: 
      id: ${newMember.id}
      created_at: ${newMember.created_at}
      name: ${newMember.name}
      university: ${newMember.university}`);
  }
  catch (error) {
    console.error("Insertion Error: " + error)
  }
}

// We must delete by a unique identifier, which is the id
// prints verification of deletion
async function deleteMemberById(id) {
  try {
    const member = await prisma.member.delete({
      where: { id: id }
    })
    console.log(`Deleted Member: 
      id: ${member.id}
      created_at: ${member.created_at}
      name: ${member.name}
      university: ${member.university}`);
  }
  catch (error) {
    console.error("Deletion Error: " + error);
  }
}

// Get the member id from the name and university. Returns the first match
async function getMemberId(name, university) {
  try {
    const member = await prisma.member.findFirst({
      where: {
        name: name,
        university: university
      },
      select: { id: true }
    });
    if (member) { return member.id }
    else {
      console.log(`Member ${name}, ${university} not found`)
      return null
    }
  }
  catch (error) {
    console.error("Find Error: " + error);
  }
}

async function disconnectFromDB() {
  await prisma.$disconnect()
}

// connect to the db once before running commands
connectToDB();

// below script adds a member and immediately deletes it. 
// to test, comment out the insertion / deletion code and check Supabase
addMember("Harsh", "UMD")
// use .then() since getMemberId() is an async function
getMemberId("Harsh", "UMD").then(memberId => {
  console.log(memberId);
  deleteMemberById(memberId)
});

// disconnect from db when done with commands
disconnectFromDB()