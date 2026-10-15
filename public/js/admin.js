/**
 * SMART CABIN - FACULTY / HOD ADMIN DISPATCHER
 * Handles preset selections, return-time calculations, and POST dispatch to /api/status.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const adminLiveClockEl = document.getElementById('adminLiveClock');
  const adminSocketStatusEl = document.getElementById('adminSocketStatus');
  const adminSocketTextEl = document.getElementById('adminSocketText');
  const activeBroadcastBadgeEl = document.getElementById('activeBroadcastBadge');
  const activeBroadcastReasonEl = document.getElementById('activeBroadcastReason');

  // Preset Buttons
  const presetBtns = document.querySelectorAll('.preset-btn');
  const inputReasonEl = document.getElementById('inputReason');
  const inputLocationEl = document.getElementById('inputLocation');
  const inputExpectedReturnEl = document.getElementById('inputExpectedReturn');
  const timeChips = document.querySelectorAll('.chip-btn[data-minutes]');
  const chipClearBtn = document.getElementById('chipClearBtn');
  const btnBroadcastStatus = document.getElementById('btnBroadcastStatus');
  const toastBannerEl = document.getElementById('toastBanner');
  const toastMessageEl = document.getElementById('toastMessage');
  const adminSignOutBtn = document.getElementById('adminSignOutBtn');

  let selectedState = 'available';

  // 1. Live Clock
  function startLiveClock() {
    function updateClock() {
      const now = new Date();
      adminLiveClockEl.textContent = now.toLocaleTimeString('en-US', {
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

  // 2. Sign Out Helper
  if (adminSignOutBtn) {
    adminSignOutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('smart_cabin_auth');
      window.location.href = '/login.html';
    });
  }

  // 3. Preset Configuration Data
  const presetsData = {
    available: {
      state: 'available',
      reason: 'In Cabin - Consultations Open',
      location: 'Cabin 304, Block B',
      expectedReturn: ''
    },
    busy: {
      state: 'busy',
      reason: 'In Cabin - With Visitors',
      location: 'Cabin 304, Block B',
      expectedReturn: ''
    },
    presetClass: {
      state: 'away',
      reason: 'In Class: Advanced Data Science',
      location: 'Block C - Room 302',
      defaultMinutes: 60
    },
    presetLunch: {
      state: 'away',
      reason: 'Out for Lunch Break',
      location: 'Faculty Lounge',
      defaultMinutes: 45
    }
  };

  // 4. Return-Time Calculation Helper: Format Date + N minutes as "hh:mm AM/PM"
  function calculateTimeOffset(minutesToAdd) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesToAdd);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  }

  // 5. Preset Button Event Handlers
  presetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const id = btn.id;
      if (id === 'presetAvailBtn') {
        selectedState = 'available';
        inputReasonEl.value = presetsData.available.reason;
        inputLocationEl.value = presetsData.available.location;
        inputExpectedReturnEl.value = '';
        clearActiveChips();
      } else if (id === 'presetBusyBtn') {
        selectedState = 'busy';
        inputReasonEl.value = presetsData.busy.reason;
        inputLocationEl.value = presetsData.busy.location;
        inputExpectedReturnEl.value = '';
        clearActiveChips();
      } else if (id === 'presetClassBtn') {
        selectedState = 'away';
        inputReasonEl.value = presetsData.presetClass.reason;
        inputLocationEl.value = presetsData.presetClass.location;
        inputExpectedReturnEl.value = calculateTimeOffset(presetsData.presetClass.defaultMinutes);
        setActiveChipByMinutes(presetsData.presetClass.defaultMinutes);
      } else if (id === 'presetLunchBtn') {
        selectedState = 'away';
        inputReasonEl.value = presetsData.presetLunch.reason;
        inputLocationEl.value = presetsData.presetLunch.location;
        inputExpectedReturnEl.value = calculateTimeOffset(presetsData.presetLunch.defaultMinutes);
        setActiveChipByMinutes(presetsData.presetLunch.defaultMinutes);
      }
    });
  });

  // 6. Time Chips Event Handlers
  function clearActiveChips() {
    timeChips.forEach(c => c.classList.remove('active'));
  }

  function setActiveChipByMinutes(minutes) {
    clearActiveChips();
    timeChips.forEach(chip => {
      if (parseInt(chip.getAttribute('data-minutes'), 10) === minutes) {
        chip.classList.add('active');
      }
    });
  }

  timeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      clearActiveChips();
      chip.classList.add('active');
      const minutes = parseInt(chip.getAttribute('data-minutes'), 10);
      inputExpectedReturnEl.value = calculateTimeOffset(minutes);
    });
  });

  if (chipClearBtn) {
    chipClearBtn.addEventListener('click', () => {
      clearActiveChips();
      inputExpectedReturnEl.value = '';
    });
  }

  // 7. Toast Feedback Controller
  let toastTimer = null;
  function showToast(message, isError = false) {
    toastMessageEl.textContent = message;
    if (isError) {
      toastBannerEl.style.borderColor = '#ef4444';
      toastBannerEl.style.borderLeftColor = '#ef4444';
    } else {
      toastBannerEl.style.borderColor = '#10b981';
      toastBannerEl.style.borderLeftColor = '#10b981';
    }

    toastBannerEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastBannerEl.classList.remove('show');
    }, 3500);
  }

  // 8. Update Active Broadcast Preview in Dock
  function updateActivePreview(currentStatus) {
    if (!currentStatus) return;
    const state = (currentStatus.state || 'available').toUpperCase();
    activeBroadcastBadgeEl.textContent = state;
    activeBroadcastReasonEl.textContent = `(${currentStatus.activity_reason || 'No description'})`;

    const stateColors = {
      AVAILABLE: '#10b981',
      BUSY: '#f59e0b',
      AWAY: '#6366f1',
      UNKNOWN: '#64748b'
    };
    activeBroadcastBadgeEl.style.color = stateColors[state] || '#10b981';
  }

  // 9. Dispatch Status Update via POST /api/status
  async function dispatchStatusUpdate() {
    const payload = {
      state: selectedState,
      activity_reason: inputReasonEl.value.trim() || 'In Cabin',
      location: inputLocationEl.value.trim() || 'Cabin 304, Block B',
      expected_return: inputExpectedReturnEl.value.trim() || null,
      updated_by: 'hod'
    };

    btnBroadcastStatus.disabled = true;
    const originalBtnText = btnBroadcastStatus.innerHTML;
    btnBroadcastStatus.innerHTML = `<span>⏳</span> Broadcasting Status...`;

    try {
      const response = await fetch('/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const result = await response.json();
      showToast(`Status updated: ${payload.state.toUpperCase()} (${payload.activity_reason})`);
      updateActivePreview(payload);
    } catch (err) {
      console.error('Failed to broadcast status:', err);
      showToast(`Error updating status: ${err.message}`, true);
    } finally {
      btnBroadcastStatus.disabled = false;
      btnBroadcastStatus.innerHTML = originalBtnText;
    }
  }

  btnBroadcastStatus.addEventListener('click', dispatchStatusUpdate);

  // 10. Initial Status Fetch & Socket.io Connection
  async function fetchCurrentStatus() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.current_status) {
          updateActivePreview(data.current_status);
        }
      }
    } catch (e) {
      console.warn('Could not fetch initial status:', e);
    }
  }
  fetchCurrentStatus();

  // Socket sync
  try {
    const socket = io();

    socket.on('connect', () => {
      adminSocketStatusEl.classList.remove('disconnected');
      adminSocketTextEl.textContent = 'Transmitter Ready';
    });

    socket.on('disconnect', () => {
      adminSocketStatusEl.classList.add('disconnected');
      adminSocketTextEl.textContent = 'Disconnected';
    });

    socket.on('status_updated', (data) => {
      if (data && data.current_status) {
        updateActivePreview(data.current_status);
      }
    });
  } catch (err) {
    console.error('Socket setup error in admin:', err);
  }
});
