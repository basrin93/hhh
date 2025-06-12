// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.vue$': '@vue/vue2-jest'
    },
    moduleFileExtensions: [
        'js',
        'ts',
        'json',
        'vue'
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^vuetify/lib$': 'vuetify'
    },
    transformIgnorePatterns: [
        'node_modules/(?!(vuetify)/)'
    ],
    testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
    }
};