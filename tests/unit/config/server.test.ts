// Mock environment variables
const originalEnv = process.env;

describe('Server Configuration', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  it('should validate configuration with all required variables', () => {
    process.env.SUPABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.GRAPHQL_PORT = '4000';
    process.env.REST_PORT = '4001';
    process.env.NODE_ENV = 'production';
    process.env.SEED_DATA = 'true';

    // Re-import to get fresh config
    delete require.cache[require.resolve('../../../src/config/server')];
    const { config } = require('../../../src/config/server');

    expect(config.SUPABASE_URL).toBe(
      'postgresql://test:test@localhost:5432/test'
    );
    expect(config.GRAPHQL_PORT).toBe(4000);
    expect(config.REST_PORT).toBe(4001);
    expect(config.NODE_ENV).toBe('production');
    expect(config.SEED_DATA).toBe(true);
  });

  it('should use default values when optional variables are not set', () => {
    process.env.SUPABASE_URL = 'postgresql://test:test@localhost:5432/test';
    delete process.env.GRAPHQL_PORT;
    delete process.env.REST_PORT;
    delete process.env.NODE_ENV;
    delete process.env.SEED_DATA;

    delete require.cache[require.resolve('../../../src/config/server')];
    const { config } = require('../../../src/config/server');

    expect(config.GRAPHQL_PORT).toBe(3000);
    expect(config.REST_PORT).toBe(3001);
    expect(config.NODE_ENV).toBe('development');
    expect(config.SEED_DATA).toBe(false);
  });

  it('should throw error when required SUPABASE_URL is missing', () => {
    delete process.env.SUPABASE_URL;

    expect(() => {
      delete require.cache[require.resolve('../../../src/config/server')];
      require('../../../src/config/server');
    }).toThrow(
      'Configuration validation failed:\nMissing required environment variable: SUPABASE_URL'
    );
  });

  it('should parse SEED_DATA as boolean correctly', () => {
    process.env.SUPABASE_URL = 'postgresql://test:test@localhost:5432/test';

    // Test 'true'
    process.env.SEED_DATA = 'true';
    delete require.cache[require.resolve('../../../src/config/server')];
    let { config } = require('../../../src/config/server');
    expect(config.SEED_DATA).toBe(true);

    // Test 'false'
    process.env.SEED_DATA = 'false';
    delete require.cache[require.resolve('../../../src/config/server')];
    ({ config } = require('../../../src/config/server'));
    expect(config.SEED_DATA).toBe(false);

    // Test other values
    process.env.SEED_DATA = 'anything';
    delete require.cache[require.resolve('../../../src/config/server')];
    ({ config } = require('../../../src/config/server'));
    expect(config.SEED_DATA).toBe(false);
  });

  it('should parse port numbers correctly', () => {
    process.env.SUPABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.GRAPHQL_PORT = '8080';
    process.env.REST_PORT = '8081';

    delete require.cache[require.resolve('../../../src/config/server')];
    const { config } = require('../../../src/config/server');

    expect(config.GRAPHQL_PORT).toBe(8080);
    expect(config.REST_PORT).toBe(8081);
    expect(typeof config.GRAPHQL_PORT).toBe('number');
    expect(typeof config.REST_PORT).toBe('number');
  });
});
