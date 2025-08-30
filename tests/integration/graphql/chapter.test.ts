// src/tests/integration/graphql/chapter.test.ts
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../../api/graphql/schemas';
import { resolvers } from '../../../api/graphql/resolvers';
import { prisma } from '../../../config/database';

// We test against a new server instance to isolate tests
const testServer = new ApolloServer({
  typeDefs,
  resolvers,
});

describe('GraphQL API - Chapter', () => {
  let createdChapterId: string;

  afterAll(async () => {
    if (createdChapterId) {
      await prisma.chapters.delete({ where: { chapter_id: createdChapterId } });
    }
    await prisma.$disconnect();
  });

  it('createChapter mutation', async () => {
    const response = await testServer.executeOperation({
      query: `
                mutation CreateChapter($input: CreateChapterInput!) {
                    createChapter(input: $input) {
                        chapter_id
                        name
                        status_type
                    }
                }
            `,
      variables: {
        input: {
          name: 'GraphQL Test Chapter',
          founded_date: '2025-01-01',
        },
      },
    });

    const data = response.body.singleResult.data?.createChapter as any;
    expect(data.chapter_id).toBeDefined();
    expect(data.name).toBe('GraphQL Test Chapter');
    expect(data.status_type).toBe('ACTIVE');
    createdChapterId = data.chapter_id;
  });

  it('chapters query', async () => {
    const response = await testServer.executeOperation({
      query: `
                query Chapters {
                    chapters {
                        chapter_id
                        name
                    }
                }
            `,
    });

    const data = response.body.singleResult.data?.chapters as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.some((c) => c.chapter_id === createdChapterId)).toBe(true);
  });
});
