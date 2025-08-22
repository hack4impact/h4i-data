// 8/21/2025 - OUT OF DATE

describe('Prisma basic test', () => {
    test('sample test', async () => {
      expect(0).toBe(0);
    });
})

// mock first
/*jest.mock('../service', () => ({
    // creates a mock function
    getMemberId: jest.fn(),
}));
  
// make sure imports go after you mock becuase Jest replaces the actual module with our mock
import { getMemberId } from '../service';
import { resolvers } from '../main';

describe('getMemberId resolver', () => {
    it('returns member id from name and university', async () => {
        // create a mock User
        const mockUser = { id: 1, name: 'Sophia', university: 'Cal Poly' };

        // assign getMemberId as a Jest mocked function
        // the mockResolvedValue(mockUser) will return a Promise when the mock function is called and is resolved with mockUser
        // acts like an async function!
        (getMemberId as jest.Mock).mockResolvedValue(mockUser);

        // call the real resolver function getMemberId with first argument as null since there's no parent/root
        // but because inside the resolver, getMemberId() calls the mock service function, we will get the mockUser as the result
        const result = await resolvers.Query.getMemberId(null, {
            name: 'Sophia',
            university: 'Cal Poly',
        });

        // we expect the result to equal to the mockUser
        expect(result).toEqual(mockUser);
        // we make sure that the mock geMemberId function was called with the two arguments
        expect(getMemberId).toHaveBeenCalledWith('Sophia', 'Cal Poly');
    });
});
  */