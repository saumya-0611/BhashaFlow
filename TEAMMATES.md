# 🧑‍💻 Team Coding Workflow & Guidelines

Welcome to the development phase of the BhashaFlow project! Now that our Docker architecture and Jenkins CI/CD pipeline are fully operational, here is exactly how we will write, test, and push code every day.

## 🏗️ 1. The Golden Rule: Use Docker, Not Local Installs
You **do not** need to install Node.js, Python, or MongoDB on your computer. All of our environments are containerized. 
* To run the project, you only need Git, Docker Desktop, and VS Code.

## 🌅 2. The Daily Routine (How to Start Your Day)
Whenever you sit down to code, follow these exact steps to ensure you are working on the latest version:

1. **Get the Latest Code:**
   ```bash
   git checkout main
   git pull origin main

2. **Create Your Feature Branch:**
 Never write code directly on the main branch. Create a "parallel universe" for your specific task:

```bash
git checkout -b feature/name-of-your-feature
```
(Example: git checkout -b feature/citizen-login-ui)

3. **Boot Up the Factory:**
```bash
docker-compose up
```
## 💻 3. Writing Code (The Magic of Volumes)
Because we are using Docker Volumes, you do not need to restart the server every time you save a file. * If you edit backend/server.js or ai-engine/main.py and hit Ctrl + S, Docker will automatically hot-reload the changes inside the running container.

Simply refresh your browser to see your updates instantly!

## 📦 4. Installing New Packages (The --build Exception)
If you need to install a new library (e.g., a new React component or a new Python ML tool), you must update the "shopping list" and force Docker to rebuild:

Add the package to frontend/package.json, backend/package.json, or ai-engine/requirements.txt.

Stop your running containers (Ctrl + C in the terminal).

Run the build command:

```bash
docker-compose up --build
```

## 🚀 5. Finishing Your Feature (Pushing to Jenkins)
When your code is working perfectly on your local machine, it's time to send it to the pipeline:
Stop your containers (Ctrl + C).
Stage and commit your code:

```bash
git add .
git commit -m "feat: description of what I built"
Push your branch to GitHub:
```

```bash
git push origin feature/name-of-your-feature
```
Create a Pull Request (PR): Go to GitHub and open a PR to merge your branch into main. Once Saumya approves it, the Jenkins automated pipeline will build and test the official production version.

## What if suppose 2 person want to edit the frontened part at once then?

DO Branching

## Step 1: Create Separate Branches
Instead of working on the main branch (which is the official, stable version Jenkins uses), they both pull the latest code and create their own isolated workspaces (branches) on their local laptops.

**Developer A types:** git checkout -b feature/login-page
**Developer B types:** git checkout -b feature/grievance-form

## Step 2: Code in Complete Isolation
Now, they both run docker-compose up on their respective laptops.
Because Docker runs locally, Developer A's React app runs on their localhost:3000, and Developer B's React app runs on their localhost:3000.
They can both install new packages, write code, and completely break their own apps without affecting the other person at all.

## Step 3: Push and Pull Request (PR)
When Developer A finishes the Login Page, they push their specific branch to GitHub:
```bash
git add .
git commit -m "feat: built the citizen login UI"
git push origin feature/login-page 
```
Then, they go to GitHub and click "Create Pull Request". A Pull Request (PR) is basically asking the Tech Lead (you!): "Hey, I finished this feature in my parallel universe. Can we merge it into the official main universe?"

Once approve it, GitHub merges the Login Page into main. Jenkins sees this, builds the Docker containers, and updates the official app.

---