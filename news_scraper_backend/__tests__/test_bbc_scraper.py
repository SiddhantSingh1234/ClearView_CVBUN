import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import datetime
from pymongo import MongoClient
import requests
from bs4 import BeautifulSoup
import re
import time
import atexit  # Add this import for cleanup

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from bbc_scraper import get_article_details, scrape_articles

# MongoDB connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["news_db"]
collection = db["articles"]

# Register a function to close the MongoDB connection when the script exits
def close_mongo_connection():
    if 'client' in globals() and client:
        client.close()

atexit.register(close_mongo_connection)

class TestBBCScraper(unittest.TestCase):
    
    @patch('bbc_scraper.requests.get')
    def test_get_article_details_success(self, mock_get):
        # Mock the response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = """
        <html>
            <head>
                <meta name="description" content="Test description">
                <meta property="og:image" content="https://example.com/image.jpg">
            </head>
            <body>
                <article>
                    <p>Test paragraph 1</p>
                    <p>Test paragraph 2</p>
                </article>
                <div class="ssrcss-68pt20-Contributor">John Doe</div>
                <a class="ssrcss-1sbyv9-SectionLink">Politics</a>
                <div class="ssrcss-1ynkz29-TagList">
                    <a>Tag1</a>
                    <a>Tag2</a>
                </div>
            </body>
        </html>
        """
        mock_get.return_value = mock_response
        
        # Call the function
        details = get_article_details("https://www.bbc.com/news/test-article")
        
        # Assertions
        self.assertEqual(details["description"], "Test description")
        self.assertEqual(details["content"], "Test paragraph 1 Test paragraph 2")
        self.assertEqual(details["author"], "John Doe")
        self.assertEqual(details["imageUrl"], "https://example.com/image.jpg")
        self.assertEqual(details["category"], "Politics")
        self.assertEqual(details["topics"], ["Tag1", "Tag2"])
        
    @patch('bbc_scraper.requests.get')
    def test_get_article_details_failure(self, mock_get):
        # Mock a failed response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        # Call the function
        details = get_article_details("https://www.bbc.com/news/nonexistent")
        
        # Assertions
        self.assertEqual(details, {})
        
    @patch('bbc_scraper.requests.get')
    @patch('bbc_scraper.get_article_details')
    @patch('bbc_scraper.collection.find_one')
    @patch('bbc_scraper.collection.insert_many')
    def test_scrape_articles_success(self, mock_insert, mock_find, mock_details, mock_get):
        # Mock the homepage response
        mock_homepage = MagicMock()
        mock_homepage.status_code = 200
        mock_homepage.text = """
        <html>
            <body>
                <a href="/news/article1"><h2>Article 1</h2></a>
                <a href="https://www.bbc.com/news/article2"><h2>Article 2</h2></a>
            </body>
        </html>
        """
        mock_get.return_value = mock_homepage
        
        # Mock find_one to return None (no existing articles)
        mock_find.return_value = None
        
        # Mock get_article_details to return sample details
        mock_details.return_value = {
            "description": "Test description",
            "content": "Test content",
            "author": "BBC News",
            "imageUrl": "https://example.com/image.jpg",
            "category": "Politics",
            "topics": ["Politics", "UK"]
        }
        
        # Call the function
        scrape_articles()
        
        # Assertions
        self.assertEqual(mock_find.call_count, 2)  # Called for each article
        self.assertEqual(mock_details.call_count, 2)  # Called for each article
        mock_insert.assert_called_once()  # Articles were inserted
        
    @patch('bbc_scraper.requests.get')
    def test_scrape_articles_homepage_failure(self, mock_get):
        # Mock a failed homepage response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        # Call the function
        result = scrape_articles()
        
        # Assertions
        self.assertEqual(result, None)
        
    @patch('bbc_scraper.requests.get')
    @patch('bbc_scraper.collection.find_one')
    @patch('bbc_scraper.get_article_details')
    def test_scrape_articles_with_exception(self, mock_details, mock_find, mock_get):
        # Mock the homepage response
        mock_homepage = MagicMock()
        mock_homepage.status_code = 200
        mock_homepage.text = """
        <html>
            <body>
                <a href="/news/article1"><h2>Article 1</h2></a>
            </body>
        </html>
        """
        mock_get.return_value = mock_homepage
        
        # Mock find_one to return None (no existing articles)
        mock_find.return_value = None
        
        # Mock get_article_details to raise an exception
        mock_details.side_effect = Exception("Test exception")
        
        # Call the function with patch for insert_many
        with patch('bbc_scraper.collection.insert_many') as mock_insert:
            scrape_articles()
            
            # Assertions
            mock_insert.assert_not_called()  # No articles were inserted due to exception

if __name__ == '__main__':
    unittest.main()