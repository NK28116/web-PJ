import MockDate from 'mockdate';

describe('Instagram Integration', () => {
  beforeEach(() => {
    // 2025-01-01 12:00:00 に固定
    MockDate.set('2025-01-01T12:00:00Z');
  });

  afterEach(() => {
    MockDate.reset();
  });

  it('should format instagram post date correctly', () => {
    // TODO: Implement actual test
    const now = new Date();
    expect(now.toISOString()).toBe('2025-01-01T12:00:00.000Z');
  });

  it('should authenticate user and save token', async () => {
    // TODO: Mock API response and test token saving logic
  });
});
