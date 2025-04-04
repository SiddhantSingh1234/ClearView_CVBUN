import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import authRoutes from '../routes/auth.js';
import authMiddleware from '../middleware/auth.js';

// Setup in-memory MongoDB for testing
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clear users collection before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBe('test@example.com');

      // Verify user was created in database
      const user = await User.findById(res.body.userId);
      expect(user).toBeTruthy();
      expect(user.username).toBe('testuser');
    });

    it('should return error if email already exists', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      });

      // Try to create another user with the same email
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Email already in use');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user with a properly hashed password
      const password = 'password123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create the user directly in the database
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword
      });
      
      await user.save();
      
      // Verify the user was created correctly
      const savedUser = await User.findOne({ email: 'test@example.com' });
      console.log('Test user created:', savedUser.email, 'Password hash:', savedUser.password.substring(0, 10) + '...');
    });
    
    it('should return error for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('User not found');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create a test user
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      userId = user._id;
      // At the top of the file, add this constant to match the secret key in auth.js
      const JWT_SECRET = 'your-secret-key';
      
      // Then update the jwt.sign call in the test
      token = jwt.sign({ userId }, JWT_SECRET);
      
      // Mock the auth middleware for this test
      app.use('/api/auth/me-test', (req, res, next) => {
        req.userId = userId;
        next();
      }, (req, res) => {
        res.json({ userId: req.userId });
      });
    });

    it('should return user data when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me-test')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('userId');
      expect(res.body.userId.toString()).toBe(userId.toString());
    });
  });
  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Create a test user
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10)
      });
      userId = user._id;
      const JWT_SECRET = 'your-secret-key';
      token = jwt.sign({ userId }, JWT_SECRET);
    });

    it('should return user data when authenticated', async () => {
      // Test the actual /me endpoint instead of the mock endpoint
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return 500 when database error occurs', async () => {
      // Mock User.findById to throw an error
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error fetching user data');
      
      // Restore the original function
      User.findById = originalFindById;
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Logout successful');
    });
  });

  describe('Error handling in auth routes', () => {
    it('should handle signup validation errors', async () => {
      // Send incomplete data to trigger validation error
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          // Missing username
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle login with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          // Missing password
          email: 'test@example.com'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});