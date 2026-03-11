/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.spec.ts$',
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@wombto18/shared$': '<rootDir>/libs/shared/src/index.ts',
        '^@wombto18/shared/(.*)$': '<rootDir>/libs/shared/src/$1',
    },
};
