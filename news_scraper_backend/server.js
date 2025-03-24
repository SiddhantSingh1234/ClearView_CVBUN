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

const Article = mongoose.model("Article", articleSchema);

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

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));