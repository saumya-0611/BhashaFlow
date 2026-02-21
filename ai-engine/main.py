from fastapi import FastAPI

app = FastAPI(title="BhashaFlow AI Engine")

@app.get("/")
def read_root():
    return {"status": "AI Engine is running successfully!"}

# we have to try EasyOCR and LangChain routes here later