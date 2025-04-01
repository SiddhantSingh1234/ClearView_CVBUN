# import pandas as pd
# import re 

# import nltk 
# from nltk.tokenize import RegexpTokenizer
# from collections import Counter 
# from nltk.tokenize import word_tokenize
# from nltk.stem import WordNetLemmatizer
# from nltk.corpus import stopwords

# import numpy as np 
# import matplotlib.pyplot as plt

# from sklearn.feature_extraction.text import TfidfVectorizer, TfidfTransformer
# from sklearn.model_selection import train_test_split
# from sklearn import svm
# from sklearn.naive_bayes import MultinomialNB
# from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier
# from sklearn.tree import DecisionTreeClassifier
# import xgboost 
# from sklearn.metrics  import classification_report
# from sklearn import metrics
# from sklearn.preprocessing import LabelEncoder
# import time

# # Text preprocessing
# def preprocess(text):
    
#     """
#     Function: split text into words and return the root form of the words
#     Args:
#       text(str): the article
#     Return:
#       lem(list of str): a list of the root form of the article words
#     """
        
#     # Normalize text
#     text = re.sub(r"[^a-zA-Z]", " ", str(text).lower())
    
#     # Tokenize text
#     token = word_tokenize(text)
    
#     # Remove stop words
#     stop = stopwords.words("english")
#     words = [t for t in token if t not in stop]
    
#     # Lemmatization
#     lem = [WordNetLemmatizer().lemmatize(w) for w in words]
    
#     return lem

# # Find the common words in each category
# def find_common_words(df, category):
        
#     """
#     Function: find the most frequent words in the category and return the them
#     Args:
#       df(dataframe): the dataframe of articles
#       category(str): the category name
#     Return:
#       the most frequant words in the category
#     """
        
#     # Create dataframes for the category
#     cat_df = df[df["Category"]==category]
    
#     # Initialize words list for the category
#     words = [word for tokens in cat_df["Preprocessed_Text"] for word in tokens]
    
#     # Count words frequency
#     words_counter = Counter(words)
 
#     return words_counter.most_common(10)

# # Train and evaluate model
# def fit_eval_model(model, train_features, y_train, test_features, y_test):
    
#     """
#     Function: train and evaluate a machine learning classifier.
#     Args:
#       model: machine learning classifier
#       train_features: train data extracted features
#       y_train: train data lables
#       test_features: train data extracted features
#       y_test: train data lables
#     Return:
#       results(dictionary): a dictionary of the model training time and classification report
#     """
#     results ={}
    
#     # Start time
#     start = time.time()
#     # Train the model
#     model.fit(train_features, y_train)
#     # End time
#     end = time.time()
#     # Calculate the training time
#     results['train_time'] = end - start
 
#     # Test the model
#     train_predicted = model.predict(train_features)
#     test_predicted = model.predict(test_features)
    
#      # Classification report
#     results['classification_report'] = classification_report(y_test, test_predicted)
        
#     return results

# def classify_article(path):
#     """
#     Function: Classify an article.
#     Args:
#       path (str): The path of the article file.
#     Returns:
#       category (str): The predicted category of the article.
#     """
#     # Read file
#     with open(path, 'r') as file:
#         artcl = file.read()

#     # Text preprocessing
#     artcl = preprocess(artcl)
#     artcl = ' '.join(artcl)

#     # Use TF-IDF for feature extraction
#     test = tf_vec.transform([artcl])

#     # Predict using MultinomialNB model
#     predict = nb.predict(test)
    
#     # Convert numerical prediction back to category name
#     category = le.inverse_transform([predict[0]])[0]  # Convert encoded label back to original

#     return category



# df1 = pd.read_csv('BBC News Train.csv')
# category = list(df1['Category'].unique())
# df1["Preprocessed_Text"] = df1['Text'].apply(lambda x: preprocess(x))

# # print("Most common words in each category")
# # for c in category:
# #     print(c, " News")
# #     print(find_common_words(df1, c))
# #     print()

# df1['Preprocessed_Text2'] = df1['Preprocessed_Text'].apply(' '.join)

# X = df1['Preprocessed_Text2']
# y = df1['Category']



# # Split data
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2)

# # Use TF-IDF
# tf_vec = TfidfVectorizer()
# train_features = tf_vec.fit(X_train)
# train_features = tf_vec.transform(X_train)
# test_features = tf_vec.transform(X_test)

# # Initialize the models
# # sv = svm.SVC()
# # ab = AdaBoostClassifier(random_state = 1)
# # gb = GradientBoostingClassifier(random_state = 1)
# # xgb = xgboost.XGBClassifier(random_state = 1)
# # tree = DecisionTreeClassifier()
# nb = MultinomialNB()

# # Encode target labels as integers
# le = LabelEncoder()
# y_train_encoded = le.fit_transform(y_train)
# y_test_encoded = le.transform(y_test)

# # Fit and evaluate models
# results = {}
# # for cls in [sv, ab, gb, xgb, tree, nb]:  
# for cls in [nb]:  # As it takes a long time to run all models, we will only run the Naive Bayes model
#     cls_name = cls.__class__.__name__
#     results[cls_name] = fit_eval_model(cls, train_features, y_train_encoded, test_features, y_test_encoded)
    

# # Logic for updating the category of the article in the database. Content to be fed.



import pandas as pd
import re 

import nltk
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('wordnet')
from nltk.tokenize import RegexpTokenizer
from collections import Counter 
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords

import numpy as np 

from sklearn.feature_extraction.text import TfidfVectorizer, TfidfTransformer
from sklearn.model_selection import train_test_split
from sklearn import svm
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier

from sklearn.metrics  import classification_report
from sklearn import metrics
from sklearn.preprocessing import LabelEncoder
import time
from pymongo import MongoClient

# MongoDB Atlas connection
MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["news_db"]
collection = db["articles"]

# Text preprocessing
def preprocess(text):
    """
    Function: split text into words and return the root form of the words
    Args:
      text(str): the article
    Return:
      lem(list of str): a list of the root form of the article words
    """
    
    # Normalize text
    text = re.sub(r"[^a-zA-Z]", " ", str(text).lower())
    
    # Tokenize text
    token = word_tokenize(text)
    
    # Remove stop words
    stop = stopwords.words("english")
    words = [t for t in token if t not in stop]
    
    # Lemmatization
    lem = [WordNetLemmatizer().lemmatize(w) for w in words]
    
    return lem

# Find the common words in each category
def find_common_words(df, category):
    """
    Function: find the most frequent words in the category and return them
    Args:
      df(dataframe): the dataframe of articles
      category(str): the category name
    Return:
      the most frequent words in the category
    """
    
    # Create dataframes for the category
    cat_df = df[df["Category"]==category]
    
    # Initialize words list for the category
    words = [word for tokens in cat_df["Preprocessed_Text"] for word in tokens]
    
    # Count words frequency
    words_counter = Counter(words)
 
    return words_counter.most_common(10)

# Train and evaluate model
def fit_eval_model(model, train_features, y_train, test_features, y_test):
    """
    Function: train and evaluate a machine learning classifier.
    Args:
      model: machine learning classifier
      train_features: train data extracted features
      y_train: train data labels
      test_features: train data extracted features
      y_test: train data labels
    Return:
      results(dictionary): a dictionary of the model training time and classification report
    """
    results ={}
    
    # Start time
    start = time.time()
    # Train the model
    model.fit(train_features, y_train)
    # End time
    end = time.time()
    # Calculate the training time
    results['train_time'] = end - start
 
    # Test the model
    train_predicted = model.predict(train_features)
    test_predicted = model.predict(test_features)
    
     # Classification report
    results['classification_report'] = classification_report(y_test, test_predicted)
        
    return results

def classify_article(content):
    """
    Function: Classify an article.
    Args:
      content (str): The text of the article.
    Returns:
      category (str): The predicted category of the article.
    """
    # Text preprocessing
    artcl = preprocess(content)
    artcl = ' '.join(artcl)

    # Use TF-IDF for feature extraction
    test = tf_vec.transform([artcl])

    # Predict using MultinomialNB model
    predict = nb.predict(test)
    
    # Convert numerical prediction back to category name
    category = le.inverse_transform([predict[0]])[0]  # Convert encoded label back to original

    return category

df1 = pd.read_csv('BBC News Train.csv')
category = list(df1['Category'].unique())
df1["Preprocessed_Text"] = df1['Text'].apply(lambda x: preprocess(x))

df1['Preprocessed_Text2'] = df1['Preprocessed_Text'].apply(' '.join)

X = df1['Preprocessed_Text2']
y = df1['Category']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Use TF-IDF
tf_vec = TfidfVectorizer()
train_features = tf_vec.fit(X_train)
train_features = tf_vec.transform(X_train)
test_features = tf_vec.transform(X_test)

# Initialize the models
nb = MultinomialNB()

# Encode target labels as integers
le = LabelEncoder()
y_train_encoded = le.fit_transform(y_train)
y_test_encoded = le.transform(y_test)

# Fit and evaluate models
results = {}
for cls in [nb]:  
    cls_name = cls.__class__.__name__
    results[cls_name] = fit_eval_model(cls, train_features, y_train_encoded, test_features, y_test_encoded)

# Fetch and classify news articles from MongoDB
articles = collection.find({"category": "General"})  # Filter articles needing classification

for article in articles:
    content = article.get("content", "")

    if content:
        category_name = classify_article(content)
        collection.update_one({"_id": article["_id"]}, {"$set": {"category": category_name.capitalize()}})
        print(f"Updated article {article['_id']} with category: {category_name.capitalize()}")

print("Category classification and update completed.")
