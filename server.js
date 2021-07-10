// importing all the modules required in the server
const express = require("express");
const {
  request
} = require("http");
const app = express();
const {
  v4: uuidv4
} = require("uuid");
const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const {
  ExpressPeerServer
} = require("peer");
const internal = require("stream");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

// setting the view engine as ejs file 
app.set("view engine", "ejs");
// letting the app use all the folders and files outside the server
app.use(express.static("public"));
app.use(express.static(__dirname + "views"));
// using peerjs library 
app.use("/peerjs", peerServer);

// rendering the home.ejs file on main call
app.get("/", (req, res) => {
  res.render("home");
});

// redirecting the server to jrCall room with unique id
app.get("/jrCall", (req, res) => {
  res.redirect(`/jrCall` + `/${uuidv4()}`);
});

// redirecting the normal call to call with unique id
app.get("/call", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// rendering the room.ejs file on getting request from /:room
app.get("/:room", (request, response) => {
  response.render("room", {
    room_id: request.params.room
  });
});

// rendering the roomJr.ejs file on getting request from /jrCall/:roomJr
app.get("/jrCall/:room", (request, response) => {
  response.render("roomJr", {
    room_id: request.params.room
  });
});

// emitting the user and messages from user to all the participants in the meeting
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId, userName);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName)
    });
    socket.on("connect", (userName) => {
      io.to(roomId).emit(userName);
    });
  });
});

// listening the server 
server.listen(process.env.PORT || 3030);