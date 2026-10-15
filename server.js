const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read data.json safely
function readCabinData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data.json:', err);
    throw err;
  }
}

// Helper to write data.json safely
function writeCabinData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to data.json:', err);
    throw err;
  }
}

// Routes
// GET /api/status - Returns active cabin status, faculty profile, and daily timetable
app.get('/api/status', (req, res) => {
  try {
    const data = readCabinData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve cabin status' });
  }
});

// GET /api/timetable - Returns timetable schedule array for today
app.get('/api/timetable', (req, res) => {
  try {
    const data = readCabinData();
    res.json(data.timetable_today || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve timetable' });
  }
});

// POST /api/status - Updates cabin status and broadcasts changes across WebSockets
app.post('/api/status', (req, res) => {
  try {
    const data = readCabinData();
    const { state, activity_reason, location, expected_return, updated_by } = req.body;

    // Validate state
    const validStates = ['available', 'busy', 'away', 'unknown'];
    if (state && !validStates.includes(state)) {
      return res.status(400).json({ error: `Invalid state. Must be one of: ${validStates.join(', ')}` });
    }

    // Update current_status fields
    if (state !== undefined) data.current_status.state = state;
    if (activity_reason !== undefined) data.current_status.activity_reason = activity_reason;
    if (location !== undefined) data.current_status.location = location;
    if (expected_return !== undefined) data.current_status.expected_return = expected_return;
    data.current_status.last_updated = new Date().toISOString();
    if (updated_by !== undefined) data.current_status.updated_by = updated_by;

    // Persist to disk
    writeCabinData(data);

    // Broadcast updated data to all connected WebSocket clients
    io.emit('status_updated', data);
    console.log(`[${new Date().toLocaleTimeString()}] Status updated: ${data.current_status.state} - ${data.current_status.activity_reason || 'No reason'}`);

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: data
    });
  } catch (err) {
    console.error('Failed to update status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Send initial data to newly connected client
  try {
    const initialData = readCabinData();
    socket.emit('status_updated', initialData);
  } catch (err) {
    console.error('Error sending initial data via socket:', err);
  }

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start server only when executed directly (not when imported as a module)
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  Smart Cabin Server running at:`);
    console.log(`  > Local: http://localhost:${PORT}`);
    console.log(`  > Student View: http://localhost:${PORT}/index.html`);
    console.log(`  > Admin Panel:  http://localhost:${PORT}/admin.html`);
    console.log(`  > Login Page:   http://localhost:${PORT}/login.html`);
    console.log(`===============================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[Server Error] Port ${PORT} is already in use by another process.`);
      console.error(`To use a different port, run:`);
      console.error(`  $env:PORT=3001; node server.js  (PowerShell)`);
      console.error(`  PORT=3001 node server.js        (Bash)\n`);
      process.exit(1);
    } else {
      console.error('[Server Error]', err);
      process.exit(1);
    }
  });
}

module.exports = { app, server, io };
