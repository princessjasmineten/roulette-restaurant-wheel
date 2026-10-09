const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = new Map();

function createRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));

  return code;
}

function sanitizeText(value) {
  return String(value ?? "").trim();
}

function snapshotRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    closed: room.closed,
    entries: room.entries.map((entry) => ({
      id: entry.id,
      text: entry.text,
      addedBy: entry.addedBy,
    })),
  };
}

function broadcastRoom(code) {
  const room = rooms.get(code);
  if (!room) return;

  io.to(code).emit("room:update", snapshotRoom(room));
}

io.on("connection", (socket) => {
  socket.on("host:create-room", () => {
    const code = createRoomCode();
    const room = {
      code,
      hostId: socket.id,
      closed: false,
      entries: [],
    };

    rooms.set(code, room);
    socket.data.roomCode = code;
    socket.data.role = "host";
    socket.join(code);

    socket.emit("room:created", { code, role: "host" });
    socket.emit("room:joined", { code, role: "host" });
    socket.emit("room:update", snapshotRoom(room));
  });

  socket.on("guest:join-room", ({ code, name }) => {
    const roomCode = sanitizeText(code).toUpperCase();
    const displayName = sanitizeText(name) || "Guest";

    if (!roomCode) {
      socket.emit("room:error", "Enter a room code.");
      return;
    }

    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit("room:error", "Room not found.");
      return;
    }

    socket.data.roomCode = roomCode;
    socket.data.role = "guest";
    socket.data.name = displayName;
    socket.join(roomCode);

    socket.emit("room:joined", { code: roomCode, role: "guest" });
    socket.emit("room:update", snapshotRoom(room));
    io.to(roomCode).emit("notification", `${displayName} joined the room.`);
  });

  socket.on("guest:add-entry", ({ code, text }) => {
    const roomCode = sanitizeText(code).toUpperCase();
    const entryText = sanitizeText(text);
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("room:error", "Room not found.");
      return;
    }

    if (room.closed) {
      socket.emit("room:error", "This room is closed. No more entries can be added.");
      return;
    }

    if (!entryText) {
      socket.emit("room:error", "Please enter a place to eat.");
      return;
    }

    room.entries.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: entryText,
      addedBy: socket.data.name || "Guest",
    });

    broadcastRoom(roomCode);
    io.to(roomCode).emit("notification", `${entryText} has been added.`);
  });

  socket.on("host:close-room", ({ code }) => {
    const roomCode = sanitizeText(code).toUpperCase();
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("room:error", "Room not found.");
      return;
    }

    if (socket.id !== room.hostId) {
      socket.emit("room:error", "Only the host can close the room.");
      return;
    }

    room.closed = true;
    broadcastRoom(roomCode);
    io.to(roomCode).emit("room:closed", { closed: true });
    io.to(roomCode).emit("notification", "The room is closed! Time to spin the wheel.");
  });

  socket.on("host:spin-wheel", ({ code }) => {
    const roomCode = sanitizeText(code).toUpperCase();
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("room:error", "Room not found.");
      return;
    }

    if (socket.id !== room.hostId) {
      socket.emit("room:error", "Only the host can spin the wheel.");
      return;
    }

    if (room.entries.length === 0) {
      socket.emit("room:error", "Add at least one place before spinning.");
      return;
    }

    const winner = room.entries[Math.floor(Math.random() * room.entries.length)];
    io.to(roomCode).emit("roulette:result", {
      roomCode,
      winner: { ...winner },
    });
    io.to(roomCode).emit("notification", `Picked: ${winner.text}`);
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;

    const room = rooms.get(roomCode);
    if (!room) return;

    if (socket.id === room.hostId) {
      rooms.delete(roomCode);
      io.to(roomCode).emit("room:deleted", {
        message: "The host left. This room is no longer active.",
      });
      io.in(roomCode).socketsLeave(roomCode);
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
