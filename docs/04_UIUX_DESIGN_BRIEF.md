# UI/UX Design Brief

## 1. Visual Aesthetics & Design System
- **Theme:** Clean modern academic/tech dashboard (Inter, Segoe UI, or system sans-serif).
- **Backgrounds:** Clean slate canvas (`#0f172a` for dark mode or `#f8fafc` for light mode).
- **Card Styling:** White or deep-slate containers with subtle borders (`border: 1px solid #e2e8f0` or `#334155`) and smooth rounded corners (`border-radius: 12px`).

## 2. Status Color Palette & Visual States
- **Available State:**
  - Background Tint: `#ecfdf5`
  - Border: `#a7f3d0`
  - Accent / Text: `#059669` (Emerald)
  - Live Dot: Green glowing dot with CSS `@keyframes pulse`.
- **With Visitors / Busy State:**
  - Background Tint: `#fffbeb`
  - Border: `#fde68a`
  - Accent / Text: `#d97706` (Amber)
- **Away State:**
  - Background Tint: `#eef2ff`
  - Border: `#c7d2fe`
  - Accent / Text: `#4f46e5` (Indigo)
- **Unknown State:**
  - Background Tint: `#f1f5f9`
  - Border: `#cbd5e1`
  - Accent / Text: `#64748b` (Slate)

## 3. Core Component Layout
1. **Top Navbar:** Department branding ("Department of Data Science & Computing Systems - Smart Cabin") and a live digital clock.
2. **Faculty Profile Card:** Avatar photo, Dr. Supervisor Name, Title ("Head of Department"), and Cabin location ("Cabin 304, Block B").
3. **Hero Availability Banner:** Large status pill badge with bold typography.
4. **Predict & Absence Panel:** Displayed when the status is set to "Away", showing "Current Location/Activity" and a highlighted "Expected Return Time".
5. **Schedule Timeline:** Table listing the day's scheduled lecture slots with active hour indicators.
