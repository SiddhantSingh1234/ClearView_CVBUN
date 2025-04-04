import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { Groq } from 'groq-sdk'; // Assuming Groq has an SDK
import dotenv from 'dotenv';

dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the News schema
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
});

// Create a text index on title and content
newsSchema.index({ title: 'text', content: 'text' });

const News = mongoose.model('News', newsSchema);

// Groq API setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Route to handle chatbot queries
app.post('/api/chatbot', async (req, res) => {
  const { question } = req.body;

  try {
    // Fetch relevant news articles from MongoDB using a $text search
    const newsArticles = await News.find(
      { $text: { $search: question } },
      { score: { $meta: 'textScore' } } // Get relevance score
    ).sort({ score: { $meta: 'textScore' } }).limit(5); // Limit to 5 articles

    console.log('Fetched News Articles:', newsArticles);

    // Prepare the prompt for Groq API using title and summarized content
    const articlesSummary = newsArticles.map(article => ({
      title: article.title,
      summary: article.content.split(' ').slice(0, 50).join(' '), // First 50 words
    }));

    const prompt = `Based on the following news articles: ${JSON.stringify(articlesSummary)}, answer this question: ${question}`;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Add a delay before making the API request
    await delay(1000); // 1 second delay

    // Use Groq API to generate a response
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile', // Replace with the recommended model name
    });

    console.log('Groq Response:', JSON.stringify(response, null, 2));
    res.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
