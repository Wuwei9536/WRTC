const express = require("express");
const path = require("path");
const app = express();
const httpServer = require("http").createServer(app);
// const websocketServer = require("websocket").server;
// const io = new websocketServer({
//   httpServer,
// });
const io = require("socket.io")(httpServer);
const public = path.join(__dirname, "/public");

app.use(express.static(public));

app.get("/", (req, res) => {
  res.sendFile(path.join(public, "call.html"));
});

app.get("/rtc/*", (req, res) => {
  res.sendFile(path.join(public, "rtc.html"));
});

app.get("/authrtc/*", (req, res) => {
  res.sendFile(path.join(public, "rtc.html"));
});

function logIt(msg) {
  const date = new Date();
  console.log(`${date}:${msg}`);
}

io.on("connection", function (socket) {
  socket.on("join", function (room) {
    logIt(`A client joined the room ${room}`);
    const clients = io.sockets.adapter.rooms.get(room);
    const numClients = typeof clients !== "undefined" ? clients.size : 0;
    if (numClients === 0) {
      socket.join(room);
    } else if (numClients === 1) {
      socket.join(room);
      logIt(`room ${room} Broadcasting ready message`);
      socket.to(room).emit("ready", room);
    } else {
      socket.emit("full", room);
    }
  });

  // Relay candidate messages
  socket.on("icecandidate", function (candidate, room) {
    logIt(`${room} Received candidate. Broadcasting... ${candidate}`);
    socket.to(room).emit("icecandidate", candidate);
  });

  // Relay offers
  socket.on("offer", function (offer, room) {
    socket.to(room).emit("offer", offer);
  });

  // Relay answers
  socket.on("answer", function (answer, room) {
    socket.to(room).emit("answer", answer);
  });
});

const port = process.env.PORT || 8000;
httpServer.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
