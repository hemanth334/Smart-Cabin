# Implementation Plan

## Phase 1: Environment & Project Setup
- [ ] Initialize Node.js project: `npm init -y`
- [ ] Install dependencies: `npm install express socket.io cors`
- [ ] Create folder structure:
  - `public/css/style.css`
  - `public/js/app.js`
  - `public/js/admin.js`
  - `public/index.html`
  - `public/admin.html`
  - `public/login.html`
  - `data/data.json`
- [ ] Initialize `server.js` with Express static file serving for `public/`.

## Phase 2: Backend & Real-Time Setup
- [ ] Implement reading and writing routines for `data/data.json` in `server.js`.
- [ ] Create `GET /api/status` endpoint.
- [ ] Create `POST /api/status` endpoint.
- [ ] Bind `socket.io` to the Express HTTP server and broadcast `io.emit('status_updated', data)` on POST.

## Phase 3: Frontend HTML & CSS
- [ ] Build `public/login.html` featuring realistic Google and Microsoft login buttons and role selector cards.
- [ ] Build `public/index.html` containing faculty header card, hero status pill, predict/return banner, and timetable list.
- [ ] Build `public/admin.html` containing quick action preset buttons (Available, Busy, Class, Lunch), reason inputs, and time increment chips (+15m, +30m).
- [ ] Code `public/css/style.css` defining layouts, responsive styling, and color status modifiers (`.state-available`, `.state-busy`, `.state-away`, `.state-unknown`).

## Phase 4: Client-Side Logic & Instant Sync
- [ ] In `public/js/app.js`:
  - Fetch initial state via `fetch('/api/status')` on page load and populate DOM.
  - Establish Socket.io connection: `const socket = io();`.
  - Listen to `socket.on('status_updated', (newData) => { ... })` and re-render classes, badge text, and return times dynamically.
- [ ] In `public/js/admin.js`:
  - Add click listeners to quick preset buttons and duration chips.
  - Send POST requests to `/api/status` with updated JSON payloads.

## Phase 5: Verification & Demo Run
- [ ] Launch application: `node server.js`.
- [ ] Open `http://localhost:3000/index.html` (Student View) in one browser tab.
- [ ] Open `http://localhost:3000/admin.html` (Admin Panel) in an adjacent tab.
- [ ] Change states in the admin dock and verify that the student view instantly reflects the new color, text, and predicted return time with zero page refresh.
