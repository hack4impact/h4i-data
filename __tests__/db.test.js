const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

afterAll(async () => {
    await prisma.$disconnect();
}); 

describe('Prisma DB tests', () => {
    test('Fetch members', async () => {
        const members = await prisma.member.findMany();
        expect(Array.isArray(members)).toBe(true);
    });

    test('Create and read member', async () => {
        const testMember = await prisma.member.create({
            data: { name: 'Test Person', university: "abc"},
        })

        const found = await prisma.member.findUnique({
            where: { id: testMember.id },
        });

        expect(found?.name).toBe("Test Person");
        expect(found?.university).toBe("abc");

        // cleanup 
        await prisma.member.delete({ where: { id: testMember.id }});
    });
})