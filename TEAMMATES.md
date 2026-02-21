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

📦 3. Writing Code & The "Suitcase" Architecture
To ensure our Jenkins CI/CD pipeline never fails due to missing files, we use Immutable Images. This means we pack our code like a suitcase during the build process, rather than relying on live local folders.

When you change code or add new packages: You MUST repack your suitcase. Stop your running containers (Ctrl + C in the terminal) and run:

```bash
docker-compose up --build
```
This ensures your latest code is baked into the container, exactly how Jenkins will see it.

Database Data: The only exception is MongoDB. We use a dedicated volume for the database in our docker-compose file, so your test users and grievances will NOT be deleted when you restart Docker.

🚀 4. Finishing Your Feature (Pushing to Jenkins)
When your code is working perfectly on your local machine, it's time to send it to the pipeline:

Stop your containers (Ctrl + C).

Stage and commit your code:

```bash
git add .
git commit -m "feat: description of what I built"
```
Push your branch to GitHub:

```bash
git push origin feature/name-of-your-feature
```
Create a Pull Request (PR): Go to GitHub and open a PR to merge your branch into main. Once the Tech Lead (Saumya) approves it, the Jenkins automated pipeline will build and test the official production version.

🔀 Handling Concurrent Work (Two People, Same Repo)
What if two people want to edit the frontend part at once? We Branch!

## Step 1: Create Separate Branches
Instead of working on the main branch (which is the official, stable version Jenkins uses), both developers pull the latest code and create their own isolated workspaces (branches) on their local laptops.

Developer A types: git checkout -b feature/login-page

Developer B types: git checkout -b feature/grievance-form

## Step 2: Code in Complete Isolation
Now, they both run docker-compose up --build on their respective laptops. Because Docker runs locally, Developer A's app runs on their localhost:3000, and Developer B's app runs on their own localhost:3000. They can both install new packages, write code, and completely break their own apps without affecting the other person at all!

## Step 3: Push and Pull Request (PR)
When Developer A finishes the Login Page, they push their specific branch to GitHub and create a Pull Request. A PR is basically asking the Tech Lead: "Hey, I finished this feature in my parallel universe. Can we merge it into the official main universe?"

Once approved, GitHub merges the Login Page into main. Jenkins sees this, builds the Docker containers, and updates the official app automatically.

## ⚠️ The Difference Between "up" and "up --build"
Because we removed live volumes to keep our Jenkins CI/CD pipeline stable, you must understand how to start your servers:

* ❌ **`docker-compose up`**: Only use this if you are resuming work and haven't typed any new code or pulled from GitHub. It boots the *old* image.
* ✅ **`docker-compose up --build`**: Use this **99% of the time**. If you wrote new code, added an npm package, or ran `git pull`, you MUST add `--build` to package your new changes into the container.

## CONFLICTS SCENARIOS (IMPOERTANT FOR US)

The 3 Common Conflict Scenarios (How it happens in real life)
Here is how conflicts will actually happen in your BhashaFlow project:

## Scenario 1: The "Same Line" Clash (Most Common)
The Setup: Two frontend developers are working on GrievanceForm.jsx.

**Teammate A**: Changes the submit button on line 45 to be bg-blue-500 and pushes their PR. You merge it.
**Teammate B**: Doesn't pull the latest updates. On their laptop, line 45 still has the old button. They change it to bg-green-500 and push their PR.

**The Conflict**: When Teammate B tries to merge, GitHub stops them. Git says, "Wait! Line 45 is blue in the main database, but green in your branch. I can't do both."

## Scenario 2: The "Ghost File" Conflict
The Setup: The AI/ML Engineer and Backend Developer are updating the translation logic.

**The AI Engineer**: Realizes old_translator.py is garbage. They delete it, create new_translator.py, and merge their code into main.
**The Backend Dev**: At the exact same time, they were writing a new API route inside old_translator.py. They push their PR.

**The Conflict**: Git panics. "The Backend Dev wants to add a function to a file that the AI Engineer just deleted! Should I bring the file back to life, or delete the new function?"

## Scenario 3: The package.json Collision (Dependency Hell)
The Setup: Two people install different NPM packages at the exact same time.

**Teammate A**: Runs ``npm install framer-motion``. Node adds it to line 12 of package.json.
**Teammate B**: Runs ``npm install axios``. Node also tries to add it to line 12 of their package.json.

**The Conflict**: When they both push, Git sees two completely different libraries fighting for line 12.