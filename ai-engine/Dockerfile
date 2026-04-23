FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    EASYOCR_MODULE_PATH=/app/.EasyOCR

# System dependencies for EasyOCR, image processing, and audio handling
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    build-essential \
    python3-dev \
    git \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip

# This install will be heavy (approx 2GB+). 
# It may take 5-10 minutes in Jenkins.
RUN pip install --no-cache-dir -r requirements.txt
RUN mkdir -p /app/.EasyOCR && python -c "import easyocr; easyocr.Reader(['en','hi'], gpu=False, verbose=False)"

COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
