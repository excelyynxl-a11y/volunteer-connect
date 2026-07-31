import jwt from "jsonwebtoken";
import { Server } from "socket.io";

import { User } from "../models/user.model.js";

let socketServer = null;

export const getUserSocketRoom = (userId) => `user:${String(userId)}`;

export const parseCookieHeader = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        const name =
          separatorIndex === -1 ? cookie : cookie.slice(0, separatorIndex);
        const value =
          separatorIndex === -1 ? "" : cookie.slice(separatorIndex + 1);

        try {
          return [name, decodeURIComponent(value)];
        } catch {
          return [name, value];
        }
      }),
  );

const createSocketAuthError = (message, code) => {
  const error = new Error(message);
  error.data = { code };
  return error;
};

export const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parseCookieHeader(socket.handshake.headers.cookie);
    const token = cookies.jwt;

    if (!token) {
      return next(
        createSocketAuthError("Unauthorised - No Token Provided.", "NO_TOKEN"),
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      "_id role approvalStatus",
    );

    if (!user) {
      return next(
        createSocketAuthError(
          "Unauthorised - User no longer exists.",
          "USER_NOT_FOUND",
        ),
      );
    }

    if (
      user.approvalStatus !== "approved" ||
      !["volunteer", "organisation"].includes(user.role)
    ) {
      return next(
        createSocketAuthError(
          "Access denied for this account.",
          "ACCOUNT_NOT_ALLOWED",
        ),
      );
    }

    socket.data.user = user;
    return next();
  } catch (error) {
    const code =
      error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN";
    return next(
      createSocketAuthError(
        "Unauthorised - Invalid or expired token.",
        code,
      ),
    );
  }
};

export const initializeSocketServer = (httpServer) => {
  if (socketServer) {
    return socketServer;
  }

  socketServer = new Server(httpServer, {
    cors:
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            credentials: true,
            origin: "http://localhost:5173",
          },
  });

  socketServer.use(authenticateSocket);
  socketServer.on("connection", (socket) => {
    socket.join(getUserSocketRoom(socket.data.user._id));
  });

  return socketServer;
};

export const getSocketServer = () => socketServer;

export const emitToUsers = (userIds, eventName, payload) => {
  if (!socketServer) {
    return false;
  }

  const uniqueUserIds = new Set(
    userIds.filter(Boolean).map((userId) => String(userId)),
  );

  uniqueUserIds.forEach((userId) => {
    socketServer.to(getUserSocketRoom(userId)).emit(eventName, payload);
  });

  return true;
};

export const closeSocketServer = async () => {
  if (!socketServer) {
    return;
  }

  const serverToClose = socketServer;
  socketServer = null;
  await new Promise((resolve) => serverToClose.close(resolve));
};
