import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../../src/models/user.model.js", () => ({
  User: {
    findOne: vi.fn(),
  },
}));

import jwt from "jsonwebtoken";

import {
  authenticateSocket,
  getUserSocketRoom,
  parseCookieHeader,
} from "../../src/lib/socket.js";
import { User } from "../../src/models/user.model.js";

describe("messaging socket authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses the JWT cookie without losing encoded values", () => {
    expect(
      parseCookieHeader("theme=dark; jwt=header.payload%2Esignature"),
    ).toEqual({
      theme: "dark",
      jwt: "header.payload.signature",
    });
  });

  it("rejects a connection without the JWT cookie", async () => {
    const next = vi.fn();

    await authenticateSocket(
      {
        data: {},
        handshake: { headers: {} },
      },
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { code: "NO_TOKEN" },
      }),
    );
  });

  it("accepts an approved volunteer and assigns the user to socket data", async () => {
    const user = {
      _id: "volunteer-1",
      approvalStatus: "approved",
      role: "volunteer",
    };
    jwt.verify.mockReturnValue({ userId: user._id });
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(user),
    });
    const socket = {
      data: {},
      handshake: { headers: { cookie: "jwt=valid-token" } },
    };
    const next = vi.fn();

    await authenticateSocket(socket, next);

    expect(socket.data.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
    expect(getUserSocketRoom(user._id)).toBe("user:volunteer-1");
  });

  it("rejects admins and unapproved accounts", async () => {
    jwt.verify.mockReturnValue({ userId: "admin-1" });
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        _id: "admin-1",
        approvalStatus: "approved",
        role: "admin",
      }),
    });
    const next = vi.fn();

    await authenticateSocket(
      {
        data: {},
        handshake: { headers: { cookie: "jwt=valid-token" } },
      },
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { code: "ACCOUNT_NOT_ALLOWED" },
      }),
    );
  });
});
