import unittest
from unittest.mock import patch, MagicMock
import sys
import os
import datetime

# Add the parent directory to the path so we can import the modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fox_scraper import get_article_details, scrape_articles

class TestFoxScraper(unittest.TestCase):
    
    @patch('fox_scraper.requests.get')
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
                <div class="author-byline">Jane Smith</div>
                <div class="eyebrow">Politics</div>
                <div class="tag">Tag1</div>
                <div class="tag">Tag2</div>
            </body>
        </html>
        """
        mock_get.return_value = mock_response
        
        # Call the function
        details = get_article_details("https://www.foxnews.com/politics/test-article")
        
        # Assertions
        self.assertEqual(details["description"], "Test description")
        self.assertEqual(details["content"], "Test paragraph 1 Test paragraph 2")
        self.assertEqual(details["author"], "Jane Smith")
        self.assertEqual(details["imageUrl"], "https://example.com/image.jpg")
        self.assertEqual(details["category"], "Politics")
        self.assertEqual(details["topics"], ["Tag1", "Tag2"])
        
    @patch('fox_scraper.requests.get')
    def test_get_article_details_failure(self, mock_get):
        # Mock a failed response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response
        
        # Call the function
        details = get_article_details("https://www.foxnews.com/nonexistent")
        
        # Assertions
        self.assertEqual(details, {})
        
    @patch('fox_scraper.requests.get')
    @patch('fox_scraper.get_article_details')
    @patch('fox_scraper.collection.find_one')
    @patch('fox_scraper.collection.insert_many')
    def test_scrape_articles_success(self, mock_insert, mock_find, mock_details, mock_get):
        # Mock the homepage response
        mock_homepage = MagicMock()
        mock_homepage.status_code = 200
        mock_homepage.text = """
        <html>
            <body>
                <h2 class="title"><a href="/politics/article1">Article 1</a></h2>
                <h2 class="title"><a href="https://www.foxnews.com/politics/article2">Article 2</a></h2>
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
            "author": "Fox News",
            "imageUrl": "https://example.com/image.jpg",
            "category": "Politics",
            "topics": ["Politics", "US"]
        }
        
        # Call the function
        scrape_articles()
        
        # Assertions
        self.assertEqual(mock_find.call_count, 2)  # Called for each article
        self.assertEqual(mock_details.call_count, 2)  # Called for each article
        mock_insert.assert_called_once()  # Articles were inserted
        
    @patch('fox_scraper.requests.get')
    def test_scrape_articles_homepage_failure(self, mock_get):
        # Mock a failed homepage response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        # Call the function
        result = scrape_articles()
        
        # Assertions
        self.assertEqual(result, None)
        
    @patch('fox_scraper.requests.get')
    @patch('fox_scraper.collection.find_one')
    @patch('fox_scraper.get_article_details')
    def test_scrape_articles_with_exception(self, mock_details, mock_find, mock_get):
        # Mock the homepage response
        mock_homepage = MagicMock()
        mock_homepage.status_code = 200
        mock_homepage.text = """
        <html>
            <body>
                <h2 class="title"><a href="/politics/article1">Article 1</a></h2>
            </body>
        </html>
        """
        mock_get.return_value = mock_homepage
        
        # Mock find_one to return None (no existing articles)
        mock_find.return_value = None
        
        # Mock get_article_details to raise an exception
        mock_details.side_effect = Exception("Test exception")
        
        # Call the function with patch for insert_many
        with patch('fox_scraper.collection.insert_many') as mock_insert:
            scrape_articles()
            
            # Assertions
            mock_insert.assert_not_called()  # No articles were inserted due to exception

if __name__ == '__main__':
    unittest.main()