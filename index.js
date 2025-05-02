const dotenv = require('dotenv')
const { Pool } = require('pg')

dotenv.config()

// create a prisma client
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

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
    const newMember = await prisma.Member.create({
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
// TODO: Fix delete to obey foriegn key constraint
async function deleteMemberById(id) {
  try {
    const member = await prisma.Member.delete({
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
    const member = await prisma.Member.findFirst({
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

// add a project to the Project table successfully
async function addProject(name, chapter) {
  try {
    const newProject = await prisma.Project.create({
      data: {
        name: name,
        chapter: chapter
      },
    })
    console.log(`Inserted Project: 
      id: ${newProject.id}
      created_at: ${newProject.created_at}
      name: ${newProject.name}
      chapter: ${newProject.chapter}`);
  }
  catch (error) {
    console.error("Insertion Error: " + error)
  }
}

// retrieve project ID from the Project Table
async function getProjectId(name, chapter) {
  try {
    const project = await prisma.Project.findFirst({
      where: {
        name: name,
        chapter: chapter
      },
      select: { id: true }
    });
    if (project) { return project.id }
    else {
      console.log(`Project ${name}, ${chapter} not found`)
      return null
    }
  }
  catch (error) {
    console.error("Find Error: " + error);
  }
}

// add an entry connecting Member and Project table
async function addMemberProject(memberId, projectId) {
  try {
    const memberProject = await prisma.Member_Project.create({
      data: {
        Member: { connect: { id: memberId } },
        Project: { connect: { id: projectId } },
      },
    });
    console.log(`Added member project pair: 
      id: ${memberProject.id}
      member_id: ${memberProject.member_id}
      project_id: ${memberProject.project_id}`);
  }
  catch (error) {
    console.error("Insertion error: " + error);
  }
}

async function disconnectFromDB() {
  await prisma.$disconnect();
}

async function main() {
  // connect to the db once before running commands
  await connectToDB();

  // create labels to add to tables
  const name = "sophia";
  const uni = "cal poly univ";
  const project = "project s";
  const chapter = "chapter s";
  // add member and project
  await addMember(name, uni);
  await addProject(project, chapter);
  // add the member and project pair to the join table
  memberId = await getMemberId(name, uni)
  projectId = await getProjectId(project, chapter)
  await addMemberProject(memberId, projectId);

  // delete member, which should delete all other rows with its relation
  deleteMemberById(memberId)

  // disconnect from db when done with commands
  disconnectFromDB();
}

main()