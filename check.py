import os
from google import genai

# 1. Check if the environment variable is actually set
api_key_from_env ='AIzaSyDsv2aOvvMzUI2g2RiKbvGkaZQGTuhiOCM'

if not api_key_from_env:
    print("❌ Critical Error: GEMINI_API_KEY is not set in your environment.")
else:
    print(f"✅ Key found in environment: ...{api_key_from_env[-4:]}")
    
    try:
        # Pass the key EXPLICITLY to the client constructor
        client = genai.Client(api_key=api_key_from_env)
        
        print("\n--- Model Status ---")
        models = client.models.list()
        for m in models:
            if "flash" in m.name.lower():
                print(f"✅ Working Model: {m.name}")
                
    except Exception as e:
        print(f"❌ API Client failed to initialize: {e}")