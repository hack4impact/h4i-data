// 8/21/2025 - OUT OF DATE

// this tells the Prisma to disconnect from the database after all tests are done
/*afterAll(async () => {
    await prisma.$disconnect();
}); */


describe('Prisma basic test', () => {
    test('sample test', async () => {
        expect(0).toBe(0);
      });
})

// describe() groups up related tests together to keep tests organized
/*describe('Prisma DB tests', () => {
    // test() is an individual test case - in this case, this test should "Fetch members" as listed in the description
    test('Fetch members', async () => {
        // test logic here; first, members in the db are retrieved
        const members = await prisma.member.findMany();
        // use expect() to verify the outcome!
        // in this case, we are expecting that the members we retrieved IS an array
        expect(Array.isArray(members)).toBe(true);
    });

    test('Create Member and Get Member Info by ID', async () => {
        // create member
        const testMember = await prisma.member.create({
            data: { name: 'Test Person Jest', university: "Test University Jest"},
        })

        // retreive member information by ID
        const found = await prisma.member.findUnique({
            where: { id: testMember.id },
        });

        expect(found?.name).toBe("Test Person Jest");
        expect(found?.university).toBe("Test University Jest");

        // cleanup 
        await prisma.member.delete({ where: { id: testMember.id }});
    });

    test('Create Project and Get Project Info by ID', async () => {
        // create project
        const testProject = await prisma.project.create({
            data: { name: 'Test Project Jest', chapter: "Test Chapter Jest"},
        })

        // get project information by ID
        const found = await prisma.project.findUnique({
            where: { id: testProject.id },
        });

        expect(found?.name).toBe("Test Project Jest");
        expect(found?.chapter).toBe("Test Chapter Jest");

        // cleanup 
        await prisma.project.delete({ where: { id: testProject.id }});
    });

    test('Delete a member successfully', async () => {
        // create a member
        const testMember = await prisma.member.create({
            data: { name: 'Test Person Jest', university: "Test University Jest"},
        })

        const res = await prisma.member.delete({ where: { id: testMember.id } });
    
        // res is the object of the deleted member, which should be defined indeed
        expect(res).toBeDefined();
        // both ids should match
        expect(res.id).toBe(testMember.id);

        // make sure we can't find that member anymore
        const deletedMember = await prisma.member.findUnique({ where: { id: testMember.id } });
        // so it should be null
        expect(deletedMember).toBeNull();
      });

      test('Add a row in Member-Project Successfully', async () => {
        // create project
        const testProject = await prisma.project.create({
            data: { name: 'Test Project Jest', chapter: "Test Chapter Jest"},
        })

        // create member
        const testMember = await prisma.member.create({
            data: { name: 'Test Member Jest', university: "Test University Jest"},
        })

        // create row in member-project
        const testMP = await prisma.member_project.create({
            data: { member: { connect: { id: testMember.id } },
            project: { connect: { id: testProject.id } }},
        })

        // get project information by ID
        const found = await prisma.member_project.findUnique({
            where: { id: testMP.id },
        });

        expect(found?.member_id).toBe(testMember.id);
        expect(found?.project_id).toBe(testProject.id);

        // cleanup 
        await prisma.member.delete({ where: { id: testMember.id }});
    });
})*/