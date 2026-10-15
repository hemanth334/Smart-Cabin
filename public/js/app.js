/**
 * SMART CABIN - STUDENT / VISITOR CLIENT CONTROLLER
 * Handles initial state retrieval, Socket.io subscription, and reactive DOM rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const liveClockEl = document.getElementById('liveClock');
  const socketStatusEl = document.getElementById('socketStatus');
  const socketStatusTextEl = document.getElementById('socketStatusText');
  const authBtnEl = document.getElementById('authBtn');
  const authBtnTextEl = document.getElementById('authBtnText');

  // Faculty Elements
  const facultyNameEl = document.getElementById('facultyName');
  const facultyDesignationEl = document.getElementById('facultyDesignation');
  const facultyDepartmentEl = document.getElementById('facultyDepartment');
  const facultyCabinEl = document.getElementById('facultyCabin');
  const facultyAvatarEl = document.getElementById('facultyAvatar');
  const facultyAvatarBadgeEl = document.getElementById('facultyAvatarBadge');

  // Hero Elements
  const heroStatusCardEl = document.getElementById('heroStatusCard');
  const heroStateTextEl = document.getElementById('heroStateText');
  const heroReasonTextEl = document.getElementById('heroReasonText');
  const heroLocationTextEl = document.getElementById('heroLocationText');
  const heroLastUpdatedTextEl = document.getElementById('heroLastUpdatedText');

  // Predict Panel Elements
  const predictPanelEl = document.getElementById('predictPanel');
  const predictActivityDescEl = document.getElementById('predictActivityDesc');
  const predictReturnTimeEl = document.getElementById('predictReturnTime');

  // Timetable
  const timetableListEl = document.getElementById('timetableList');

  let currentServerData = null;

  // 1. Live Digital Clock Ticker
  function startLiveClock() {
    function updateClock() {
      const now = new Date();
      liveClockEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }
  startLiveClock();

  // 2. Auth Session Check
  function initAuthNav() {
    try {
      const authRaw = localStorage.getItem('smart_cabin_auth');
      if (authRaw) {
        const user = JSON.parse(authRaw);
        if (user.role === 'hod') {
          authBtnTextEl.textContent = 'HOD Dock';
          authBtnEl.href = '/admin.html';
        } else {
          authBtnTextEl.textContent = `${user.name.split(' ')[0]} (Sign Out)`;
          authBtnEl.href = '#';
          authBtnEl.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('smart_cabin_auth');
            window.location.reload();
          });
        }
      }
    } catch (err) {
      console.warn('Auth state read error:', err);
    }
  }
  initAuthNav();

  // 3. Helper: Time Ago calculation
  function formatRelativeTime(isoString) {
    if (!isoString) return 'Updated recently';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 10) return 'Updated just now';
      if (diffSec < 60) return `Updated ${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `Updated ${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      return `Updated ${diffHr}h ago`;
    } catch (e) {
      return 'Updated recently';
    }
  }

  // 4. Render State and DOM mutations
  function renderDashboard(data) {
    if (!data) return;
    currentServerData = data;

    // Faculty Card
    if (data.faculty) {
      facultyNameEl.textContent = data.faculty.name || 'Faculty Member';
      facultyDesignationEl.textContent = data.faculty.designation || '';
      facultyDepartmentEl.textContent = data.faculty.department || '';
      facultyCabinEl.textContent = data.faculty.cabin || 'Cabin 304';
      if (data.faculty.avatar_url) {
        facultyAvatarEl.src = data.faculty.avatar_url;
      }
    }

    // Current Status
    const status = data.current_status || {};
    const state = (status.state || 'available').toLowerCase();

    // Reset modifier classes
    heroStatusCardEl.classList.remove('state-available', 'state-busy', 'state-away', 'state-unknown');
    
    // Avatar mini-badge color
    const dotColors = {
      available: 'var(--state-avail-dot)',
      busy: 'var(--state-busy-dot)',
      away: 'var(--state-away-dot)',
      unknown: 'var(--state-unknown-dot)'
    };
    if (facultyAvatarBadgeEl) {
      facultyAvatarBadgeEl.style.backgroundColor = dotColors[state] || dotColors.available;
    }

    // Apply active state
    if (state === 'available') {
      heroStatusCardEl.classList.add('state-available');
      heroStateTextEl.textContent = 'AVAILABLE';
    } else if (state === 'busy') {
      heroStatusCardEl.classList.add('state-busy');
      heroStateTextEl.textContent = 'WITH VISITORS';
    } else if (state === 'away') {
      heroStatusCardEl.classList.add('state-away');
      heroStateTextEl.textContent = 'NOT IN CABIN';
    } else {
      heroStatusCardEl.classList.add('state-unknown');
      heroStateTextEl.textContent = 'UNKNOWN';
    }

    heroReasonTextEl.textContent = status.activity_reason || 'In Cabin';
    heroLocationTextEl.textContent = status.location || (data.faculty ? data.faculty.cabin : 'Cabin');
    heroLastUpdatedTextEl.textContent = formatRelativeTime(status.last_updated);

    // Predict & Absence Return Panel
    if (state === 'away' && status.expected_return) {
      predictPanelEl.classList.remove('hidden');
      predictActivityDescEl.textContent = `${status.activity_reason || 'Away from cabin'} • Location: ${status.location || 'Campus'}`;
      predictReturnTimeEl.textContent = status.expected_return;
    } else {
      predictPanelEl.classList.add('hidden');
    }

    // Render Timetable
    renderTimetable(data.timetable_today || []);
  }

  // 5. Check if current time falls within schedule range "HH:MM - HH:MM"
  function isSlotActiveNow(timeRangeStr) {
    if (!timeRangeStr) return false;
    try {
      const parts = timeRangeStr.split('-').map(s => s.trim());
      if (parts.length !== 2) return false;

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      function toMinutes(tStr) {
        const [h, m] = tStr.split(':').map(Number);
        return h * 60 + m;
      }

      const startMin = toMinutes(parts[0]);
      const endMin = toMinutes(parts[1]);

      return currentMinutes >= startMin && currentMinutes < endMin;
    } catch (e) {
      return false;
    }
  }

  // 6. Timetable rendering
  function renderTimetable(timetable) {
    if (!timetable || !timetable.length) {
      timetableListEl.innerHTML = '<div class="timeline-slot" style="color: var(--text-muted); justify-content: center;">No scheduled lectures for today.</div>';
      return;
    }

    timetableListEl.innerHTML = timetable.map((slot) => {
      const isActive = isSlotActiveNow(slot.time);
      return `
        <div class="timeline-slot ${isActive ? 'active-slot' : ''}">
          <div class="slot-time-col">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${slot.time}
          </div>
          <div class="slot-activity-col">
            ${slot.activity}
            ${isActive ? '<span class="slot-active-badge">Current Slot</span>' : ''}
          </div>
          <div class="slot-location-col">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${slot.location}
          </div>
        </div>
      `;
    }).join('');
  }

  // Update relative time counter periodically
  setInterval(() => {
    if (currentServerData && currentServerData.current_status) {
      heroLastUpdatedTextEl.textContent = formatRelativeTime(currentServerData.current_status.last_updated);
    }
  }, 10000);

  // 7. Initial State Fetch
  async function fetchInitialStatus() {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderDashboard(data);
    } catch (err) {
      console.error('Error fetching initial status:', err);
    }
  }
  fetchInitialStatus();

  // 8. WebSocket (Socket.io) Initialization
  try {
    const socket = io();

    socket.on('connect', () => {
      socketStatusEl.classList.remove('disconnected');
      socketStatusTextEl.textContent = 'Live Sync Active';
    });

    socket.on('disconnect', () => {
      socketStatusEl.classList.add('disconnected');
      socketStatusTextEl.textContent = 'Offline (Reconnecting)';
    });

    socket.on('status_updated', (updatedData) => {
      console.log('⚡ Socket event received: status_updated', updatedData);
      renderDashboard(updatedData);

      // Flash micro-animation on hero status card
      heroStatusCardEl.style.transform = 'scale(1.015)';
      setTimeout(() => {
        heroStatusCardEl.style.transform = 'scale(1)';
      }, 300);
    });
  } catch (err) {
    console.error('Socket.io client error:', err);
    socketStatusEl.classList.add('disconnected');
    socketStatusTextEl.textContent = 'Sync Offline';
  }
});
