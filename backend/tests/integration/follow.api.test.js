import { describe, it } from "vitest";

describe("follow API", () => {
  it.todo("allows only a Volunteer to follow, unfollow, check status, and list followed organisations");
  it.todo("rejects invalid, missing, and unapproved organisations");
  it.todo("returns conflict for sequential and concurrent duplicate follow requests");
  it.todo("makes repeated unfollow requests end in the same successful state");
  it.todo("returns only approved followed organisations with safe fields");
  it.todo("allows only the owning Organisation or an Admin to view safe follower data");
});
