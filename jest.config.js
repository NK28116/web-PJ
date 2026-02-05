const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // More specific patterns must come first
    '^@/atoms/(.*)$': '<rootDir>/components/atoms/$1',
    '^@/molecules/(.*)$': '<rootDir>/components/molecules/$1',
    '^@/organisms/(.*)$': '<rootDir>/components/organisms/$1',
    '^@/templates/(.*)$': '<rootDir>/components/templates/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    // Handle bare @/types import (without trailing path)
    '^@/types$': '<rootDir>/types/index.ts',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    // Most general pattern last (fallback)
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
