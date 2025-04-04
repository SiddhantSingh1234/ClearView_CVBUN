import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import datetime
import uuid
import atexit

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from news_api_scraper import save_articles, fetch_news

# MongoDB connection for test cleanup
from pymongo import MongoClient
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)

# Register function to close MongoDB connection
def close_mongo_connection():
    if client:
        client.close()

atexit.register(close_mongo_connection)

class TestNewsApiScraper(unittest.TestCase):
    
    @patch('news_api_scraper.collection.find_one')
    @patch('news_api_scraper.collection.insert_many')
    @patch('uuid.uuid4')
    def test_save_articles_new(self, mock_uuid, mock_insert, mock_find_one):
        # Mock UUID to return predictable values
        mock_uuid.side_effect = [
            uuid.UUID('12345678-1234-5678-1234-567812345678'),
            uuid.UUID('87654321-4321-8765-4321-876543210987'),
            uuid.UUID('11111111-2222-3333-4444-555555555555'),
            uuid.UUID('99999999-8888-7777-6666-555555555555')
        ]
        
        # Mock find_one to return None (no existing articles)
        mock_find_one.return_value = None
        
        # Sample articles
        articles = [
            {
                "title": "Test Article 1",
                "description": "Test Description 1",
                "content": "Test Content 1",
                "author": "Test Author 1",
                "source": {"name": "BBC News"},
                "url": "https://www.bbc.com/news/test1",
                "urlToImage": "https://example.com/image1.jpg",
                "publishedAt": "2023-01-01T12:00:00Z"
            },
            {
                "title": "Test Article 2",
                "description": "Test Description 2",
                "content": "Test Content 2",
                "author": "Test Author 2",
                "source": {"name": "Fox News"},
                "url": "https://www.foxnews.com/news/test2",
                "urlToImage": "https://example.com/image2.jpg",
                "publishedAt": "2023-01-02T12:00:00Z"
            }
        ]
        
        # Call the function
        save_articles(articles)
        
        # Assertions
        self.assertEqual(mock_find_one.call_count, 2)  # Called for each article
        mock_insert.assert_called_once()  # Articles were inserted
        
        # Check the arguments passed to insert_many
        args, _ = mock_insert.call_args
        inserted_articles = args[0]
        self.assertEqual(len(inserted_articles), 2)
        
        # Check the first article
        self.assertEqual(inserted_articles[0]["title"], "Test Article 1")
        self.assertEqual(inserted_articles[0]["description"], "Test Description 1")
        self.assertEqual(inserted_articles[0]["source"], "BBC News")
        
        # Check the second article
        self.assertEqual(inserted_articles[1]["title"], "Test Article 2")
        self.assertEqual(inserted_articles[1]["description"], "Test Description 2")
        self.assertEqual(inserted_articles[1]["source"], "Fox News")
        
    @patch('news_api_scraper.collection.find_one')
    @patch('news_api_scraper.collection.insert_many')
    def test_save_articles_existing(self, mock_insert, mock_find_one):
        # Mock find_one to return True (articles already exist)
        mock_find_one.return_value = True
        
        # Sample articles
        articles = [
            {
                "title": "Test Article 1",
                "url": "https://www.bbc.com/news/test1",
                "publishedAt": "2023-01-01T12:00:00Z"
            },
            {
                "title": "Test Article 2",
                "url": "https://www.foxnews.com/news/test2",
                "publishedAt": "2023-01-02T12:00:00Z"
            }
        ]
        
        # Call the function
        save_articles(articles)
        
        # Assertions
        self.assertEqual(mock_find_one.call_count, 2)  # Called for each article
        mock_insert.assert_not_called()  # No articles were inserted
        
    @patch('news_api_scraper.collection.find_one')
    @patch('news_api_scraper.collection.insert_many')
    @patch('uuid.uuid4')
    def test_save_articles_mixed(self, mock_uuid, mock_insert, mock_find_one):
        # Mock UUID to return predictable values
        mock_uuid.side_effect = [
            uuid.UUID('12345678-1234-5678-1234-567812345678'),
            uuid.UUID('87654321-4321-8765-4321-876543210987')
        ]
        
        # Mock find_one to return True for the first article and None for the second
        mock_find_one.side_effect = [True, None]
        
        # Sample articles
        articles = [
            {
                "title": "Test Article 1",
                "description": "Test Description 1",
                "content": "Test Content 1",
                "author": "Test Author 1",
                "source": {"name": "BBC News"},
                "url": "https://www.bbc.com/news/test1",
                "urlToImage": "https://example.com/image1.jpg",
                "publishedAt": "2023-01-01T12:00:00Z"
            },
            {
                "title": "Test Article 2",
                "description": "Test Description 2",
                "content": "Test Content 2",
                "author": "Test Author 2",
                "source": {"name": "Fox News"},
                "url": "https://www.foxnews.com/news/test2",
                "urlToImage": "https://example.com/image2.jpg",
                "publishedAt": "2023-01-02T12:00:00Z"
            }
        ]
        
        # Call the function
        save_articles(articles)
        
        # Assertions
        self.assertEqual(mock_find_one.call_count, 2)  # Called for each article
        mock_insert.assert_called_once()  # Articles were inserted
        
        # Check the arguments passed to insert_many
        args, _ = mock_insert.call_args
        inserted_articles = args[0]
        self.assertEqual(len(inserted_articles), 1)
        self.assertEqual(inserted_articles[0]["title"], "Test Article 2")
        
    @patch('news_api_scraper.collection.find_one')
    def test_save_articles_empty(self, mock_find_one):
        # Call the function with an empty list
        with patch('news_api_scraper.collection.insert_many') as mock_insert:
            save_articles([])
            
            # Assertions
            mock_find_one.assert_not_called()  # Not called for empty list
            mock_insert.assert_not_called()  # No articles were inserted
    
    @patch('news_api_scraper.requests.get')
    def test_fetch_news_success(self, mock_get):
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "ok",
            "totalResults": 2,
            "articles": [
                {
                    "title": "Test Article 1",
                    "description": "Test Description 1",
                    "content": "Test Content 1",
                    "author": "Test Author 1",
                    "source": {"name": "BBC News"},
                    "url": "https://www.bbc.com/news/test1",
                    "urlToImage": "https://example.com/image1.jpg",
                    "publishedAt": "2023-01-01T12:00:00Z"
                },
                {
                    "title": "Test Article 2",
                    "description": "Test Description 2",
                    "content": "Test Content 2",
                    "author": "Test Author 2",
                    "source": {"name": "Fox News"},
                    "url": "https://www.foxnews.com/news/test2",
                    "urlToImage": "https://example.com/image2.jpg",
                    "publishedAt": "2023-01-02T12:00:00Z"
                }
            ]
        }
        mock_get.return_value = mock_response
        
        # Call the function
        articles = fetch_news()
        
        # Assertions
        mock_get.assert_called_once()
        self.assertEqual(len(articles), 2)
        self.assertEqual(articles[0]["title"], "Test Article 1")
        self.assertEqual(articles[1]["title"], "Test Article 2")
            
    @patch('news_api_scraper.requests.get')
    def test_fetch_news_api_error(self, mock_get):
        # Mock the response with an error
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            "status": "error",
            "code": "apiKeyInvalid",
            "message": "Your API key is invalid"
        }
        mock_get.return_value = mock_response
        
        # Call the function
        articles = fetch_news()
        
        # Assertions
        mock_get.assert_called_once()
        self.assertEqual(articles, [])  # Should return empty list on error
            
    @patch('news_api_scraper.requests.get')
    def test_fetch_news_request_exception(self, mock_get):
        # Mock get to raise an exception
        mock_get.side_effect = Exception("Connection error")
        
        # Call the function - should handle the exception internally
        with self.assertRaises(Exception):
            fetch_news()
        
        # Assertions
        mock_get.assert_called_once()

if __name__ == '__main__':
    unittest.main()