# from flask import Flask, jsonify
# from pymongo import MongoClient
# from flask_cors import CORS
# from bson import ObjectId
# import datetime

# app = Flask(__name__)
# CORS(app)  # Enable CORS to allow frontend access

# # MongoDB Connection
# MONGO_URI = "mongodb+srv://siddhantsingh:5RhPCpEZG0uOEW2A@clearview.watxj.mongodb.net/?retryWrites=true&w=majority&appName=ClearView"
# client = MongoClient(MONGO_URI)
# db = client["news_db"]
# collection = db["articles"]

# @app.route('/news', methods=['GET'])
# def get_news():
#     articles = list(collection.find({}))  # Fetch stored articles
#     for article in articles:
#         article['_id'] = str(article['_id'])  # Convert ObjectId to string
#         article.setdefault('id', str(ObjectId()))
#         article.setdefault('title', 'Untitled News')
#         article.setdefault('description', 'No description available.')
#         article.setdefault('content', 'No content available.')
#         article.setdefault('author', 'Unknown Author')
#         article.setdefault('source', 'Unknown Source')
#         article.setdefault('url', 'https://example.com')
#         article.setdefault('imageUrl', 'https://via.placeholder.com/150')
#         article.setdefault('publishedAt', datetime.datetime.utcnow().isoformat())
#         article.setdefault('category', 'General')
#         article.setdefault('topics', ['news'])
#         article.setdefault('likes', 0)
#         article.setdefault('comments', [])
#     return jsonify(articles)

# if __name__ == "__main__":
#     app.run(debug=True)
from flask import Flask, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from flask_cors import CORS
from bson import ObjectId
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend access

uri = "mongodb+srv://siddhantsingh:5RhPCpEZG0uOEW2A@clearview.watxj.mongodb.net/?retryWrites=true&w=majority&appName=ClearView"
# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))
# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
db = client["news_db"]
collection = db["articles"]

@app.route('/news', methods=['GET'])
def get_news():
    articles = list(collection.find({}))  # Fetch stored articles
    articles = articles[::-1]

    formatted_articles = []
    for article in articles:
        formatted_articles.append({
            '_id': str(article['_id']),  # Convert ObjectId to string
            'id': str(article.get('_id', ObjectId())),
            'title': article.get('title', 'Untitled News'),
            'description': article.get('description', 'No description available.'),
            'content': article.get('content', 'No content available.'),
            'author': article.get('author', 'Unknown Author'),
            'source': article.get('source', 'Unknown Source'),
            'url': article.get('url', 'https://bbc.com/news'),
            'imageUrl': article.get('imageUrl', 'https://via.placeholder.com/150'),
            'publishedAt': article.get('publishedAt', datetime.datetime.utcnow().isoformat()),
            'category': article.get('category', 'General'),
            'topics': article.get('topics', ['news']),
            'likes': article.get('likes', 0),
            'comments': article.get('comments', [])
        })
    for article in formatted_articles:
        print(article['description'])

    return jsonify(formatted_articles)

if __name__ == "__main__":
    app.run(debug=True)
