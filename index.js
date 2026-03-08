const express = require("express");
const cors = require("cors");
const connectedDb = require("./models/db");
require("dotenv").config();
const sessions = require("express-session");
const { MongoStore } = require("connect-mongo");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const authRouter = require("./routes/authRooute");
const profileRouter = require("./routes/profileRoute");
const friendRequestRouter = require("./routes/friendRequestRoute");
const notificationRouter = require("./routes/notification");
const messageRouter = require("./routes/messageRoute");

const Message = require("./models/messageModel");
const Profile = require("./models/profile");
const groupChatRoute = require("./routes/groupChatRoute");


const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

connectedDb();

/* ---------------- SESSION ---------------- */

app.use(
  sessions({
    secret: process.env.SECRET_KEY || "secretkey",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
      httpOnly: false,
      sameSite: "lax"
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      ttl: 60 * 60 * 2
    })
  })
);

/* ---------------- STATIC FILES ---------------- */

app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "uploads", "profiles"))
);

/* ---------------- ROUTES ---------------- */

app.use("/user", authRouter);
app.use("/profile", profileRouter);
app.use("/friend", friendRequestRouter);
app.use("/notification", notificationRouter);
app.use("/messages",messageRouter);
app.use("/group",groupChatRoute);

/* ---------------- SERVER ---------------- */

const port = process.env.PORT || 5000;

const server = createServer(app);

/* ---------------- SOCKET.IO ---------------- */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

/* Store connected users */
const users = {};

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  /* ---------------- REGISTER USER ---------------- */

  socket.on("register", async (userId) => {

    try {

      users[userId] = socket.id;

      socket.join(userId);

      await Profile.findOneAndUpdate(
        { _id: userId },
        {
          isOnline: true
        }
      );

      console.log("User online:", userId);

      io.emit("user_online", userId);

    } catch (err) {
      console.log(err);
    }

  });


  /* ---------------- SEND MESSAGE ---------------- */

  socket.on("send_message", async (data) => {

    try {

      const { senderId, receiverId, text } = data;

      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text: text
      });

      io.to(receiverId).emit("receive_message", newMessage);

      io.to(senderId).emit("receive_message", newMessage);

    } catch (error) {
      console.log(error);
    }

  });


  /* ---------------- DISCONNECT ---------------- */

  socket.on("disconnect", async () => {

    console.log("User disconnected:", socket.id);

    const userId = Object.keys(users).find(
      key => users[key] === socket.id
    );

    if (userId) {

      try {

        await Profile.findOneAndUpdate(
          { _id: userId },
          {
            isOnline: false,
            lastSeen: new Date()
          }
        );

        delete users[userId];

        console.log("User offline:", userId);

        io.emit("user_offline", userId);

      } catch (err) {
        console.log(err);
      }

    }

  });

});

/* ---------------- START SERVER ---------------- */

server.listen(port, () => {
  console.log("Server running on", port);
});