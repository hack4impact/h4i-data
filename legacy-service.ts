import dotenv from 'dotenv';
import { Pool } from 'pg';
import { VolunteerStatus, VolunteerType } from './legacy-enums';

dotenv.config();

// create a prisma client
import { Prisma, PrismaClient } from './generated/prisma';
import { VolunteerTypeTS } from './main';

const prisma = new PrismaClient();

// connect to supabase
new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// connects to the db and lists the db
export async function connectToDB() {
  try {
    // connects to the database
    await prisma.$connect();
    console.log('Connected successfully');
  } catch (err) {
    // errors if connection is unsuccessful
    console.error('Database connection error:', err);
  }
}

// disconnect the database
export async function disconnectFromDB() {
  await prisma.$disconnect();
  console.log('Disconnected successfully');
}

// adds a volunteer to the Volunteers table
export async function addVolunteer(volunteer: VolunteerTypeTS) {
  try {
    // add the new volunteer
    const newVolunteer = await prisma.volunteers.create({
      data: {
        first_name: volunteer.first_name,
        last_name: volunteer.last_name,
        email: volunteer.email,
        graduation_date: new Date(volunteer.graduation_date),
        volunteer_status: volunteer.volunteer_status as VolunteerStatus,
        H4I_email: volunteer.H4I_email,
        volunteer_type: volunteer.volunteer_type as VolunteerType,
        university_id: volunteer.university_id,
      } as Prisma.volunteersUncheckedCreateInput,
    });

    // print verification of insertion
    console.log(`Inserted Member: 
      id: ${newVolunteer.volunteer_id}
      name: ${newVolunteer.first_name} ${newVolunteer.last_name}
      email: ${newVolunteer.email}
      graduation_date: ${newVolunteer.graduation_date}
      volunteer_status: ${newVolunteer.volunteer_status}
      H4I_email: ${newVolunteer.H4I_email}
      volunteer_type: ${newVolunteer.volunteer_type}`);

    return 'Successfully added member!';
  } catch (error) {
    console.error('Insertion Error: ' + error);
    return 'Failed to add member!';
  }
}

// deletes member by a unique identifier, which is the id
/*export async function deleteMemberById(id: number) {
  console.log('got id', id)
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
    return "Successfully deleted member!"
  }
  catch (error) {
    console.error("Deletion Error: " + error);
    return "Failed to delete member!"
  }
}

// get the member id from the name and university (returns the first match)
export async function getMemberId(name: string, university: string) {
  try {
    // retrieve first match of the member by university and name
    const member = await prisma.member.findFirst({
      where: {
        name: name,
        university: university,
      },
      select: { id: true }
    });
    // if we find the member, return its id
    if (member) {
      return member.id.toString()
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
export async function addProject(name: string, chapter: string) {
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

    return "Successfully added project!"
  }
  catch (error) {
    console.error("Insertion Error: " + error)
    return "Failed to add project!"
  }
}

export async function getAllMembers() {
  try {
    // retreive all members - prisma has built-in functions such as findMany(), which can be found in the documentation linked in the README.md
    // we use member in prisma.member.findMany() because we are focusing on the member table
    // member is referred from schema.prisma, where you can see that member is defined; this is case sensitive, so make sure it's matching with schema.prisma! 
    const members = await prisma.member.findMany();
    // if we find the project, return the id
    if (members) {
      // returning an array of members, with their ID's as strings 
      return members.map((m) => ({
        ...m,
        id: m.id.toString(), // convert it to a string so we can retreive and view properly
      }))
    }
    // otherwise print the error of it not being found
    else {
      console.log(`Failed to get all members in the database`)
      return null
    }
  }
  catch (error) {
    console.error("Find Error: " + error);
  }
}

// retrieve project ID from the Project Table
export async function getProjectId(name: string, chapter: string) {
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
      return project.id.toString()
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
export async function addMemberProject(memberId: any, projectId: any) {
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
    return "Successfully added link in member_project table!"
  }
  catch (error) {
    console.error("Insertion error: " + error);
    return "Failed to add link in member_project table!"
  }
}



module.exports.getMemberId = getMemberId;
module.exports.getProjectId = getProjectId;
module.exports.addMemberProject = addMemberProject;
module.exports.addProject = addProject;
module.exports.deleteMemberById = deleteMemberById;
module.exports.getAllMembers = getAllMembers;

*/
module.exports.connectToDB = connectToDB;
module.exports.addVolunteer = addVolunteer;
module.exports.disconnectFromDB = disconnectFromDB;
