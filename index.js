
const express = require("express");
const http = require("http");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socket(server,{
    cors:{
        origin:"*"
    }
});

const connectedClients = {};

io.on("connection", (socketClient) => {
  console.log(`User connected: ${socketClient.id}`);

  socketClient.on("join", (data) => {
    const { username, group } = data;
    connectedClients[socketClient.id] = { username, group };
    socketClient.join(group);
    io.to(group).emit("chat message", `User ${username} has joined the chat in group ${group}`);
  });

  socketClient.on("chat message", (data) => {
    const { user, group, message } = data;
    io.to(group).emit("chat message", {
      user,
      message,
    });
  });

  socketClient.on("disconnect", () => {
    const user = connectedClients[socketClient.id];
    if (user) {
      const { username, group } = user;
      io.to(group).emit("chat message", `User ${username} has left the chat in group ${group}`);
      delete connectedClients[socketClient.id];
    }
  });
});

server.listen(4002, () => {
  console.log("Server is running on port 4002");
});
