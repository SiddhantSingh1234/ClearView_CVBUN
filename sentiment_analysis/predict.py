import sys
import json
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

def analyze_sentiment_vader(text):
    """Performs sentiment analysis using VADER."""
    analyzer = SentimentIntensityAnalyzer()
    sentiment = analyzer.polarity_scores(text)
    
    pos_percent = sentiment['pos'] * 100
    neu_percent = sentiment['neu'] * 100
    neg_percent = sentiment['neg'] * 100

    if sentiment['compound'] >= 0.05:
        label = "Positive"
    elif sentiment['compound'] <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"
    
    return {"sentiment": label, "score": sentiment['compound'], "positive": pos_percent, "neutral": neu_percent, "negative": neg_percent}

if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])  # Get input text from server.js
    input_text = input_data.get("input_text", "")

    if input_text:
        result = analyze_sentiment_vader(input_text)
    else:
        result = {"error": "No input text provided"}

    print(json.dumps(result))  # Send output back to server.js