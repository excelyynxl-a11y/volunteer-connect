// Copyright 2026 FIT_3170_Team_4

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import "dotenv/config";

import { createServer } from "node:http";

import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { initializeSocketServer } from "./lib/socket.js";
import { startMessagingMaintenance } from "./services/messagingMaintenance.service.js";

const port = process.env.PORT || 5001;
const httpServer = createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    initializeSocketServer(httpServer);
    await startMessagingMaintenance();
    httpServer.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch {
    console.error("Server startup failed because MongoDB is unavailable.");
    process.exit(1);
  }
};

startServer();
