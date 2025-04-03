@echo off
npx jest --config=jest.config.mjs --testMatch="**/src/{pages,components}/__tests__/**/*.test.js" %*