# 🌱 FIT3170 Team 4: VolunteerConnect

## 🚨 Instruction for README as Handover Docs
The handover documentation is essentially:
What software/hardware is needed to run the project
Instructions on how to get the project up and running 
Any additional notes or common issues that future developers might benefit from knowing
This is usually done as a README.md file located in your github repository, however we expect you to export it as a pdf before uploading it to us.


## 💡 Project Overview
VolunteerConnect is a centralised web-based website designed to bridge the gap between volunteers, community and non-profits organisations. Unlike fragmented social media groups or simply any spreadsheets to record the volunteers, our platform provides a streamlined workflow from search and filtering for opportunities to manual hours logging.

The system serves three primary roles. Firstly, volunteers who seek a frictionless way to follow organisations and track a maximum of two years participation history. On top of that, organisations which require manual approval tools for fixed schedule opportunities as those applications will go through to the organisation’s application list. Lastly, admins who act as the primary gatekeepers by skimming the applications before they reach the organisations. VolunteerConnect differentiates itself by offering a dual-layered approval process and in-platform messaging system that supports attachments, ensuring clear communication throughout the volunteer lifecycle.


## 🏗️ Repository Structure (to-be-updated from time to time)
This repository is organised into folders and files, primarily the backend and frontend folder to maintain separation of concerns and codes between frontend and backend development.

```
PROJECT
|_ frontend/
    |_ public/                 # static assets (images, icons)
    |_ src/
    |   |_ components/         # reusable UI components
    |   |_ lib/                # API client, helpers,and shared utilities
    |   |_ pages/              # page-level views, grouped by role
    |   |   |_ Admin/
    |   |   |_ Auth/
    |   |   |_ LandingPage/
    |   |   |_ LoadingPage/
    |   |   |_ Organisation/
    |   |   |_ Volunteer/
    |   |_ store/              # Zustand state stores
    |   |_ App.css             # root app styles
    |   |_ App.jsx             # root React component (defines routes)
    |   |_ index.css           # global styles
    |   |_ main.jsx            # Vite entry point
    |   |_ style.css
    |_ .gitignore
    |_ Dockerfile
    |_ eslint.config.js        # ESLint flat config
    |_ index.html              # Vite HTML template
    |_ package.json
    |_ package-lock.json
    |_ vite.config.js
|_ backend/
    |_ public/
    |   |_ resumes/            # uploaded resume files (gitignored at runtime)
    |_ src/
    |   |_ controllers/        # request handlers per resource
    |   |_ lib/                # shared utilities (db, cloudinary, socket, utils)
    |   |_ middlewares/        # auth + multer (file upload) middlewares
    |   |_ models/             # Mongoose schemas
    |   |_ routes/             # Express route definitions
    |   |_ seeds/              # DB seeding scripts (dev data)
    |   |_ services/           # business-logic services
    |   |_ index.js            # Express app entry point
    |_ .dockerignore
    |_ .env                    # environment variables (gitignored — see §Software/Hardware)
    |_ Dockerfile
    |_ MODEL.md                # backend data model documentation
    |_ package.json
    |_ package-lock.json
|_ instructions/
    |_ images/                 # screenshots referenced by the instruction docs
    |_ DOCKER.md
    |_ INSTRUCTION.md
|_ .gitignore
|_ CONTRIBUTORS.md             # list of team members name and student id
|_ docker-compose.yaml         # orchestrates backend + frontend + mongodb
|_ NOTICE                      # MIT licensing information
|_ README.md                   (😆 you are currently reading this file!)
```

## 🔨 Software / Hardware to Run This Project

### Prerequisites
| Software | Version | Notes |
| --- | --- | --- |
| **Node.js** | v22 LTS (v22.x) | Required by both frontend and backend. v20+ may work but v22 is what the Docker images use (`node:22-alpine`). |
| **npm** | v10+ | Ships with Node.js. Used to install dependencies and run scripts. |
| **MongoDB** | v7+ | Only required if running **without** Docker. A local instance or MongoDB Atlas connection string both work. |
| **Docker** | latest | Only required if running **with** Docker. Includes Docker Engine + Docker Compose. |
| **Git** | latest | To clone the repository. |
| **OS** | Windows / macOS / Linux | Any modern OS works. Windows users should use Git Bash or WSL for shell commands. |
| **Hardware** | 8 GB RAM minimum | Docker + MongoDB + two Node dev servers can be memory-hungry. 16 GB recommended. |

### 1. Clone the repository
```bash
git clone https://git.infotech.monash.edu/fit3170-team-4/project.git
cd project
```

### 2. Get the environment variables
The backend relies on a `backend/.env` file that is **gitignored** and therefore not committed to the repository. You **must** obtain the actual values from a current team member (eg. via direct message).

Create the file at `backend/.env` with the following keys (replace the placeholder values <> with the real ones):

```env
# MongoDB — use the Atlas URI for remote, or LOCAL_MONGODB_URI for a local DB
MONGODB_URI=<ask team — Atlas connection string, or mongodb://localhost:27017/VolunteerConnect>
LOCAL_MONGODB_URI=mongodb://localhost:27017/VolunteerConnect
PORT=5001

# Auth
JWT_SECRET=<ask team>

# Cloudinary (used for attachment uploads in messaging)
CLOUDINARY_CLOUD_NAME=<ask team>
CLOUDINARY_API_KEY=<ask team>
CLOUDINARY_API_SECRET=<ask team>

NODE_ENV=development
```

> ⚠️ **Never commit `.env` to git.** It is listed in `.gitignore` for a reason. If you accidentally stage it, unstage with `git restore --staged backend/.env` before committing.

### 3. Install dependencies
Dependencies are scoped per-folder, so install them separately:

```bash
# Terminal 1: Backend
cd backend
npm install

# Open a new terminal before proceeding

# Terminal 2: Frontend
cd frontend
npm install
```

> 💡 The backend Dockerfile uses `npm ci`, which requires a committed `package-lock.json`. The frontend Dockerfile uses `npm install`. When running locally (non-Docker), `npm install` is fine for both.

### 4. Run the project (with and without Docker option available)

#### Option A — With Docker (recommended for a clean, all-in-one setup)
From the **project root** (where `docker-compose.yaml` lives):

```bash
docker compose up --build
```

This starts three services:
| Service | Port | Purpose |
| --- | --- | --- |
| `backend` | `http://localhost:5001` | Express API server (hot-reloaded via nodemon + volume mount) |
| `frontend` | `http://localhost:5173` | Vite dev server (hot-reloaded via volume mount) |
| `mongodb` | `mongodb://localhost:27017` | Local MongoDB instance with a persistent volume (`mongo-data`) |

When using Docker, `docker-compose.yaml` overrides `MONGODB_URI` to `mongodb://mongodb:27017/VolunteerConnect` (the in-network service name), so you don't need a running local MongoDB.

To stop: `Ctrl+C`, then optionally `docker compose down` (add `-v` to also wipe the MongoDB volume).

#### Option B — Without Docker (run each service manually)
You need a MongoDB instance reachable from your machine — either:
- a local `mongod` running on the default port `27017`, **or**
- a MongoDB Atlas cluster (set `MONGODB_URI` in `backend/.env` to the Atlas URI).

Then, in **2 separate terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev      
# nodemon, serves on http://localhost:5001

# Open a new terminal before proceeding

# Terminal 2 — Frontend
cd frontend
npm run dev      
# Vite, serves on http://localhost:5173
```

The frontend talks to the backend at `http://localhost:5001` by default (injected as `VITE_API_URI` by `docker-compose.yaml` for Docker runs; when running the frontend without Docker, ensure your backend is reachable at that URL or set `VITE_API_URI` in a `frontend/.env` file).

### 5. Useful npm scripts
| Folder | Script | Command | What it does |
| --- | --- | --- | --- |
| `backend` | dev | `npm run dev` | Start Express with nodemon (auto-restart on file change) |
| `backend` | start | `npm start` | Start Express in production mode (no watch) |
| `frontend` | dev | `npm run dev` | Start Vite dev server with HMR |
| `frontend` | build | `npm run build` | Production build to `dist/` |
| `frontend` | preview | `npm run preview` | Preview the production build locally |
| `frontend` | lint | `npm run lint` | Run ESLint |

## 🗒️ Additonal Notes: For Future Developers





