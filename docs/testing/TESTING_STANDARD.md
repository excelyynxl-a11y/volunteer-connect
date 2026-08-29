# VolunteerConnect Testing Standard

## 1. Test types

VolunteerConnect uses five kinds of tests:

| Type | What it proves | Folder | GitLab |
|---|---|---|---|
| Backend unit | A backend rule, controller, middleware, model, or service in isolation | `backend/tests/unit/` | Automatic |
| Backend integration | An Express API flow through routes, middleware, controllers, and database | `backend/tests/integration/` | Automatic |
| Frontend unit | A helper or Zustand store behaviour | `frontend/tests/unit/` | Automatic |
| Frontend component | Visible React behaviour and user interaction | `frontend/tests/component/` | Automatic |
| Manual E2E | A complete browser journey across frontend, backend, database, roles, and external services | `MANUAL_E2E_CHECKLIST.md` | Manual, later |

Playwright is not required. Manual E2E will be done together after the automated test backfill and remaining features are stable.

Backend lint, frontend lint, and frontend build are also mandatory GitLab checks. They are quality checks, not additional test types.

## 2. Prepared test files

The required feature files already exist. `TEST_MATRIX.md` shows which file covers each feature.

An unfinished case looks like this:

```js
describe("application API", () => {
  it.todo("rejects a duplicate application");
});
```

The contributor replaces it with a real test:

```js
describe("application API", () => {
  it("rejects a duplicate application", async () => {
    // Arrange
    // Act
    // Assert
  });
});
```

Rules for the skeletons:

- Do not delete a `todo` merely to make the suite look complete.
- If a case no longer matches the agreed product rule, confirm the change before editing it.
- Add missing cases to the existing feature file instead of opening another file for the same responsibility.
- A function does not need its own test file. Test observable feature behaviour and important rules.
- Future files for Notifications and Email stay as `todo` until those features are implemented.

## 3. Minimum cases for a feature

For each assigned file, implement every relevant prepared case and check whether the feature also needs:

1. The normal successful result.
2. Invalid, missing, or boundary input.
3. Missing authentication or an unapproved account.
4. The wrong role.
5. Access to another user's or organisation's data.
6. Duplicate or repeated actions.
7. Allowed and forbidden status changes.
8. Database or external-service failure.
9. A regression test for a confirmed bug.

Not every item applies to every feature. Security, ownership, privacy, application capacity, and destructive actions must be handled before small display or formatting cases.

## 4. Test-writing format

- Name the behaviour clearly: `rejects an organisation that does not own the opportunity`.
- Keep one main behaviour per test.
- Structure the test as Arrange, Act, Assert.
- Assert HTTP status/body, saved data, returned state, or visible UI.
- Tests must be independent and repeatable in any order.
- Never use production/staging data, real secrets, or real user accounts.
- Do not call Cloudinary, a future email provider, or another external service in normal unit tests. Mock the provider boundary.
- Do not use arbitrary sleep delays. Use fake time or wait for an observable result.

### Backend unit

Run the real controller/helper/service being tested and mock its dependencies. Reset mocks between tests. Do not mock the function under test.

### Backend integration

Enter through the Express API with Supertest. Use real routes, auth/role middleware, controllers, models, and a dedicated disposable test database. Clean test data after each test. External providers may still be mocked at their adapter boundary.

### Frontend unit

Use fixed inputs, dates, and expected outputs. Zustand stores may mock Axios and Socket.IO, but the store action itself must be real.

### Frontend component

Use React Testing Library and `user-event`. Find elements through roles, accessible names, labels, and visible text. Test what the user sees and does, not private state or CSS class names.

## 5. Commands

Run commands from the relevant package folder.

### Backend

```bash
npm run lint
npm run test:unit
npm run test:integration
npm test
```

### Frontend

```bash
npm run lint
npm run test:unit
npm run test:component
npm test
npm run build
```

GitLab runs the non-watch test commands, lint, and frontend build after code is pushed. Contributors should run the relevant commands locally first.

## 6. When an assigned test file is complete

The file is complete when:

- all currently applicable `it.todo` cases in that file are real tests;
- important cases discovered while writing are added;
- the tests prove behaviour instead of duplicating implementation details;
- the relevant local tests and lint pass;
- frontend work also keeps the production build passing;
- the GitLab pipeline passes.

Cases for features that are not implemented or still need a product decision remain `todo`; they must not be given invented expected behaviour.

## 7. External email rule

Future email tests are split into two parts:

- Automated tests mock the email provider and prove recipient, template data, duplicate prevention, retry, timeout, and failure recording.
- The later manual E2E checks one sandbox email delivery through the real provider.

Normal local and GitLab tests must never send real email.
