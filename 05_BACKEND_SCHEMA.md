# Backend Schema Document

## 1. Data Store Format: `data/data.json`

```json
{
  "faculty": {
    "name": "Dr. Supervisor Name",
    "designation": "Head of Department, DS & CS",
    "department": "Department of Data Science and Computing Systems",
    "cabin": "Cabin 304, Block B",
    "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=HOD"
  },
  "current_status": {
    "state": "available",
    "activity_reason": "In Cabin - Consultations Open",
    "location": "Cabin 304, Block B",
    "expected_return": null,
    "last_updated": "2026-10-15T16:55:00Z",
    "updated_by": "hod"
  },
  "timetable_today": [
    { "time": "09:00 - 10:00", "activity": "Cabin Hours", "location": "Cabin 304" },
    { "time": "10:00 - 11:30", "activity": "Lecture: Advanced Data Science", "location": "Block C - Room 302" },
    { "time": "11:30 - 13:00", "activity": "Open Consultations", "location": "Cabin 304" },
    { "time": "13:00 - 14:00", "activity": "Lunch Break", "location": "Faculty Lounge" },
    { "time": "14:00 - 16:00", "activity": "Data Science Lab Review", "location": "AI Computing Lab" }
  ]
}
```

## 2. API Contract Specification

### `GET /api/status`
- **Description:** Returns the active cabin status, faculty profile, and daily timetable.
- **Method:** GET
- **Response Code:** `200 OK`
- **Response Format:** Full JSON object matching `data/data.json`.

### `POST /api/status`
- **Description:** Updates the cabin status and broadcasts changes across open WebSockets.
- **Method:** POST
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "state": "away",
  "activity_reason": "In Class: Advanced Data Science",
  "location": "Block C - Room 302",
  "expected_return": "11:30 AM"
}
```
- **Response Code:** `200 OK`
- **Side Effect:** Dispatches WebSocket event `status_updated` with the updated payload.

### `GET /api/timetable`
- **Description:** Returns the timetable schedule array for the current day.
