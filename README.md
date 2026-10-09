const socket = io();

const elements = {
  createRoomBtn: document.getElementById("create-room-btn"),
  joinRoomBtn: document.getElementById("join-room-btn"),
  closeRoomBtn: document.getElementById("close-room-btn"),
  spinBtn: document.getElementById("spin-btn"),
  addEntryBtn: document.getElementById("add-entry-btn"),
  roomStatus: document.getElementById("room-status"),
  roomCodeDisplay: document.getElementById("room-code-display"),
  entriesList: document.getElementById("entries-list"),
  restaurantInput: document.getElementById("restaurant-input"),
  roomCodeInput: document.getElementById("room-code-input"),
  guestName: document.getElementById("guest-name"),
  rouletteWheel: document.getElementById("roulette-wheel"),
  resultBanner: document.getElementById("result-banner"),
  toast: document.getElementById("toast"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  cards: Array.from(document.querySelectorAll(".card")),
};

let currentRoomCode = "";
let currentRole = "";
let currentEntries = [];
let isRoomClosed = false;
let wheelRotation = 0;

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 2400);
}

function syncTabs(activeTab) {
  elements.tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === activeTab;
    tab.classList.toggle("active", isActive);
  });

  elements.cards.forEach((card) => {
    const isActive = card.dataset.card === activeTab;
    card.classList.toggle("active", isActive);
  });
}

function renderEntries(entries) {
  currentEntries = entries;
  elements.entriesList.innerHTML = "";

  if (!entries.length) {
    elements.entriesList.innerHTML = '<li class="empty-state">No places added yet.</li>';
    return;
  }

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span>${index + 1}. ${entry.text}</span>
      <small>${entry.addedBy}</small>
    `;
    elements.entriesList.appendChild(item);
  });
}

function renderWheel(entries) {
  if (!entries.length) {
    const neutralGradient = "conic-gradient(#f1f5f9 0deg 72deg, #e2e8f0 72deg 144deg, #dbeafe 144deg 216deg, #e0f2fe 216deg 288deg, #f5f3ff 288deg 360deg)";
    elements.rouletteWheel.style.background = neutralGradient;
    return;
  }

  const palette = ["#ff5a5f", "#ffb703", "#4cc9f0", "#2ec4b6", "#c77dff", "#f59e0b", "#34d399", "#fb7185"];
  const sliceAngle = 360 / entries.length;
  const segments = entries
    .map((_, index) => {
      const start = index * sliceAngle;
      const end = (index + 1) * sliceAngle;
      const color = palette[index % palette.length];
      return `${color} ${start}deg ${end}deg`;
    })
    .join(", ");

  elements.rouletteWheel.style.background = `conic-gradient(${segments})`;
}

function updateRoomUI() {
  const hasRoom = Boolean(currentRoomCode);
  const canSpin = hasRoom && currentRole === "host" && currentEntries.length > 0;

  elements.roomStatus.classList.toggle("hidden", !hasRoom);
  elements.roomCodeDisplay.textContent = hasRoom ? currentRoomCode : "—";
  elements.closeRoomBtn.disabled = !(hasRoom && currentRole === "host");
  elements.spinBtn.disabled = !(canSpin && !isRoomClosed);

  const inputsOpen = hasRoom && !isRoomClosed;
  elements.restaurantInput.disabled = !inputsOpen;
  elements.addEntryBtn.disabled = !inputsOpen;

  if (hasRoom && currentRole === "host") {
    elements.closeRoomBtn.textContent = isRoomClosed ? "Room closed" : "Close room";
  }
}

function setCurrentRoom(code, role) {
  currentRoomCode = code;
  currentRole = role;
  elements.roomCodeInput.value = code;
  updateRoomUI();
}

function handleRoomUpdate(room) {
  currentRoomCode = room.code;
  isRoomClosed = Boolean(room.closed);
  renderEntries(room.entries || []);
  renderWheel(room.entries || []);
  updateRoomUI();

  if (room.closed) {
    elements.resultBanner.classList.add("hidden");
  }
}

socket.on("connect", () => {
  showToast("Connected");
});

socket.on("room:created", ({ code, role }) => {
  setCurrentRoom(code, role);
  showToast(`Room ${code} created`);
  syncTabs("host");
});

socket.on("room:joined", ({ code, role }) => {
  setCurrentRoom(code, role);
  showToast(`Joined room ${code}`);
  syncTabs("guest");
});

socket.on("room:update", (room) => {
  handleRoomUpdate(room);
});

socket.on("room:closed", () => {
  isRoomClosed = true;
  updateRoomUI();
  showToast("Room closed. Spin the wheel!");
});

socket.on("roulette:result", ({ winner }) => {
  const winnerText = winner.text;
  const winnerIndex = currentEntries.findIndex((entry) => entry.text === winnerText);

  if (winnerIndex === -1) {
    elements.resultBanner.textContent = `Winner: ${winnerText}`;
    elements.resultBanner.classList.remove("hidden");
    return;
  }

  const segmentAngle = 360 / currentEntries.length;
  const targetAngle = 360 * 7 + (360 - (winnerIndex * segmentAngle + segmentAngle / 2 + 90) % 360);
  const endRotation = wheelRotation + targetAngle;

  elements.rouletteWheel.style.transform = `rotate(${endRotation}deg)`;
  wheelRotation = endRotation;

  window.setTimeout(() => {
    elements.resultBanner.textContent = `Winner: ${winnerText}`;
    elements.resultBanner.classList.remove("hidden");
  }, 4200);
});

socket.on("room:error", (message) => {
  showToast(message);
});

socket.on("notification", (message) => {
  showToast(message);
});

socket.on("room:deleted", ({ message }) => {
  currentRoomCode = "";
  currentRole = "";
  isRoomClosed = false;
  currentEntries = [];
  renderEntries([]);
  renderWheel([]);
  elements.resultBanner.classList.add("hidden");
  elements.roomCodeInput.value = "";
  elements.restaurantInput.value = "";
  updateRoomUI();
  showToast(message);
});

document.querySelector(".tab[data-tab='host']").addEventListener("click", () => syncTabs("host"));
document.querySelector(".tab[data-tab='guest']").addEventListener("click", () => syncTabs("guest"));

document.getElementById("create-room-btn").addEventListener("click", () => {
  socket.emit("host:create-room");
});

document.getElementById("join-room-btn").addEventListener("click", () => {
  const code = elements.roomCodeInput.value.trim();
  const name = elements.guestName.value.trim();

  if (!code) {
    showToast("Enter a room code.");
    return;
  }

  socket.emit("guest:join-room", { code, name });
});

document.getElementById("add-entry-btn").addEventListener("click", () => {
  const text = elements.restaurantInput.value.trim();

  if (!currentRoomCode) {
    showToast("Create or join a room first.");
    return;
  }

  if (!text) {
    showToast("Type a place to eat.");
    return;
  }

  socket.emit("guest:add-entry", { code: currentRoomCode, text });
  elements.restaurantInput.value = "";
});

document.getElementById("close-room-btn").addEventListener("click", () => {
  if (!currentRoomCode) {
    showToast("Create or join a room first.");
    return;
  }

  socket.emit("host:close-room", { code: currentRoomCode });
});

document.getElementById("spin-btn").addEventListener("click", () => {
  if (!currentRoomCode) {
    showToast("Create or join a room first.");
    return;
  }

  socket.emit("host:spin-wheel", { code: currentRoomCode });
});

document.getElementById("restaurant-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("add-entry-btn").click();
  }
});

document.getElementById("room-code-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("join-room-btn").click();
  }
});

renderEntries([]);
renderWheel([]);
updateRoomUI();
syncTabs("host");
