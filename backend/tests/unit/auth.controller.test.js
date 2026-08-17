import { describe, it } from "vitest";

describe("auth controller", () => {
  describe("signup", () => {
    it.todo("rejects missing or invalid shared signup fields");
    it.todo("normalises name and email before checking and saving the user");
    it.todo("rejects an email that already belongs to a user");
    it.todo("requires a valid age group and PDF resume for a volunteer");
    it.todo("requires non-empty biodata for an organisation");
    it.todo("returns a safe pending account without issuing a token");
    it.todo("issues a token only when the created account is approved");
    it.todo("returns a safe error when resume upload or persistence fails");
  });

  describe("login and session", () => {
    it.todo("returns the same response for an unknown email and wrong password");
    it.todo("blocks pending and rejected accounts without issuing a token");
    it.todo("issues a token and returns safe profile fields for an approved user");
    it.todo("clears the authentication cookie on logout");
  });
});
