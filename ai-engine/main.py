from fastapi import FastAPI
import os

app = FastAPI(title="BhashaFlow AI Engine")

@app.get("/")
def read_root():
    return {"status": "AI Engine is online", "model": "EasyOCR/LangChain Ready"}