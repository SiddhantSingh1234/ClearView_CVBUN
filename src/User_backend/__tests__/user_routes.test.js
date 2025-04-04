import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import userRoutes from '../routes/user.js';
import authMiddleware from '../middleware/auth.js';

// Polyfill for setImmediate which is used by Express but not available in Jest environment
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));

// Mock auth middleware for testing protected routes
jest.mock('../middleware/auth.js', () => {
  return jest.fn((req, res, next) => {
    req.userId = req.headers['x-test-user-id'];
    next();
  });
});

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

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
  global.fetch.mockClear();
  delete global.fetch;
});

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  let testUser;
  let userId;
  let token;

  beforeEach(async () => {
    // Clear users collection before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }

    // Create a test user
    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      preferences: {
        categories: ['politics', 'technology'],
        sources: ['bbc', 'cnn']
      },
      likedArticles: [],
      likedVideos: [],
      comments: []
    });
    await testUser.save();
    userId = testUser._id;
    token = jwt.sign({ userId }, 'your-secret-key', { expiresIn: '1d' });
  });

  // Test for updating preferences
  describe('PUT /api/users/preferences', () => {
    it('should update user preferences', async () => {
      const res = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-user-id', userId)
        .send({
          preferences: {
            categories: ['sports', 'business'],
            sources: ['reuters', 'ap']
          }
        });

      expect(res.statusCode).toBe(200);
      
      // Verify preferences were updated in database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.preferences.categories).toContain('sports');
      expect(updatedUser.preferences.categories).toContain('business');
      expect(updatedUser.preferences.sources).toContain('reuters');
      expect(updatedUser.preferences.sources).toContain('ap');
    });
  });

  // Test for liking articles
  describe('POST /api/users/articles/:id/like', () => {
    it('should add article to liked articles', async () => {
      const articleId = 'article123';
      
      const res = await request(app)
        .post(`/api/users/articles/${articleId}/like`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-user-id', userId);

      expect(res.statusCode).toBe(200);
      
      // Verify article was added to liked articles in database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.likedArticles).toContain(articleId);
    });
  });

  // Test for liking videos
  describe('POST /api/users/videos/:id/like', () => {
    it('should add video to liked videos', async () => {
      const videoId = 'video123';
      
      const res = await request(app)
        .post(`/api/users/videos/${videoId}/like`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-user-id', userId);

      expect(res.statusCode).toBe(200);
      
      // Verify video was added to liked videos in database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.likedVideos).toContain(videoId);
    });
  });

  // Test for commenting on articles
  describe('POST /api/users/articles/:id/comment', () => {
    it('should add a comment to an article', async () => {
      const articleId = 'article123';
      const commentText = 'This is a test comment';
      
      const res = await request(app)
        .post(`/api/users/articles/${articleId}/comment`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-test-user-id', userId)
        .send({ text: commentText });

      expect(res.statusCode).toBe(200);
      
      // Verify comment was added to user in database
      const updatedUser = await User.findById(userId);
      expect(updatedUser.comments.length).toBeGreaterThan(0);
      expect(updatedUser.comments[0].articleId).toBe(articleId);
      expect(updatedUser.comments[0].text).toBe(commentText);
    });
  });
  // Test for invalid preferences format
describe('PUT /api/users/preferences - Error Cases', () => {
  it('should return 400 for invalid preferences format', async () => {
    const res = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-user-id', userId)
      .send({
        preferences: "not an object" // Invalid format - should be an object
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid preferences format');
  });

  it('should return 400 for invalid preferences structure', async () => {
    const res = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-user-id', userId)
      .send({
        preferences: {
          categories: "not an array", // Should be an array
          sources: ['bbc']
        }
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid preferences structure');
    expect(res.body.details).toContain('categories must be an array');
  });

  it('should return 404 for non-existent user', async () => {
    // Create a non-existent user ID
    const fakeUserId = new mongoose.Types.ObjectId();
    
    const res = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-user-id', fakeUserId) // Use a non-existent user ID
      .send({
        preferences: {
          categories: ['sports'],
          sources: ['bbc']
        }
      });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });
});

// Test for comment validation and error handling
describe('POST /api/users/articles/:id/comment - Error Cases', () => {
  it('should return 400 for empty comment text', async () => {
    const articleId = 'article123';
    
    const res = await request(app)
      .post(`/api/users/articles/${articleId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-user-id', userId)
      .send({ text: '' }); // Empty comment text

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Comment text is required');
  });

  it('should handle user not found error', async () => {
    const articleId = 'article123';
    const fakeUserId = new mongoose.Types.ObjectId();
    
    const res = await request(app)
      .post(`/api/users/articles/${articleId}/comment`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-user-id', fakeUserId) // Non-existent user ID
      .send({ text: 'This is a test comment' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });
});

// Test for server error handling
describe('Server Error Handling', () => {
  it('should handle server errors in preferences update', async () => {
    // Mock User.findByIdAndUpdate to throw an error
    const originalFindByIdAndUpdate = User.findByIdAndUpdate;
    User.findByIdAndUpdate = jest.fn().mockImplementation(() => {
      throw new Error('Database connection failed');
    });
    
    const res = await request(app)
      .put('/api/users/preferences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-test-user-id', userId)
      .send({
        preferences: {
          categories: ['sports'],
          sources: ['bbc']
        }
      });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Server error');
    expect(res.body).toHaveProperty('details', 'Database connection failed');
    
    // Restore the original function
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  });
});
});