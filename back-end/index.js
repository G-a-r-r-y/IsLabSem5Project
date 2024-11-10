// Backend - Express and Socket.io
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

// Routes
const userRoutes = require("./routes/user");
app.use("/user", userRoutes);

// Import Socket.io
const http = require("http");
const server = http.createServer(app); // Use http server for socket.io
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for now (you can restrict to specific origins)
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  // Listen for 'trigger re-render' event from any client
  socket.on("trigger re-render", () => {
    io.emit("trigger re-render"); // Notify all connected clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start the server on the specified port
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
