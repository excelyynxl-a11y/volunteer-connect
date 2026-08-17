import { describe, it } from "vitest";

describe("authentication and role middleware", () => {
  it.todo("rejects a request with no JWT cookie");
  it.todo("rejects invalid and expired JWTs");
  it.todo("rejects a valid token when the user no longer exists");
  it.todo("rejects a valid user whose account is not approved");
  it.todo("attaches the approved user without a password and calls next");
  it.todo("allows only an admin through adminOnly");
  it.todo("allows a role included by allowRoles");
  it.todo("rejects a role not included by allowRoles");
});
