import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
    console.log(`User added: ${userId}, socketId: ${socketId}`);
  }
  console.log("Current online users: ", onlineUser);
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
  console.log(`User with socketId ${socketId} removed`);
  console.log("Current online users: ", onlineUser);
};

const getUser = (userId) => {
  console.log(`Attempting to find user with id: ${userId}`);
  const user = onlineUser.find((user) => user.userId === userId);
  console.log(`Found user: ${user ? JSON.stringify(user) : 'not found'}`);
  return user;
};

io.on("connection", (socket) => {
  console.log("New user connected: ", socket.id);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
      console.log(`Message sent to: ${receiverId}`);
    } else {
      console.error(`User with id ${receiverId} not found.`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("User disconnected: ", socket.id);
  });
});

io.listen(4000, () => {
  console.log("Socket.io server is running on port 4000");
});
