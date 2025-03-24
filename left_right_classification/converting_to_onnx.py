import onnx
import onnxruntime as ort
from transformers import AutoModelForSequenceClassification
import torch

# Load the fine-tuned model
model = AutoModelForSequenceClassification.from_pretrained("fine_tuned_roberta", num_labels=5)
model.eval()

# Dummy input for ONNX conversion
dummy_input = torch.ones(1, 512, dtype=torch.long)

# Export the model
onnx_model_path = "fine_tuned_roberta.onnx"
torch.onnx.export(
    model, 
    dummy_input, 
    onnx_model_path,
    input_names=["input_ids"], 
    output_names=["logits"], 
    dynamic_axes={"input_ids": {0: "batch_size"}, "logits": {0: "batch_size"}},
    opset_version=14  # Change this from 11 to 14 or higher
)

# Verify the model
onnx_model = onnx.load(onnx_model_path)
onnx.checker.check_model(onnx_model)
print("ONNX model exported successfully!")