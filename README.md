# 🇮🇳 BhashaFlow: Multilingual GenAI for Citizen Social Grievances

**NIIT University B.Tech CSE Capstone Project**

## 📖 Project Overview
* **Problem:** Manual grievance handling causes severe delays, and language barriers prevent citizens from efficiently accessing help and reporting localized issues.
* **Objective:** Automatically capture, classify, summarize, and route social grievances submitted in various Indian languages to the appropriate authorities.
* **Approach:** OCR (Optical Character Recognition) + NLP → Prompt-Engineered LLM → Classification & Summarization.
* **Outcome:** Faster resolution times, seamless multilingual accessibility, and a streamlined administrative dashboard for authorities.

---

## 🛠️ Tech Stack & Architecture
This project utilizes a modern microservices architecture. It is fully containerized using Docker and automated via a continuous Jenkins CI/CD pipeline using **Immutable Images** for ultimate stability.

### 1. Frontend (Port `3000`)
* **Core:** React.js powered by Vite (Node 20).
* **UI/UX:** Framer Motion for dynamic animations, TailwindCSS/CSS for responsive design.
* **Role:** Citizen submission portal and Authority status dashboard.

### 2. Backend API (Port `5000`)
* **Core:** Node.js, Express.js (Node 20).
* **Database:** MongoDB (via Mongoose).
* **Role:** REST API routing, user authentication, handling file uploads (Multer), and forwarding data to the AI Engine.

### 3. AI Engine (Port `8000`)
* **Core:** Python 3.11, FastAPI.
* **AI/ML:** LangChain, EasyOCR, Indic NLP Library, PyTorch, HuggingFace Transformers.
* **Role:** Extracts text from images/audio, translates regional Indian languages to English, and utilizes LLMs to generate actionable grievance summaries.

### 4. DevOps & CI/CD
* **Containerization:** Docker & Docker Compose.
* **Pipeline:** Jenkins (running locally via Docker Socket).
* **Integration:** GitHub Webhooks tunneled through Ngrok.

---

## 👥 Team & Roles
* **Frontend Developer:** [Name] - `frontend/` directory.
* **Backend Developer:** [Name] - `backend/` directory.
* **AI/ML Engineer:** [Name] - `ai-engine/` directory.
* **Tech Lead / DevOps:** Saumya Srivastava - CI/CD pipeline, Docker architecture, and cross-service integration.

---

## 🚀 Local Development Setup (For Team Members)

Welcome to the project! You **do not** need to manually install Node.js, React, or Python on your local machine. Docker handles the entire environment for you.

### Step 1: Prerequisites
Ensure you have the following installed on your laptop:
1. [Git](https://git-scm.com/downloads)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(Ensure it is running in the background before proceeding)*
3. VS Code (or your preferred code editor)

### Step 2: Clone the Repository & Setup Environment
Open your terminal and run:
```bash
git clone [https://github.com/saumya-0611/BhashaFlow.git](https://github.com/saumya-0611/BhashaFlow.git)
cd BhashaFlow
```
### Step 3: Start the Application Environment
docker-compose up --build

(**Note:** The first time you run this, it may take 5-10 minutes to download the heavy machine learning libraries. Subsequent runs will be instant.)


### Step 4: Access Local Servers
Once the terminal indicates all containers have started successfully, access your working environments here:

Frontend UI: http://localhost:3000
Backend API: http://localhost:5000
AI Engine API: http://localhost:8000

### ⚠️ Troubleshooting Guide

**"Port is already allocated" Error:** If Docker complains that port 3000, 5000, or 8000 is in use, you likely have another service running. Stop the conflicting service. (Tech Lead Note: Ensure the Jenkins master containers are stopped before running your local dev environment).

**"Module Not Found" Error:** If a teammate added a new library to package.json or requirements.txt, you must force Docker to fetch it. Stop your terminal (Ctrl+C) and rebuild: docker-compose up --build.


## THE FLOW
Here is exactly how a grievance will travel through your specific ports when you finish building it:

User (Browser) types a grievance in Hindi and clicks submit on localhost:3000.

React (Port 3000) packages the text and sends it to localhost:5000/api/submit.

Node.js (Port 5000) receives it, saves a pending record in MongoDB, and then privately sends the data across Docker's internal network to http://ai-engine:8000/process-grievance.

Python (Port 8000) receives the text, runs Indic NLP and LangChain to translate and summarize it, and sends the English JSON summary back to Node.js.

Node.js updates the database and sends a "Success" message back to the React frontend.


## 🚀 Jenkins CI/CD Pipeline (Immutable Deployment)

This project uses a **Jenkins Pipeline** to automate the build, test, and deployment process. The pipeline ensures consistency and reliability by using **Immutable Images**.

### Pipeline Stages

1.  **Checkout**: Fetches the latest code from the GitHub repository.
2.  **Build Frontend**: Builds the React application and creates a Docker image.
3.  **Build Backend**: Builds the Node.js backend and creates a Docker image.
4.  **Build AI Engine**: Builds the Python AI engine and creates a Docker image.
5.  **Deploy**: Stops the existing containers and starts new ones using the newly built images.

### Accessing the Application

Once the Jenkins pipeline completes successfully, you can access the application at:

-   **Frontend UI**: http://localhost:3000
-   **Backend API**: http://localhost:5000
-   **AI Engine API**: http://localhost:8000

### ⚠️ Troubleshooting

**"Port is already allocated" Error**: If Docker complains that a port is already in use, it means a previous instance of the application is still running. Stop the conflicting service before starting the pipeline.

**Pipeline Failed**: If the pipeline fails, check the logs for the specific stage that failed. Common issues include:

-   Network connectivity issues between containers.
-   Port conflicts.
-   Errors in the application code.

Create your local environment variables file by copying the template:

```bash
cp .env.example .env
```