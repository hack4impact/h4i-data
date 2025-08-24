import { GraphQLDate } from "graphql-iso-date";
import express, { Application } from "express";
import { graphqlHTTP } from "express-graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { addVolunteer, connectToDB, disconnectFromDB } from "./service";
import { VolunteerStatus, VolunteerType } from "./enums";

export type VolunteerTypeTS = {
  first_name: string;
  last_name: string;
  email: string;
  graduation_date: Date;
  volunteer_status: VolunteerStatus;
  H4I_email: string;
  volunteer_type: VolunteerType;
  university_id?: string;
};

const app: Application = express();

const graphqlModels = `
  scalar Date

  enum VOLUNTEER_STATUS {
    STUDENT
    PROFESSIONAL
  }

  enum VOLUNTEER_TYPE {
    CHAPTER
    NATIONALS
    BOTH
  }

  input VolunteerInput {
    first_name: String! # with !, it means required
    last_name: String!
    email: String!
    graduation_date: Date!
    volunteer_status: VOLUNTEER_STATUS!
    H4I_email: String
    volunteer_type: VOLUNTEER_TYPE!
    university_id: ID!
  }

  type Mutation {
    addVolunteer(volunteer: VolunteerInput!): String
  }

  type Query {
    _empty: String
  }
`;

export const resolvers = {
  Query: {},
  Mutation: {
    addVolunteer: (_: any, { volunteer }: { volunteer: VolunteerTypeTS }) => {
      return addVolunteer(volunteer);
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs: graphqlModels,
  resolvers: {
    Date: GraphQLDate, // <- mandatory
    Query: {},
    Mutation: resolvers.Mutation,
  },
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
);

// only if we need to have a middleware
//app.use(express.json());

let server: ReturnType<typeof app.listen>;

// need this if statement to prevent the server from starting in test environment
if (process.env.NODE_ENV !== "test") {
  server = app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
    console.log("GraphQL: http://localhost:3000/graphql");
  });
}

async function main() {
  // connect to the db once before running commands
  await connectToDB();

  // add a volunteer
  await addVolunteer({
    first_name: "Sophia",
    last_name: "C",
    email: "test@gmail.com" + Math.floor(Math.random() * 1000).toString(),
    graduation_date: new Date("2026-06-18"),
    volunteer_status: VolunteerStatus.STUDENT,
    H4I_email: "sophia@hack4impact.org",
    volunteer_type: VolunteerType.CHAPTER,
    university_id: "860b69b4-a14e-41d9-a367-2632b342e549",
  });

  // disconnect from db when done with commands
  await disconnectFromDB();

  // uncomment the following lines to close the server after running commands
  // if you want to run graphql commands then comment this out
  if (server) {
    server.close(() => console.log("Server closed!"));
  }
}

// TODO: create a PUT REST API call to the volunteers table
// Layer graphql ontop

if (require.main === module) {
  main();
}
