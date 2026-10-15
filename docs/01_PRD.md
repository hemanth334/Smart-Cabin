# Product Requirements Document (PRD)

## 1. Project Overview
- **Project Title:** Smart Cabin – Real-Time Faculty Availability & Predict Dashboard
- **Domain:** IoT, Smart Campus, Context-Aware Sensing, and Faculty-Student Interaction
- **Core Problem:** Students and visitors frequently waste time walking to an empty faculty cabin without knowing whether the Head of Department (HOD) is in, why they are away, or when they will return.
- **Solution:** A privacy-respecting, real-time web portal that displays the live availability status of the HOD, dynamically indicates reasons for absence using schedule context, and predicts expected return times.

## 2. Target Users & Personas
1. **Student / Visitor (Read-Only):**
   - Accesses dashboard via quick institutional sign-in (Google / Microsoft OAuth simulation).
   - Views live availability status card, context reason for absence, predicted return time, and today's schedule timeline.
   - Receives automatic live state updates via WebSockets without manual page refresh.
2. **Faculty / HOD (Administrative & Control):**
   - Authenticated access to a dedicated administrative control panel.
   - One-click status overrides (Available, With Visitors, Away, Out for Lunch, In Class).
   - Ability to type custom absence reasons and set quick estimated return times (+15m, +30m, +1h).

## 3. Core Status State Machine
The system must render one of four mutually exclusive display states:
1. **Available (Green):** In cabin, ready for student consultations.
2. **With Visitors / Busy (Amber):** In cabin, but engaged in an active meeting or visitor discussion.
3. **Away / Not in Cabin (Indigo/Blue):** Out of cabin. Displays:
   - Reason (e.g., "In Class: Block C, Room 302", "Dean Meeting").
   - Expected Return Time (e.g., "Back about 11:45 AM").
4. **Unknown (Slate Gray):** Outside working hours or stale signal (>10 minutes without update).

## 4. Non-Goals (Scope for Current Iteration)
- No physical video stream ingestion (statuses are triggered via administrative panel or local mock API).
- No external cloud databases; must run completely standalone and locally.
