# VolunteerConnect Test Scope Map

This file answers one question: **which prepared test files belong to each feature?**

It is not an assignment board and does not track owners, dates, progress, or every GitLab run. The SA may divide these files in any way the team agrees.

## Scope by feature

| Feature | Backend unit | Backend integration | Frontend unit | Frontend component | Manual E2E later |
|---|---|---|---|---|---|
| Health / test setup | Existing backend suites | `app.test.js` | Existing frontend setup | Existing example | Setup checks |
| Authentication / access | `auth.controller.test.js`, `auth.middleware.test.js` | `auth.api.test.js` | `utils.test.js`, `auth.store.test.js` | `AuthRoutes.test.jsx`, `AuthForms.test.jsx` | Signup, approval, login, role access |
| Admin / users | `admin.controller.test.js`, `user.controller.test.js` | `admin.api.test.js` | `admin.store.test.js` | `AdminManagement.test.jsx` | User review and protected lists |
| Volunteer profile / availability | `volunteer.controller.test.js`, existing `availability.test.js`, `multer.middleware.test.js` | `volunteer.api.test.js` | `availability.test.js`, `volunteer.store.test.js`, `resume.test.js` | `VolunteerProfile.test.jsx` | Profile, avatar, persistence |
| Organisation profile | `organisation.controller.test.js`, `multer.middleware.test.js` | `organisation.api.test.js` | `organisation.store.test.js` | `OrganisationProfile.test.jsx` | Public and own profile |
| Opportunities | `opportunity.controller.test.js`, `opportunity.model.test.js` | `opportunity.api.test.js` | `opportunity.test.js`, `organisation.store.test.js`, `volunteer.store.test.js` | `OpportunityManagement.test.jsx`, `OpportunityDiscovery.test.jsx` | Create, edit, discover, ownership |
| Applications | `application.controller.test.js`, `application.model.test.js` | `application.api.test.js` | existing `application.test.js`, `application.store.test.js` | existing `ConfirmApplicationModal.test.jsx`, `ApplicationFlow.test.jsx` | Apply, review, withdraw, capacity |
| Follow / followers | existing `follow.controller.test.js` | `follow.api.test.js` | `follow.store.test.js` | `Follow.test.jsx` | Follow/unfollow and follower access |
| Messaging | existing messaging unit files | `message.api.test.js` | `message.store.test.js` | `Messaging.test.jsx` | Two-account realtime and attachments |
| Reports | `report.controller.test.js`, `report.model.test.js` | `report.api.test.js` | `report.store.test.js` | `Reporting.test.jsx` | Submit and Admin review |
| Notifications / email (future) | `notification.test.js`, `email.service.test.js` | `notification.api.test.js` | `notification.store.test.js` | `Notification.test.jsx` | In-app + sandbox email |

All paths in the table are relative to their matching test folder:

```text
backend/tests/unit/
backend/tests/integration/
frontend/tests/unit/
frontend/tests/component/
```

## Existing real coverage

Some files already contain implemented tests and must be preserved:

- Backend Availability.
- Backend Follow controller coverage.
- Backend Messaging lifecycle, attachment, controller, cleanup, expiry, maintenance, and Socket coverage.
- Backend health smoke.
- Frontend Application helper examples.
- Frontend Confirm Application Modal examples.

Prepared `it.todo(...)` cases describe remaining work. Contributors convert applicable cases into real tests and add any important case the skeleton missed.

## Intentionally not given executable behaviour yet

- Notification/email skeletons are future placeholders; there is no real provider call in CI.
- Verified Volunteer Hours remain out of scope until the client confirms the workflow. Scheduled Opportunity duration is not verified hours.
- Account removal cascade/retention behaviour is not specified, so no test invents that policy.
- Automated browser E2E is not used. The team runs `MANUAL_E2E_CHECKLIST.md` together later.
