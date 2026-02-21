## suppose 2 person want to edit the frontened part at once then?

If two developers want to build different parts of the React frontend at the exact same time, they do not edit the same live file. Instead, they use a workflow called Branching.

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

## Step 4: Developer B Merges
A few hours later, Developer B finishes the Grievance Form. They push their branch and create a Pull Request.
GitHub is incredibly smart. It looks at Developer B's code and seamlessly stitches it together with Developer A's Login Page code inside the main branch.

The Big Question: What if they edit the EXACT same line of code?
Suppose Developer A and Developer B both edited line 42 of frontend/src/App.jsx at the same time.

When Developer B tries to merge their Pull Request, GitHub will throw a Merge Conflict. It will essentially say: "Wait! Both of you changed line 42. I am a robot, I don't know which one is the correct one."

How you fix it:
GitHub will highlight the exact file and show you both versions side-by-side. You (or the developers) simply look at it, delete the version you don't want, keep the one you do, and click "Resolve Conflict." Then the code merges safely.