import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors()); // Enable CORS

// MongoDB Connection
const MONGO_URI = "mongodb://127.0.0.1:27017/news_db";

mongoose.connect(MONGO_URI, {authSource: "admin"})
.then(() => console.log("Connected to MongoDB!"))
.catch(err => console.error("MongoDB Connection Error:", err));

// Define Schema & Model
const articleSchema = new mongoose.Schema({
  _id: { type: String, default: null },
  id: { type: String, default: null },
  title: { type: String, default: "Untitled News" },
  description: { type: String, default: "No description available." },
  content: { type: String, default: "No content available." },
  author: { type: String, default: "Unknown Author" },
  source: { type: String, default: "Unknown Source" },
  url: { type: String, default: "https://bbc.com/news" },
  imageUrl: { type: String, default: "https://via.placeholder.com/150" },
  publishedAt: { type: Date, default: Date.now },
  category: { type: String, default: "General" },
  topics: { type: [String], default: ["news"] },
  likes: { type: Number, default: 0 },
  comments: { type: [String], default: [] },
});

const videoSchema = new mongoose.Schema({
  _id: { type: String, default: null },
  id: { type: String, default: null },
  title: { type: String, default: "Untitled Video" },
  description: { type: String, default: "No description available." },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: "https://via.placeholder.com/300x169" },
  duration: { type: String, default: "00:00" },
  source: { type: String, default: "BBC News" },
  url: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now },
  category: { type: String, default: "General" },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  isDeepfake: { type: Boolean, default: null },
  deepfakeScore: { type: Number, default: null },
  analyzed: { type: Boolean, default: false }
});

const Article = mongoose.model("Article", articleSchema);
const Video = mongoose.model("Video", videoSchema);

// GET News API
app.get("/news", async (req, res) => {
  try {
    let articles = await Article.find({}).sort({ _id: -1 }); // Fetch in reverse order
    
    // Format response
    let formattedArticles = [];
    for (let i = 0; i < articles.length; i++) {
      try {
        const article = articles[i];
        const formattedArticle = {
          _id: article._id,
          id: article.id,
          title: article.title,
          description: article.description,
          content: article.content,
          author: article.author,
          source: article.source,
          url: article.url,
          imageUrl: article.imageUrl,
          publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
          category: article.category,
          topics: article.topics,
          likes: article.likes,
          comments: article.comments,
        };
        formattedArticles.push(formattedArticle);
      } catch (formatError) {
        console.error(`Error formatting article at index ${i}:`, formatError);
      }
    }
    
    res.json(formattedArticles);
  } catch (error) {
    console.error("Error in /news route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /for_you_news - Fetch news articles with optional filters
app.get("/for_you_news", async (req, res) => {
  try {
    let filter = {};
    
    if (req.query.filter) {
      try {
        const parsedFilter = JSON.parse(req.query.filter); // Parse JSON filter from query string
        const orConditions = [];
        
        if (parsedFilter.category) {
          orConditions.push({ category: { $in: parsedFilter.category.$in } });
        }
        
        if (parsedFilter.source) {
          orConditions.push({ source: { $in: parsedFilter.source.$in } });
        }
        
        if (orConditions.length > 0) {
          filter = { $or: orConditions };
        }
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid filter format" });
      }
    }
    
    let articles = await Article.find(filter).sort({ _id: -1 });
    
    const formattedArticles = articles.map(article => ({
      _id: article._id,
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      author: article.author,
      source: article.source,
      url: article.url,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      category: article.category,
      topics: article.topics,
      likes: article.likes,
      comments: article.comments,
    }));

    res.json(formattedArticles);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET single article API
app.get("/api/articles/:id", async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    const formattedArticle = {
      _id: article._id,
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      author: article.author,
      source: article.source,
      url: article.url,
      imageUrl: article.imageUrl,
      publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
      category: article.category,
      topics: article.topics,
      likes: article.likes,
      comments: article.comments,
    };
    
    res.json(formattedArticle);
  } catch (error) {
    console.error("Error in /api/articles/:id route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST: Like an Article
app.post("/api/articles/:id/like", async (req, res) => {
  try {
    const article = await Article.findOne({ id: req.params.id });
    
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    article.likes = (article.likes || 0) + 1;
    await article.save();
    
    res.json(article);
  } catch (error) {
    console.error("Error liking article:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET Videos API
app.get("/videos", async (req, res) => {
  try {
    let videos = await Video.find({}).sort({ publishedAt: -1 }); // Fetch in reverse chronological order
    
    // Format response
    let formattedVideos = videos.map(video => ({
      _id: video._id,
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      source: video.source,
      url: video.url,
      publishedAt: video.publishedAt ? video.publishedAt.toISOString() : null,
      category: video.category,
      views: video.views,
      likes: video.likes,
      isDeepfake: video.isDeepfake,
      deepfakeScore: video.deepfakeScore,
      analyzed: video.analyzed
    }));
    
    res.json(formattedVideos);
  } catch (error) {
    console.error("Error in /videos route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // POST: Like an Article
// app.post("/api/articles/:id/like", async (req, res) => {
//   // ... existing article like endpoint code ...
// });

// POST: Like a Video
app.post("/api/videos/:id/like", async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { id: req.params.id },
      { $inc: { likes: 1 } },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    res.json(video);
  } catch (error) {
    console.error("Error liking video:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add this endpoint to update video analysis results
app.post("/api/videos/:id/submit-analysis", async (req, res) => {
  try {
    // First, find the video
    const video = await Video.findOne({ id: req.params.id });
    
    if (!video) {
      console.error(`Video not found with id: ${req.params.id}`);
      return res.status(404).json({ error: "Video not found" });
    }

    console.log(`Analyzing video: ${video.title}`);

    try {
      // Call the deepfake detection service
      const response = await fetch('http://127.0.0.1:8000/analyze_videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl: video.videoUrl,
          videoId: video.id
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis service returned status ${response.status}`);
      }

      const analysisResult = await response.json();
      console.log('Analysis result:', analysisResult);

      // Make sure we have valid values
      const isDeepfake = typeof analysisResult.isDeepfake === 'boolean' 
        ? analysisResult.isDeepfake 
        : false;
        
      const deepfakeScore = typeof analysisResult.deepfakeScore === 'number' 
        ? Math.max(0, Math.min(1, analysisResult.deepfakeScore)) // Ensure between 0 and 1
        : 0.0;

      // Update with all the details from the analysis
    const updatedVideo = await Video.findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: {
          isDeepfake: analysisResult.isDeepfake,
          deepfakeScore: analysisResult.deepfakeScore,
          analyzed: true,
          details: analysisResult.details || {
            metadata_score: 0,
            visual_artifacts_score: 0,
            audio_sync_score: 0
          }
        }
      },
      { new: true }
    );

      if (!updatedVideo) {
        throw new Error('Failed to update video in database');
      }

      console.log('Video updated successfully:', {
        id: updatedVideo.id,
        isDeepfake: updatedVideo.isDeepfake,
        deepfakeScore: updatedVideo.deepfakeScore
      });
      
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error in deepfake analysis:", error);
      
      // Mark as analyzed but with default values
      const updatedVideo = await Video.findOneAndUpdate(
        { id: req.params.id },
        { 
          $set: {
            isDeepfake: false,
            deepfakeScore: 0.0,
            analyzed: true
          }
        },
        { new: true }
      );
      
      res.json(updatedVideo);
    }
  } catch (error) {
    console.error("Error in submit-analysis:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});
// Add a test endpoint to directly update the database
app.post("/api/videos/:id/test-update", async (req, res) => {
  try {
    console.log("Testing direct database update for video ID:", req.params.id);
    
    const updateResult = await Video.findOneAndUpdate(
      { id: req.params.id },
      { 
        $set: {
          isDeepfake: true,
          deepfakeScore: 0.75,
          analyzed: true
        }
      },
      { new: true }
    ).exec();

    console.log("Test update result:", updateResult);

    if (!updateResult) {
      throw new Error('Test update failed');
    }

    res.json(updateResult);
  } catch (error) {
    console.error("Error in test update:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));