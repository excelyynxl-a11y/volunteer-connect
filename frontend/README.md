# VolunteerConnect frontend

The frontend is a React/Vite application. From this directory:

```bash
npm ci
npm run dev
```

Available scripts:

- `npm run dev` — start the Vite development server
- `npm run lint` — run ESLint
- `npm run test:unit` — run the frontend unit tests once
- `npm run build` — create the production bundle
- `npm run preview` — preview the production bundle locally

Copy `.env.example` to `.env` when the API is not running at the default local address. `VITE_API_URI` should contain the API origin only, such as `http://localhost:5001`; the application appends `/api` automatically. Vite environment variables are embedded during the build, so they must be available when the bundle is built.

Frontend business and display rules are implemented in `src/lib/`, with tests next to the relevant helpers. The frontend receives server-side pagination metadata, while the current dashboard views request the bounded collection size supported by the API.
