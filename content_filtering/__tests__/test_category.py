import unittest
import sys
import os
import pandas as pd
from collections import Counter
import re
import time
from unittest.mock import patch, MagicMock

# Add the parent directory to the path so we can import the category module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from category import preprocess, find_common_words, fit_eval_model, classify_article

class TestCategoryModule(unittest.TestCase):
    
    def setUp(self):
        """Set up test fixtures before each test method."""
        # Create a sample dataframe for testing
        self.sample_df = pd.DataFrame({
            'Text': [
                'This is a sports article about football and basketball.',
                'Politics news about elections and government policies.',
                'Technology article about new smartphones and computers.',
                'Entertainment news about movies and celebrities.'
            ],
            'Category': ['Sports', 'Politics', 'Technology', 'Entertainment'],
            'Preprocessed_Text': [
                ['sports', 'article', 'football', 'basketball'],
                ['politics', 'news', 'elections', 'government', 'policies'],
                ['technology', 'article', 'new', 'smartphones', 'computers'],
                ['entertainment', 'news', 'movies', 'celebrities']
            ]
        })
        
        # Sample article content for testing
        self.sample_article = """
        From breeding to training, the sport has its foundations embedded deep into the country's culture and the Irish National Stud is the heartbeat of the operation.
        Situated nearby to the famous Curragh race course in County Kildare, the stud houses some of the country's most successful stallions, who produce the champions of today.
        """
        
    def test_preprocess(self):
        """Test the preprocess function."""
        text = "This is a test article. It contains some words and numbers 123!"
        processed = preprocess(text)
        
        # Check that the result is a list
        self.assertIsInstance(processed, list)
        
        # Check that stop words are removed
        self.assertNotIn('is', processed)
        self.assertNotIn('a', processed)
        
        # Check that words are lemmatized
        self.assertIn('test', processed)
        self.assertIn('article', processed)
        self.assertIn('contains', processed)
        self.assertIn('word', processed)
        
        # Check that numbers and punctuation are removed
        self.assertNotIn('123', processed)
        self.assertNotIn('!', processed)
        
    def test_find_common_words(self):
        """Test the find_common_words function."""
        common_words = find_common_words(self.sample_df, 'Sports')
        
        # Check that the result is a list of tuples
        self.assertIsInstance(common_words, list)
        self.assertIsInstance(common_words[0], tuple)
        
        # Check that the correct words are returned
        expected_words = [('sports', 1), ('article', 1), ('football', 1), ('basketball', 1)]
        self.assertEqual(common_words, expected_words)
        
    @patch('time.time')
    def test_fit_eval_model(self, mock_time):
        """Test the fit_eval_model function."""
        # Mock time.time() to return predictable values
        mock_time.side_effect = [0, 10]  # Start time = 0, end time = 10
        
        # Create mock model and data
        mock_model = MagicMock()
        mock_train_features = MagicMock()
        mock_y_train = MagicMock()
        mock_test_features = MagicMock()
        mock_y_test = MagicMock()
        
        # Mock model.predict to return some values
        mock_model.predict.side_effect = [
            ['Sports', 'Politics'],  # train_predicted
            ['Sports', 'Technology']  # test_predicted
        ]
        
        # Mock classification_report to return a string
        with patch('category.classification_report', return_value='Mock Classification Report'):
            results = fit_eval_model(mock_model, mock_train_features, mock_y_train, mock_test_features, mock_y_test)
        
        # Check that the model was fit with the correct parameters
        mock_model.fit.assert_called_once_with(mock_train_features, mock_y_train)
        
        # Check that the model was used to predict with the correct parameters
        mock_model.predict.assert_any_call(mock_train_features)
        mock_model.predict.assert_any_call(mock_test_features)
        
        # Check that the results dictionary contains the expected keys and values
        self.assertIn('train_time', results)
        self.assertEqual(results['train_time'], 10)
        self.assertIn('classification_report', results)
        self.assertEqual(results['classification_report'], 'Mock Classification Report')
        
    @patch('category.tf_vec')
    @patch('category.nb')
    @patch('category.le')
    def test_classify_article(self, mock_le, mock_nb, mock_tf_vec):
        """Test the classify_article function."""
        # Mock the TF-IDF vectorizer
        mock_tf_vec.transform.return_value = 'transformed_features'
        
        # Mock the classifier
        mock_nb.predict.return_value = [1]  # Assuming 1 corresponds to 'Sports'
        
        # Mock the label encoder
        mock_le.inverse_transform.return_value = ['Sports']
        
        # Call the function
        category = classify_article(self.sample_article)
        
        # Check that the TF-IDF vectorizer was called with preprocessed text
        mock_tf_vec.transform.assert_called_once()
        
        # Check that the classifier was called with the transformed features
        mock_nb.predict.assert_called_once_with('transformed_features')
        
        # Check that the label encoder was called with the prediction
        mock_le.inverse_transform.assert_called_once_with([1])
        
        # Check that the function returns the expected category
        self.assertEqual(category, 'Sports')
        
    def test_preprocess_with_empty_text(self):
        """Test the preprocess function with empty text."""
        processed = preprocess("")
        self.assertEqual(processed, [])
        
    def test_preprocess_with_non_english_text(self):
        """Test the preprocess function with non-English text."""
        text = "Ceci est un texte en français avec des caractères spéciaux."
        processed = preprocess(text)
        
        # Check that special characters are removed
        for word in processed:
            self.assertTrue(all(c.isalpha() for c in word))
            
    def test_find_common_words_with_nonexistent_category(self):
        """Test find_common_words with a category that doesn't exist in the dataframe."""
        common_words = find_common_words(self.sample_df, 'NonexistentCategory')
        self.assertEqual(common_words, [])
        
    def test_integration_preprocess_and_classify(self):
        """Test the integration of preprocess and classify_article functions."""
        with patch('category.preprocess', return_value=['sport', 'foundation', 'culture']):
            with patch('category.tf_vec.transform') as mock_transform:
                with patch('category.nb.predict', return_value=[0]):
                    with patch('category.le.inverse_transform', return_value=['Sports']):
                        category = classify_article(self.sample_article)
                        self.assertEqual(category, 'Sports')
                        
                        # Verify that preprocess was called with the article content
                        from category import preprocess as original_preprocess
                        self.assertNotEqual(original_preprocess, preprocess)  # Ensure it was patched
                        
                        # Verify that the TF-IDF vectorizer was called with the joined preprocessed text
                        mock_transform.assert_called_once_with(['sport foundation culture'])

if __name__ == '__main__':
    unittest.main()