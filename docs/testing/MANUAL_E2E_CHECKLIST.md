# VolunteerConnect Manual E2E Checklist

Run this checklist together later, after the automated test backfill and remaining features are stable. Playwright is not required.

Use approved test accounts only. Do not write passwords, tokens, JWTs, or secrets into this file.

## Setup

- [ ] One approved and one pending/rejected Volunteer are available.
- [ ] Two approved Organisations and one pending/rejected Organisation are available.
- [ ] One Admin is available.
- [ ] Active, full, closed/cancelled, deadline-passed, and past Opportunities exist.
- [ ] Pending, approved, rejected, and withdrawn Applications exist.
- [ ] Safe PDF, JPEG/PNG, invalid, and oversized sample files are available.

## Main journeys

- [ ] Volunteer and Organisation sign up, remain blocked while pending, receive Admin approval, and then reach the correct dashboard.
- [ ] Volunteer, Organisation, and Admin cannot enter another role's protected area.
- [ ] Volunteer and Organisation update their profile/avatar and still see the saved data after a new login.
- [ ] Organisation creates, views, edits, and closes/cancels an Opportunity; another Organisation cannot edit it.
- [ ] Volunteer searches/filters Opportunities and opens the correct details and Organisation profile.
- [ ] Volunteer applies; the owning Organisation reviews the same Application; the Volunteer sees the final status.
- [ ] Duplicate, deadline-passed, full, outside-availability, and non-owner Application actions are rejected without corrupting status or capacity.
- [ ] Allowed Application withdrawal keeps status and capacity consistent.
- [ ] Volunteer follows and unfollows an Organisation; Organisation/Admin follower views show only intended safe data.
- [ ] Volunteer starts a chat; Organisation receives and replies from a second session; both see realtime updates and the correct deadline.
- [ ] Messaging accepts valid PDF/JPEG/PNG, rejects invalid/oversized files, and lets only participants download.
- [ ] Organisation ends a chat; refresh/reconnect and expiry/restart behaviour follow the agreed deletion policy.
- [ ] Volunteer reports an Opportunity; Organisation reports a Volunteer; Admin reviews and updates the report.
- [ ] Loading, empty, expired-session, and safe API-error states remain understandable and recoverable.
- [ ] Primary journeys remain usable on desktop and a narrow/mobile viewport.

## Future journeys

Do not run these until the feature exists:

- [ ] A business event creates the correct in-app Notification and read/unread state.
- [ ] The same event sends exactly one correctly addressed email through a sandbox provider.
- [ ] Volunteer hours follow the future confirmed submit/verify/correct/lock/audit workflow.
- [ ] Account removal or suspension follows the future confirmed related-data policy.
