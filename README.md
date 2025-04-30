# backend-test
This is a repository for testing Prisma orm, jest tests, and databases.

--- 

## 🛠 Techs

- **Express** — Javascript backend framework
- **PostgreSQL** — database
- **Prisma** - Object relational mapping
- **Jest** - Testing framework, CI

--- 

## Setup and run

```bash
npm i
```

### Postgres in a Docker Container
1. Open Docker Desktop
2. Run the following command in the IDE terminal:
```bash
docker run --name test-backend -e POSTGRES_USER=johndoe -e POSTGRES_PASSWORD=randompassword -e POSTGRES_DB=mydb -p 5432:5432 -d postgres:16
```
3. Run the below line to ensure a successful connection:
```bash 
node index.js
``` 

# Prisma

1. Run npx prisma db pull to update models in schema.prisma according to the database in supabase
2. Run npx prisma generate