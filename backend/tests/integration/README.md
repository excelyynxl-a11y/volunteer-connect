# Backend integration coverage

The executable integration suite currently covers the real Express app boundary in
`app.test.js` and the mounted route/middleware contract in `api.routes.test.js`.
The route contract suite uses controller doubles deliberately: controller business
rules are covered by the backend unit tests, while the repository does not provide a
disposable MongoDB fixture or a CI database service for cross-record workflows.

Do not reintroduce placeholder `it.todo` files for those workflows. When the team
adds a repeatable test database (for example, a CI MongoDB service or an approved
in-memory fixture), add database-backed tests for application capacity races,
ownership/privacy queries, follow idempotency, messaging persistence, report
population, and profile/upload flows here.

Email delivery behaviour is covered by `backend/tests/unit/email.service.test.js`.
No separate in-app notification test suite is kept in this branch because that
feature is not part of the current product scope.
