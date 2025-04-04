@echo off
npx jest --config=jest.config.mjs --testMatch="**/src/{pages,components,context,User_backend,chatbot}/__tests__/**/*.test.js" %*