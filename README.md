# 🌱 FIT3170 Team 4: VolunteerConnect

## 💡 Project Overview
VolunteerConnect is a centralised web-based website designed to bridge the gap between volunteers, community and non-profits organisations. Unlike fragmented social media groups or simply any spreadsheets to record the volunteers, our platform provides a streamlined workflow from search and filtering for opportunities to manual hours logging.

The system serves three primary roles:
1. Volunteers who seek a way to follow organisations and track participation history. 
2. Organisations which require manual approval tools for fixed schedule opportunities as those applications will go through to the organisation’s application list. 
3. Admins who oversees VolunteerConnect users across the platform, manage account approval and administrative work.

## 🚀 Live on Render 
VolunteerConnect is hosted live on Render [VolunteerConnect](https://volunteer-connect-icip.onrender.com/).

## 🔨 Software / Hardware to Run This Project

### Prerequisites
| Software | Version | Notes |
| --- | --- | --- |
| **Node.js** | v22 LTS (v22.x) | Required by both frontend and backend. v20+ may work but v22 is what the Docker images use (`node:22-alpine`). |
| **npm** | v10+ | Ships with Node.js. Used to install dependencies and run scripts. |
| **MongoDB** | v7+ | Only required if running **without** Docker. A local instance or MongoDB Atlas connection string both work. |
| **Docker** | latest | Only required if running **with** Docker. Includes Docker Engine and Docker Compose. |
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

Create the file at `backend/.env` with the following keys (replace the placeholder values <>):

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

# EmailJS services
EMAILJS_SERVICE_ID=service_f3k5d4w
EMAILJS_TEMPLATE_ID=template_yypuy49
EMAILJS_TEMPLATE_ID_STATUS = template_zgf4yxm
EMAILJS_PUBLIC_KEY=I8Y_Lu831UpuXl-c1
EMAILJS_PRIVATE_KEY=PalU-jKRd_0IK-vhX-goG
CLIENT_URL=http://localhost:5173
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

### 4. Run the project

#### Option A — With Docker
From the **project root** (where `docker-compose.yaml` lives):

```bash
docker compose up --build
```

This starts three services:
| Service | Port | Purpose |
| --- | --- | --- |
| `backend` | `http://localhost:5001` | Express API server |
| `frontend` | `http://localhost:5173` | Vite dev server |
| `mongodb` | `mongodb://localhost:27017` | Local MongoDB instance with a persistent volume |

To stop: `Ctrl+C`, then optionally `docker compose down`.

#### Option B — Without Docker 
You need a reachable MongoDB from your machine, either:
- local `mongod` running on the default port `27017`
- MongoDB Atlas cluster (set `MONGODB_URI` in `backend/.env` to the Atlas URI).

**In 2 separate terminals**:

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

## 🗒️ Additonal Notes: For Future Developers

### A. Features still in progress (`TODO` remarks)
The repository might contain backend and frontend files that  are still scaffolded. Before assuming a workflow is "done", check for `TODO(...)` remarks.


### B. Authentication & Account Creation
- New **volunteer** and **organisation** accounts are **not** immediately usable as they sit in `approvalStatus: "pending"` and cannot log in until an **admin** approves them.
- The **admin** account is a default (seeded) account. There is no public sign-up route for admins.
- For the case where developer is forced to delete all Docker containers and rebuild, all previous entries (eg: User, Applications, Report) will be deleted from local MongoDB. Hence, we have prepared seed data for instant seeding by:
```bash
docker compose exec -T -e LOCAL_MONGODB_URI= -e MONGODB_URI=mongodb://mongodb:27017/VolunteerConnect backend npm run seed:dev
```
All the account created have the same password: **Password123!**

### C. API & CORS configuration
- **CORS is hardcoded** to `http://localhost:5173` in `backend/src/index.js`. If you ever change the frontend dev port, you **must** update the `origin` in the `cors()` call or the browser will block every request.
- If you need a different backend URL, edit `frontend/src//lib/axios.js` directly.

### D. Cloudinary connection check
There is a `testCloudinary()` helper at the bottom of `backend/src/index.js` that is **commented out**. If you need to verify Cloudinary credentials are working, you can uncomment it, restart the backend, and look for the `Cloudinary connected:` log line. Re-comment it afterwards. It will pings the Cloudinary API on every boot.

### E. Request body size limit
The backend sets `express.json({ limit: "10mb" })` and `express.urlencoded({ limit: "10mb" })` to accommodate base64 file uploads (resume/avatar via Multer). If you start uploading larger files and getting error `Payload Too Large`, increase this limit in `backend/src/index.js`.

### F. Running with Docker
- **Docker account email**: when creating a Docker Hub / Docker Desktop account, use a **personal email**. Using a Monash student email triggers an account-creation error (documented in `instructions/DOCKER.md`).
- **First build is slow**: `docker compose up --build` takes 2–3 minutes for the first time. Subsequent starts are fast.
- **Once Docker is running, don't run `npm run dev`** in the same time in the frontend/backend folders. This will end up with two dev servers fighting for the same ports (`5001` / `5173`). Pick one workflow (Docker *or* local `npm run dev`) and stick with it.
- **MongoDB volume**: the `mongo-data` named volume persists between runs. If the DB seems "stuck" with old data after you've changed a seed, run `docker compose down -v` to wipe the volume (this deletes all stored data, undergo seeding script to instantly input mock data back into your database).

### G. Where to get `.env` values
The `backend/.env` file is gitignored and not committed. As documented in `instructions/INSTRUCTION.md`, the actual key values are shared internally within **FIT3170 Team 4**. Ask a current team member to send them if you can't find the source. Do **not** paste real secrets into this README, into commits or any chat outside the team.
