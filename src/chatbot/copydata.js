import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define the Article schema
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  description: String,
  author: String,
  source: String,
  url: String,
  imageUrl: String,
  publishedAt: Date,
  category: String,
  topics: [String],
  likes: Number,
  comments: [String],
});

// Define the News schema
const newsSchema = new mongoose.Schema({
  title: String,
  content: String,
});

// Create the Article and News models
const Article = mongoose.model('Article', articleSchema);
const News = mongoose.model('News', newsSchema);

// Function to copy data from articles to news
const copyData = async () => {
  try {
    // Fetch all articles
    const articles = await Article.find({}, { title: 1, content: 1, _id: 0 });

    // Insert the data into the news collection
    await News.insertMany(articles);

    console.log('Data copied successfully!');
  } catch (error) {
    console.error('Error copying data:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the copyData function
copyData();