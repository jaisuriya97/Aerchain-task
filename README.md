
# Voice Task Tracker



## Tech Stack

MERN Stack

- Frontend: React (Vite) + Tailwind CSS (CDN)  
- Backend: Node.js + Express  
- Database: MongoDB  
- AI: Google Gemini 2.5 Flash API
  
It uses Google Gemini AI to listen to what you say and automatically figures out:

- Title
- Description
- Priority
- Due Date

You can also drag and drop tasks between "To Do", "In Progress", and "Done".




---

## How to Run It

### 1. Prerequisites

Make sure you have these installed:

- Node.js
- MongoDB (Make sure it's running!)

---

### 2. Setup the Backend (Server)

Open a terminal and go to the server folder:

```bash
cd server
````

Install dependencies:

```bash
npm install
```

Create a file named `.env` inside the server folder and paste this:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/voice-task-tracker
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_KEY_HERE
```
Start the server:

```bash
node index.js
```
---

### 3. Setup the Frontend (Client)

Open a new terminal (keep the server running!) and go to the client folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the React app:

```bash
npm run dev
```

Open the link shown (usually **[http://localhost:5173](http://localhost:5173)**) in your browser.

