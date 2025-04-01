import sys
import json
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import pandas as pd

# Load the fine-tuned model
MODEL_PATH = "./fine_tuned_fake_news_roberta"
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

def predict_fake_news(input_text):
    inputs = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512, padding="max_length")
    
    with torch.no_grad():
        logits = model(**inputs).logits
    
    probabilities = torch.nn.functional.softmax(logits, dim=-1).tolist()[0]
    response = {"fake": round(probabilities[0] * 100, 2), "true": round(probabilities[1] * 100, 2)}
    
    return response

# Read input from Node.js
if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    input_text = input_data["input_text"]
    result = predict_fake_news(input_text)
    print(json.dumps(result))

