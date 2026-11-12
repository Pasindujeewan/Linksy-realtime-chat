import app from "./app.js";
import connectDB from "./config/db.js";
import { checkS3Connection } from "./config/s3.js";
import { connectRedis } from "./config/redis.js";
import { initializeSocket } from "./config/socket.js";

// initialize the database, redis, and S3 connection before starting the server
await connectRedis();
await checkS3Connection();
await connectDB();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
