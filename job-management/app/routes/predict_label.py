from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

app = FastAPI()

# Load model and tokenizer
model_path = "./final-joblabel-model"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

# Label mapping
id2label = model.config.id2label

class TextInput(BaseModel):
    text: str

@app.post("/predict-label")
async def predict_label(input: TextInput):
    inputs = tokenizer(input.text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    logits = outputs.logits
    predicted_class_id = torch.argmax(logits, dim=1).item()
    label = id2label[str(predicted_class_id)]
    confidence = torch.nn.functional.softmax(logits, dim=1)[0][predicted_class_id].item()
    return {"label": label, "confidence": confidence}
