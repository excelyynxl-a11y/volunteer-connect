# VolunteerConnect — FIT3170 Team 4

VolunteerConnect is a full-stack volunteer opportunity platform. Volunteers can discover opportunities, apply, manage availability, follow organisations, communicate with connected users, and review their participation history. Organisations can publish and manage opportunities, review applications, and communicate with volunteers. Administrators manage platform users, reports, and analytics.

## Technology

- Frontend: React 19, React Router, Zustand, Vite, Tailwind CSS, Recharts
- Backend: Node.js 22, Express 5, Mongoose, Socket.IO
- Database: MongoDB 8 (local Docker development)
- Optional services: Cloudinary for avatars/resumes and EmailJS for notifications

## Repository structure

```text
backend/              Express API, models, services, seeds, and tests
frontend/             React application, stores, components, and frontend tests
docs/                 Project and milestone documentation
.gitlab-ci.yml        GitLab lint, test, build, and deployment pipeline
docker-compose.yaml   Local MongoDB, backend, and frontend development stack
```

## Local setup

Prerequisites: Node.js 22, npm, and MongoDB. Docker Desktop can provide MongoDB and the application services.

1. Install dependencies:

   ```bash
   cd backend && npm ci
   cd ../frontend && npm ci
   ```

2. Create the backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Set a long random `JWT_SECRET`. For a local MongoDB installation, keep `MONGODB_URI` as `mongodb://localhost:27017/VolunteerConnect`.

3. Start the backend and frontend in separate terminals:

   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

   The default URLs are `http://localhost:5001` for the API and `http://localhost:5173` for the frontend. The API health endpoint is `GET /api/health`; `GET /api/health/ready` also checks MongoDB connectivity.

## Docker development

Create `backend/.env` first, because Docker Compose loads it for the backend. Then run:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:5173`, the API at `http://localhost:5001`, and MongoDB is bound to `127.0.0.1:27017`. MongoDB data is persisted in the `mongo-data` named volume.

## Tests and quality checks

Run the same checks locally that are used by CI:

```bash
cd backend
npm run lint
npm run test:unit
npm run test:integration

cd ../frontend
npm run lint
npm run test:unit
npm run build
```

The frontend unit tests cover pure opportunity, application, and availability rules. Backend integration tests currently verify the web health endpoint without requiring MongoDB; database-backed workflows should still be smoke-tested against a local or staging database.

GitLab CI runs backend/frontend lint, backend unit/integration tests, frontend unit tests, and the frontend production build. Railway staging and production deployment jobs are manual and restricted to their configured release branches.

## Important business rules

- Public sign-up is limited to volunteers and organisations. Administrator accounts are not created through public sign-up.
- Opportunities require valid start/end/deadline values. Applications are rejected after the deadline, after an opportunity starts, or when capacity is exhausted.
- Application ownership, organisation ownership, duplicate applications, valid status transitions, and approved-capacity counters are enforced by the API.
- Volunteers can withdraw pending or approved applications. An approved withdrawal releases the reserved opportunity place.
- Organisation access to volunteer details is limited to volunteers connected through that organisation's applications. Email addresses are not exposed in the organisation-facing profile projection.
- User and opportunity deletion is soft deletion so historical application and participation references remain intact.
- Participation hours are calculated from `endAt - startAt` for completed approved opportunities. This is a time-based platform calculation, not independent verification of attendance.
- Notification endpoints and related UI remain reserved/scaffolded where no implementation is present; they should not be treated as an available feature solely because a route placeholder exists.

## Environment variables

Backend variables are documented in [`backend/.env.example`](backend/.env.example). `MONGODB_URI` and `JWT_SECRET` are required. `PORT`, `NODE_ENV`, `CLIENT_URL`, and `TZ` control local/runtime behaviour. Cloudinary variables are required only for upload features. EmailJS variables are optional; email notifications are skipped when templates are not configured.

Frontend can use [`frontend/.env.example`](frontend/.env.example). `VITE_API_URI` is the API origin without `/api` (for example, `http://localhost:5001`) and is embedded at Vite build time. If it is omitted, development defaults to localhost:5001 and production uses the same-origin `/api` path.

## Project documents

The `docs/` directory contains the project and milestone documentation, including domain analysis, planning, marking/specification materials, and PM/RTE/SA documentation. Shared Application and Follow contracts remain maintained in the team's shared Google Docs.

## Team

| Name | Email |
| :--- | :--- |
| Xu Yiming | yxuu0272@student.monash.edu |
| Jijendran | jije0001@student.monash.edu |
| Esha Veena Veerayya | evee0001@student.monash.edu |
| Muhammad Saud | muha0017@student.monash.edu |
| Lim Excelyynx | elim0079@student.monash.edu |
| Dhakshini Subramanian | dsub0009@student.monash.edu |
| Chan Long Hei | lcha0121@student.monash.edu |
| Brandon Shu Chun Hong | bshu0007@student.monash.edu |
| Ti Jia Don | jtii0004@student.monash.edu |
| Ooi Hui Yi | hooi0004@student.monash.edu |
| Sheikh Fardin Sadman | fsad0006@student.monash.edu |

