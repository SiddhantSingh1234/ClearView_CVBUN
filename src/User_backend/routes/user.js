import express from 'express';
import auth from '../middleware/auth.js';  
import User from '../models/User.js';
import fetch from 'node-fetch';

const router = express.Router();

// Update preferences
router.put('/preferences', auth, async (req, res) => {
  const { preferences } = req.body;
  const userId = req.userId; // From auth middleware

  // Validate input
  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ 
      error: 'Invalid preferences format',
      details: 'Expected { preferences: { categories, sources } }'
    });
  }

  try {
    // Validate preferences structure (customize as needed)
    const requiredFields = ['categories', 'sources'];
    for (const field of requiredFields) {
      if (!Array.isArray(preferences[field])) {
        return res.status(400).json({ 
          error: 'Invalid preferences structure',
          details: `${field} must be an array`
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { 
        new: true,
        runValidators: true // Ensures update follows schema rules
      }
    ).select('preferences'); // Only return preferences field

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Consistent success response
    res.json({
      success: true,
      preferences: updatedUser.preferences,
      message: 'Preferences updated successfully'
    });

  } catch (err) {
    console.error('Update error:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(err.errors).map(e => e.message)
      });
    }

    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

// Like an article
router.post('/articles/:id/like', auth, async (req, res) => {
  const userId = req.userId; // From auth middleware
  const articleId = req.params.id; // Extracted from URL parameter
  // console.log(userId, articleId)
  try {
    const user = await User.findById(userId);
    // console.log(user.likedArticles)
    if (!user.likedArticles.includes(articleId)) {
      // console.log(true)
      user.likedArticles.push(articleId);
      // console.log(user.likedArticles)
      // console.log(true)
      await user.save();
      res.json({ message: 'Article liked', success: true });
    }
    else {
      res.json({ message: 'Article already liked', success: false });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Like an article
router.post('/videos/:id/like', auth, async (req, res) => {
  const userId = req.userId; // From auth middleware
  const videoId = req.params.id; // Extracted from URL parameter
  // console.log(userId, articleId)
  try {
    const user = await User.findById(userId);
    // console.log(user.likedArticles)
    if (!user.likedVideos.includes(videoId)) {
      // console.log(true)
      user.likedVideos.push(videoId);
      // console.log(user.likedArticles)
      // console.log(true)
      await user.save();
      res.json({ message: 'Video liked', success: true });
    }
    else {
      res.json({ message: 'Video already liked', success: false });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a comment
router.post('/articles/:id/comment', auth, async (req, res) => {
  try {
    const articleId = req.params.id;
    const { text } = req.body;
    const userId = req.userId;
    // console.log(userId, articleId, text)
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    // Get user info
    const user = await User.findById(userId);
    // console.log(user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add comment to user's profile
    if (!user.comments) {
      user.comments = [];
    }
    
    user.comments.push({
      articleId,
      text
    });
    
    await user.save();
    console.log(user.username)
    
    // Now post the comment to the news backend
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userId,
          userName: user.username,
          text
        })
      });
      
      if (!response.ok) {
        throw new Error(`News backend returned status ${response.status}`);
      }
      
      const updatedArticle = await response.json();
      
      res.json({ 
        success: true, 
        message: 'Comment added successfully',
        article: updatedArticle
      });
    } catch (error) {
      console.error('Error posting comment to news backend:', error);
      // Still return success since we saved to user profile
      res.json({ 
        success: true, 
        message: 'Comment added to user profile, but failed to update article',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

export default router;
