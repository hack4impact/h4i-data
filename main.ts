import express, { Application } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getAllMembers, addProject, deleteMemberById, connectToDB, disconnectFromDB, getMemberId, getProjectId, addMember, addMemberProject } from './service';

const app: Application = express();

const graphqlModels = `
  type Member {
    id: ID
    name: String
    university: String
  }

  type Project {
    project: String,
    chapter: String
  }

  type Query {
    getAllMembers: [Member],
    getMemberId(name: String, university: String): ID,
    getProjectId(project: String, chapter: String): ID,
    addProject(project: String, chapter: String): String,
    addMember(name: String, university: String): String,
    deleteMemberById(memberId: ID): String,
    addMemberProject(memberId: ID, projectId: ID): String,
  }
`;

export const resolvers = {
  Query: {
    getAllMembers: () => getAllMembers(),
    getMemberId: (_: any, args: { name: string; university: string }) =>
      getMemberId(args.name, args.university),
    getProjectId: (_: any, args: { project: string; chapter: string }) =>
      getProjectId(args.project, args.chapter),
    addProject: (_: any, args: { project: string; chapter: string }) =>
      addProject(args.project, args.chapter),
    addMember: (_: any, args: { name: string; university: string }) =>
      addMember(args.name, args.university),
    deleteMemberById: (_: any, args: { memberId: number }) =>
      deleteMemberById(args.memberId),
    addMemberProject: (_: any, args: { memberId: string; projectId: string }) =>
      addMemberProject(args.memberId, args.projectId),
  },
};

const schema = makeExecutableSchema({
  typeDefs: graphqlModels,
  resolvers,
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
    console.log("GraphQL: http://localhost:3000/graphql");
  });  
}

async function main() {
  // connect to the db once before running commands
  await connectToDB();

  /*const members = await getAllMembers();
  console.log(members)

  // create labels to add to tables
  const name = "NAMEEE";
  const uni = "UNIII";
  const project = "PROJECTTT";
  const chapter = "CHAPTTERR";
  
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
  await deleteMemberById(memberId)

  // disconnect from db when done with commands
  await disconnectFromDB();*/

  // close server
  /*server.close(() => {
    console.log("Server closed!");
  });*/
}

if (require.main === module) {
  main();
}