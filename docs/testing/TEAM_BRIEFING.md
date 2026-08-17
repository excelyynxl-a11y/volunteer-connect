# VolunteerConnect Team Testing Briefing

## What everyone needs to know

1. The project has backend unit, backend integration, frontend unit, frontend component, and later manual E2E tests.
2. The SA may assign any prepared test file to any contributor. Assignment does not depend on who built the feature.
3. Open the assigned file and replace each applicable `it.todo(...)` with a real test.
4. Do not delete difficult cases, change the expected business rule, or call real production/external services just to make tests pass.
5. Add a new case in the same feature file when an important gap or regression is found.
6. GitLab automatically runs the four automated test suites, backend/frontend lint, and frontend build after a push.
7. Manual E2E is not part of the current backfill. The team will run it together later.

## File locations

```text
backend/tests/unit/          focused backend rules
backend/tests/integration/   API + middleware + database flows
frontend/tests/unit/         helpers and Zustand stores
frontend/tests/component/    rendered React behaviour
```

Use `TEST_MATRIX.md` to find the files belonging to each feature. It is a scope map, not an assignment or progress board.

## Required local checks

```text
cd backend
npm run lint
npm run test:unit
npm run test:integration

cd ../frontend
npm run lint
npm run test:unit
npm run test:component
npm run build
```

## Basic test shape

```js
describe("feature behaviour", () => {
  it("returns the expected result", async () => {
    // Arrange: prepare user, data, and mocks
    // Act: call the real code or perform the user action
    // Assert: check response, saved data, state, or visible UI
  });
});
```

Before starting, read the short rules in `TESTING_STANDARD.md`. Ask the SA when a prepared case conflicts with current implementation or an undecided product rule.
