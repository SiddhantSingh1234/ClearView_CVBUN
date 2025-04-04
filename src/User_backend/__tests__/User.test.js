import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

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

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('User Model', () => {
  it('should create a new user with hashed password', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();

    // Verify user was saved
    const savedUser = await User.findOne({ email: 'test@example.com' });
    expect(savedUser).toBeTruthy();
    expect(savedUser.username).toBe('testuser');
    expect(savedUser.email).toBe('test@example.com');
    
    // Verify password was hashed
    expect(savedUser.password).not.toBe('password123');
    const isMatch = await bcrypt.compare('password123', savedUser.password);
    expect(isMatch).toBe(true);
  });

  it('should require username, email, and password', async () => {
    const userWithoutUsername = new User({
      email: 'test@example.com',
      password: 'password123'
    });

    const userWithoutEmail = new User({
      username: 'testuser',
      password: 'password123'
    });

    const userWithoutPassword = new User({
      username: 'testuser',
      email: 'test@example.com'
    });

    await expect(userWithoutUsername.save()).rejects.toThrow();
    await expect(userWithoutEmail.save()).rejects.toThrow();
    await expect(userWithoutPassword.save()).rejects.toThrow();
  });

  it('should add liked articles and videos', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();

    user.likedArticles.push('article123');
    user.likedVideos.push('video456');
    await user.save();

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.likedArticles).toContain('article123');
    expect(updatedUser.likedVideos).toContain('video456');
  });

  it('should add user preferences', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      preferences: {
        categories: ['politics', 'technology'],
        sources: ['bbc', 'cnn']
      }
    });
    await user.save();

    const savedUser = await User.findById(user._id);
    expect(savedUser.preferences.categories).toContain('politics');
    expect(savedUser.preferences.categories).toContain('technology');
    expect(savedUser.preferences.sources).toContain('bbc');
    expect(savedUser.preferences.sources).toContain('cnn');
  });
});