import express from 'express';
import auth from '../middleware/auth.js';  
import User from '../models/User.js';

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
router.post('/like', auth, async (req, res) => {
  const { userId, articleId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user.likedArticles.includes(articleId)) {
      user.likedArticles.push(articleId);
      await user.save();
    }
    res.json({ message: 'Article liked' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a comment
router.post('/comment', auth, async (req, res) => {
  const { userId, articleId, text } = req.body;
  try {
    const user = await User.findById(userId);
    user.comments.push({ articleId, text });
    await user.save();
    res.json({ message: 'Comment added' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;


// import express from 'express';
// import auth from '../middleware/auth.js';  
// import User from '../models/User.js';

// const router = express.Router();

// // Update preferences
// router.put('/preferences', auth, async (req, res) => {
//   const { preferences } = req.body;
//   const userId = req.userId; // Extracted from the auth middleware

//   try {
//     const user = await User.findByIdAndUpdate(
//       userId,
//       { preferences },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Send the updated user object in the response
//     res.json({ preferences: user.preferences });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Like an article
// router.post('/like', auth, async (req, res) => {
//   const { userId, articleId } = req.body;
//   try {
//     const user = await User.findById(userId);
//     if (!user.likedArticles.includes(articleId)) {
//       user.likedArticles.push(articleId);
//       await user.save();
//     }
//     res.json({ message: 'Article liked' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Add a comment
// router.post('/comment', auth, async (req, res) => {
//   const { userId, articleId, text } = req.body;
//   try {
//     const user = await User.findById(userId);
//     user.comments.push({ articleId, text });
//     await user.save();
//     res.json({ message: 'Comment added' });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// export default router;
