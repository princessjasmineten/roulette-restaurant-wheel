* {
  box-sizing: border-box;
}

:root {
  --bg: #f4efe9;
  --panel: rgba(255, 255, 255, 0.76);
  --panel-border: rgba(17, 24, 39, 0.08);
  --primary: #ff5a5f;
  --primary-deep: #d93b40;
  --secondary: #1f2937;
  --accent: #ffb703;
  --muted: #6b7280;
  --success: #0f766e;
  --shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

html, body {
  margin: 0;
  min-height: 100%;
  font-family: "Inter", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(255, 180, 0, 0.24), transparent 30%),
    radial-gradient(circle at bottom right, rgba(255, 90, 95, 0.18), transparent 32%),
    var(--bg);
  color: var(--secondary);
}

body {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 30px 18px;
}

button,
input {
  font: inherit;
}

.page-shell {
  width: min(1200px, 100%);
}

.topbar {
  margin-bottom: 24px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  margin: 0 0 8px;
}

h1 {
  margin: 0;
  font-size: clamp(2.3rem, 5vw, 3.5rem);
  line-height: 1.05;
}

.app-grid {
  display: grid;
  grid-template-columns: 320px minmax(340px, 1fr) 360px;
  gap: 20px;
}

.panel {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 22px;
}

.controls-panel,
.choices-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.segmented-control {
  display: flex;
  gap: 8px;
  padding: 6px;
  background: rgba(15, 23, 42, 0.04);
  border-radius: 14px;
}

.tab {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 10px;
  color: var(--muted);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab.active {
  background: white;
  color: var(--secondary);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}

.card {
  display: none;
  padding: 18px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.52);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.card.active {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card h2 {
  margin: 0;
  font-size: 1.2rem;
}

.card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--secondary);
  font-weight: 600;
}

input {
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.7);
  color: var(--secondary);
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus {
  border-color: rgba(255, 90, 95, 0.9);
  box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.12);
}

button {
  cursor: pointer;
  border: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

button:hover {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.primary-btn,
.secondary-btn {
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
}

.primary-btn {
  background: linear-gradient(135deg, var(--primary), var(--primary-deep));
  color: white;
  box-shadow: 0 12px 24px rgba(255, 90, 95, 0.25);
}

.secondary-btn {
  background: rgba(17, 24, 39, 0.06);
  color: var(--secondary);
}

.wheel-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 18px 28px;
  gap: 18px;
}

.room-status {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.06);
  font-size: 0.92rem;
  font-weight: 600;
}

.room-status strong {
  letter-spacing: 0.12em;
}

.roulette-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 390px);
  aspect-ratio: 1 / 1;
}

.pointer {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 18px solid transparent;
  border-right: 18px solid transparent;
  border-top: 26px solid var(--accent);
  filter: drop-shadow(0 8px 14px rgba(255, 183, 3, 0.4));
  z-index: 2;
}

.roulette-wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 12px solid rgba(17, 24, 39, 0.15);
  background: conic-gradient(
    #ff5a5f 0deg 72deg,
    #ffb703 72deg 144deg,
    #4cc9f0 144deg 216deg,
    #2ec4b6 216deg 288deg,
    #c77dff 288deg 360deg
  );
  box-shadow: inset 0 0 0 6px rgba(255, 255, 255, 0.35), 0 28px 38px rgba(15, 23, 42, 0.12);
  transition: transform 4.5s cubic-bezier(0.12, 0.72, 0.2, 1), filter 0.2s ease;
  overflow: hidden;
}

.roulette-wheel::before {
  content: "";
  position: absolute;
  inset: 11%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.wheel-inner-ring {
  position: absolute;
  inset: 25%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  border: 4px solid rgba(255, 255, 255, 0.7);
}

.result-banner {
  padding: 12px 18px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(255, 183, 3, 0.14));
  border: 1px solid rgba(15, 118, 110, 0.18);
  color: var(--success);
  font-weight: 800;
  text-align: center;
}

.hidden {
  display: none !important;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.host-actions {
  display: flex;
  gap: 8px;
}

.entry-form {
  display: flex;
  gap: 10px;
}

.entry-form input {
  flex: 1;
}

.entries-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 440px;
  overflow: auto;
}

.entries-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: rgba(17, 24, 39, 0.04);
  border: 1px solid rgba(17, 24, 39, 0.06);
  border-radius: 12px;
  padding: 11px 12px;
  font-weight: 600;
}

.entries-list li span {
  color: var(--secondary);
}

.entries-list li small {
  color: var(--muted);
  font-weight: 600;
}

.empty-state {
  justify-content: center !important;
  color: var(--muted);
  text-align: center;
  padding: 18px 12px !important;
  border-style: dashed !important;
}

.toast {
  position: fixed;
  right: 20px;
  bottom: 20px;
  max-width: 320px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(17, 24, 39, 0.94);
  color: white;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.28);
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
  z-index: 99;
}

.toast.visible {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 980px) {
  .app-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
