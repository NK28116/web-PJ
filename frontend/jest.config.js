const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/atoms/(.*)$': '<rootDir>/components/atoms/$1',
    '^@/molecules/(.*)$': '<rootDir>/components/molecules/$1',
    '^@/organisms/(.*)$': '<rootDir>/components/organisms/$1',
    '^@/templates/(.*)$': '<rootDir>/components/templates/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/types$': '<rootDir>/types/index.ts',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/test/(.*)$': '<rootDir>/test/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

module.exports = createJestConfig(config);
