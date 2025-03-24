import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer
from transformers import AutoModelForSequenceClassification, TrainingArguments, Trainer
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from transformers import DataCollatorWithPadding

print("GPU Available:", torch.cuda.is_available())
print("Number of GPUs:", torch.cuda.device_count())
print("GPU Name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU found")

# Preprocessing
df = pd.read_csv("./datasets/Political_Bias.csv")
df.dropna(subset=["Text", "Title", "Source", "Bias"], inplace=True)
df["Bias"] = df["Bias"].map({"left": 0, "lean left": 1, "center": 2, "lean right": 3, "right": 4})

df.drop(columns=["Link"], inplace=True)
df["input_text"] = df["Title"] + " [SEP] " + df["Text"] + " [SEP] " + df["Source"]

tokenizer = AutoTokenizer.from_pretrained("roberta-base")

def tokenize_function(examples):
    return tokenizer(examples["input_text"], padding="max_length", truncation=True, max_length=512)

dataset = Dataset.from_pandas(df[["input_text", "Bias"]])
dataset = dataset.map(lambda x: {"labels": torch.tensor(x["Bias"], dtype=torch.long)}, batched=False)
dataset = dataset.map(tokenize_function, batched=True)
dataset = dataset.train_test_split(test_size=0.2)
test_valid = dataset["test"].train_test_split(test_size=0.5)
train_data = dataset["train"]
val_data = test_valid["train"]
test_data = test_valid["test"]

# Model
model = AutoModelForSequenceClassification.from_pretrained("roberta-base", num_labels=5)

training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir="./logs",
    eval_steps=500,
    load_best_model_at_end=True
)

data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_data,
    eval_dataset=val_data,
    data_collator=data_collator
)

trainer.train()

model.save_pretrained("fine_tuned_roberta")
tokenizer.save_pretrained("fine_tuned_roberta")

test_predictions = trainer.predict(test_data)
logits = test_predictions.predictions
y_pred = torch.argmax(torch.tensor(logits), dim=-1).numpy()
y_true = test_data["Bias"]

accuracy = accuracy_score(y_true, y_pred)
precision, recall, f1, _ = precision_recall_fscore_support(y_true, y_pred, average="macro")

print("\n🔹 Test Set Evaluation Metrics:")
print(f"Accuracy: {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall: {recall:.4f}")
print(f"F1 Score: {f1:.4f}")