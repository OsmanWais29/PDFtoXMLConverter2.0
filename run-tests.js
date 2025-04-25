#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('Running tests with Mocha...');
  execSync('npx mocha --timeout 10000 test/**/*.test.js', { stdio: 'inherit' });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Test execution failed:', error.message);
  process.exit(1);
}