import { io } from "socket.io-client";

const socketOrigin =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : window.location.origin;

export const messageSocket = io(socketOrigin, {
  autoConnect: false,
  withCredentials: true,
});
