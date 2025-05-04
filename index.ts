import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config()

// create a prisma client
import { PrismaClient } from './generated/prisma';
const prisma = new PrismaClient();

// connect to supabase
new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// connects to the db and lists the db 
async function connectToDB() {
  try {
    // connects to the database
    await prisma.$connect()
    console.log('Connected successfully');
  } catch (err) {
    // errors if connection is unsuccessful
    console.error('Database connection error:', err);
  }
}

// adds a member to the db with name, university,
async function addMember(name: string, university: string) {
  try {
    // add the new member
    const newMember = await prisma.member.create({
      data: {
        name: name,
        university: university
      },
    })

    // print verification of insertion
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

// deletes member by a unique identifier, which is the id
async function deleteMemberById(id: any) {
  try {
    // delete member based on id
    const member = await prisma.member.delete({
      where: { id: id }
    })

    // print verification of deletion
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

// get the member id from the name and university (returns the first match)
async function getMemberId(name: string, university: string) {
  try {
    // retrieve first match of the member by university and name
    const member = await prisma.member.findFirst({
      where: {
        name: name,
        university: university
      },
      select: { id: true }
    });
    // if we find the member, return its id
    if (member) {
      return member.id
    }
    else {
      // otherwise state that it's not found
      console.log(`Member ${name}, ${university} not found`)
      return null
    }
  }
  catch (error) {
    console.error("Find Error: " + error);
  }
}

// adds a project to the Project table
async function addProject(name: string, chapter: string) {
  try {
    // add a new project
    const newProject = await prisma.project.create({
      data: {
        name: name,
        chapter: chapter
      },
    })
    // print verification of inserting a project successfully
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
async function getProjectId(name: string, chapter: string) {
  try {
    // retreive the id of the project by name and chapter
    const project = await prisma.project.findFirst({
      where: {
        name: name,
        chapter: chapter
      },
      select: { id: true }
    });
    // if we find the project, return the id
    if (project) {
      return project.id
    }
    // otherwise print the error of it not being found
    else {
      console.log(`Project ${name}, ${chapter} not found`)
      return null
    }
  }
  catch (error) {
    console.error("Find Error: " + error);
  }
}

// adds an entry connecting Member and Project table
async function addMemberProject(memberId: any, projectId: any) {
  try {
    // connect project id and member id together into the Member_Project table
    const memberProject = await prisma.member_project.create({
      data: {
        // Member_Project is meant to be keep track of Member and Project pairs,
        // the lines below tell prisma: "connect the memberId to the member 
        // associated with that id" and same with the project
        member: { connect: { id: memberId } },
        project: { connect: { id: projectId } },
      },
    });
    // print verification of inserting the pair successfully
    console.log(`Added member project pair: 
      id: ${memberProject.id}
      member_id: ${memberProject.member_id}
      project_id: ${memberProject.project_id}`);
  }
  catch (error) {
    console.error("Insertion error: " + error);
  }
}

// disconnect the database
async function disconnectFromDB() {
  await prisma.$disconnect();
}

async function main() {
  // connect to the db once before running commands
  await connectToDB();

  // create labels to add to tables
  const name = "Jane Doe";
  const uni = "Hack4Impact University";
  const project = "Project A";
  const chapter = "Hack4Impact Chapter";
  
  // add a member
  await addMember(name, uni);
  // add a project
  await addProject(project, chapter);

  // retrieve member id
  const memberId = await getMemberId(name, uni)
  // retrieve project id
  const projectId = await getProjectId(project, chapter)

  // add the member and project pair to the join table
  await addMemberProject(memberId, projectId);

  // delete member, which would delete all other rows with its relation
  deleteMemberById(memberId)

  // disconnect from db when done with commands
  disconnectFromDB();
}

if (require.main === module) {
  main();
}

module.exports.connectToDB = connectToDB;
module.exports.disconnectFromDB = disconnectFromDB;
module.exports.getMemberId = getMemberId;
module.exports.getProjectId = getProjectId;