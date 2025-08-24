# Backend Test Repository

This is the backend repository for setting up the Prisma ORM, tests, and database.

---

## 🛠 Technology Used

- **Language** - Typescript
- **Express** — Javascript backend framework
- **PostgreSQL** — Relational Database (Supabase is our hosting service)
- **Prisma** - Object Relational Mapping (ORM) so we don't have to write raw SQL
- **Jest** - Testing Framework
- **Github Actions** - CI

---

## Guidelines

- Do not edit schema.prisma - once we are in production, we will only edit from supabase and run "npx prisma db pull" and "npx prisma generate" to stay consistent (explanations provided above in Prisma section). This means we will not have any migration folders to keep track of our migrations!

---

## Setup and Run

```bash
npm i
```

---

Then create a file in the main directory called ".env". For the .env info, ask Sophia for it! To view the databases in Supabase, DM Sophia to get access!

---

## Prisma

```bash
npx prisma db pull
npx prisma generate
```

npx prisma db pull - This is to update models in schema.prisma according to the database in Supabase (so if you created a new table in supabase, then you can update schema.prisma by executing this command - test it out and see it for yourself! the tables would appear if you create one and run this command)

npx prisma generate - This generates the Prisma Client code based on our schema.prisma. We need this to generate a new Prisma Client, which allows us to use the helpful Prisma Client CRUD functions such as findMany(), findFirst(), and more with our new tables!

---

## Run main.ts

```bash
npx ts-node main.ts
```

---

## Rules When Creating Branches

1. Please make sure to name your branch with your name (ex. jane)

---

## Run Tests (2 ways)

```bash 
npm test 
```

OR

```bash
npx jest
```

---

## Running GraphQL

Example of what you can run:

```
mutation {
  addVolunteer(
    volunteer: {
      first_name: "Jane"
      last_name: "Doe"
      email: "janedoe@example.com"
      graduation_date: "2026-06-18"
      volunteer_status: STUDENT
      H4I_email: "jane@hack4impact.org"
      volunteer_type: CHAPTER
      university_id: "860b69b4-a14e-41d9-a367-2632b342e549"
    }
  )
}
```

This creates a volunteer in the Volunteer table. Other examples are listed in the docs/graphqlExamples.md

---

## How To Add/Update GraphQL Endpoints

1. Define all data querying functions in the service.ts file - follow the patterns in how functions are written based on the current existing functions:
  - Async functions, because we are fetching data and don't know how long it'll take
  - Try and catch functions to catch any errors that may result in attempting to query data
  - You will notice the prisma.member.create or prisma.project.findFirst functions and more. The endings of the functions (create, findFirst, findMany, etc.) are the Prisma Client CRUD Operations (link below in Helpful Links), while "member", "project", "member_project" within those functions are taken from schema.prisma file located in the prisma folder; make sure you copy them properly because they are case sensitive!
2. Make sure to export the function you write by writing "module.exports.[function name] = [function name]; with many examples listed below in the file - we need to do this in order to use the function in the main.ts file
3. Now, let's look at main.ts - first thing to note is that a schema needs 2 crucial parts - typeDefs (we defined in graphqlModels) and resolvers (explanation below)
  - In graphqlModels, this is where we define the actual GraphQL schema
  - "type Member" is us defining what a Member will hold, and same logic for Project - it tells GraphQL what our data LOOKS like (this is only necessary if we want to group our result or input in specific ways)
  - "type Query" tells GraphQL what kind of OPERATIONS users can execute, so in this case, getAllMembers: [Member] means executing the function getAllMembers() with no inputs would give us result of object Member but in an array because of the brackets around Member. Another example is the deleteMemberById function. We can see that memberId is an input of type ID that will enter the deleteMemberById function, and the output of that will be a String.
  - Now looking at resolvers! It defines how to respond to queries! So for every query in the schema, we write a corresponding resolver function. So getAllMembers (that we wrote in "type Query") will point to the getAllMembers() function from service.ts. The parenthesis () are empty because we have no inputs we need to insert into the actual function getAllMembers. So with deleteMemberById, we see we have (_: any, args: { memberId: number }). The resolver function accepts (parent, args, context, info) respectively. So in this case, only parent and args are read. We're not using the parent so that is why we use "_" to mark it as "unused". But for args, we need to use it since deleteMemberById must take in a number as input as stated in service.ts, so we wrap the arguments in curly brackets, define the type of argument which in this case is "number", and map it to the deleteMemberById(args.memberId) function from service.ts

---

## How to Make Changes to Supabase Tables

1. Access the hack4impact project and navigate to Table Editor using the left sidebar
2. You can use Insert button to create new rows of data, create new tables with "+ New Table" button, etc.
3. After making changes, in your terminal, in order to update your code to match what the database has, run "npx prisma db pull" and "npx prisma generate" (explanations provided above in Prisma section)
4. With this, your code is up to date with the database and you can safely query data!

---

## How to Write Tests

1. Examples with detailed comments in userResolvers.test.ts and db.test.ts (for the first test)
2. When mocking functions, such as getMemberId in userResolvers.test.ts, make sure to mock the service BEFORE importing. The reason is due to Jest replacing the actual module with our mock and if we do it the other way around, then mocking won't be successful. After that, import any necessary functions
3. Next, we have describe(). This groups up related tests that we will have and is useful for organization. If you only have one test or so, a describe() isn't necessary.
4. Now we can start creating individual tests. it() and test() both do the same thing in Jest, and test() is just a more general function, while it() allows us to read everything in a sentence easily (ex. it("returns an id") vs test("returns an id")). Make sure the functions are async!
5. Then write the test logic inside, normally creating a mock object that we will test to get or update, etc. and then comparing its result with our real result using the expect() method. More detailed documentation is listed below in the Helpful Links.

---

## Helpful Links

1. Prisma Client CRUD Operations: https://www.prisma.io/docs/orm/prisma-client/queries/crud
2. Jest Documentation: https://jestjs.io/docs/getting-started