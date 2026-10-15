# Technical Requirements Document (TRD)

## 1. Technical Stack
- **Frontend Architecture:** Pure Vanilla Web Stack with strict file separation:
  - HTML5 markup: `index.html` (Student view), `admin.html` (HOD dock), `login.html` (SSO entry)
  - Styling: `css/style.css`
  - Client-side Scripting: `js/app.js` (Student socket listener & DOM), `js/admin.js` (HOD dispatcher)
- **Backend Architecture:**
  - Runtime: Node.js
  - Web Server Framework: Express.js (`server.js`)
- **Real-Time Communication Layer:**
  - WebSockets via `socket.io` for sub-second, full-duplex status broadcasts (<100ms latency).
- **Data Persistence:**
  - Flat-file local JSON storage (`data/data.json`). No complex cloud database setup or API keys required.
- **Authentication:**
  - Mock Single Sign-On (SSO) with branded Google and Microsoft OAuth buttons providing instant role switching between Student and HOD.

## 2. System Architecture & Communication Flow
1. **Client Initialization:** The browser loads `index.html`, imports `/socket.io/socket.io.js` and `js/app.js`, and calls `GET /api/status` for initial state rendering.
2. **State Override:** HOD selects a state preset or custom return time on `admin.html`.
3. **Dispatch:** `js/admin.js` issues an HTTP POST request to `/api/status`.
4. **Broadcast:** `server.js` updates `data/data.json` and immediately triggers `io.emit('status_updated', payload)`.
5. **DOM Mutation:** Connected student browser windows catch the event and re-render the badges, colors, and timestamps without a page reload.
