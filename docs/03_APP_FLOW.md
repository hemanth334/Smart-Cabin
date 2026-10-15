# App Flow Document

## 1. Directory Structure
```text
smart-cabin/
│
├── public/
│   ├── index.html            # Public / Student Dashboard
│   ├── admin.html            # HOD Management Panel
│   ├── login.html            # Google / Microsoft Sign-in Page
│   ├── css/
│   │   └── style.css         # Unified Master Stylesheet
│   └── js/
│       ├── app.js            # Student UI & WebSocket Listener
│       └── admin.js          # HOD Controls & Dispatcher
│
├── data/
│   └── data.json             # Flat-file database
│
├── server.js                 # Express server & WebSocket hub
├── package.json
└── README.md
```

## 2. Navigation & User Journeys

### Flow A: Student / Visitor
1. Student accesses `login.html` (or clicks Login on `index.html`).
2. Clicks **"Sign in with Google"** or **"Sign in with Microsoft"** and selects "Student".
3. Redirected to `index.html`.
4. The page queries `GET /api/status` to display:
   - HOD profile header (Name, Cabin number, Department).
   - Live availability badge with pulsing indicator.
   - Predict panel (shows room/activity and return time if Away).
   - Today's lecture schedule strip.
5. Background socket listener (`socket.on('status_updated')`) watches for real-time changes.

### Flow B: HOD / Faculty Administrator
1. Faculty accesses `login.html` and selects "HOD / Faculty" role.
2. Redirected to `admin.html`.
3. The interface displays:
   - 4 Quick-Action Preset buttons: `Available`, `With Visitors`, `In Class`, `Lunch Break`.
   - Custom reason input field.
   - Quick return-time chips: `+15m`, `+30m`, `+45m`, `+1h`.
   - Direct manual "Broadcast Status" button.
4. Clicking any option dispatches `POST /api/status`.
5. An in-page confirmation banner appears, and student screens update instantaneously.
