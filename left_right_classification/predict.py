import sys
import json
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# Load the fine-tuned model
MODEL_PATH = "./fine_tuned_roberta"
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

# Define bias labels
bias_labels = ["left", "lean left", "center", "lean right", "right"]

def predict_bias(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding="max_length")
    
    with torch.no_grad():
        logits = model(**inputs).logits
    
    probabilities = torch.nn.functional.softmax(logits, dim=-1).tolist()[0]
    response = {bias_labels[i]: round(probabilities[i] * 100, 2) for i in range(len(bias_labels))}
    
    return response

# Read input from Node.js
if __name__ == "__main__":
    input_data = json.loads(sys.argv[1])
    input_text = input_data["input_text"]
    result = predict_bias(input_text)
    print(json.dumps(result))
