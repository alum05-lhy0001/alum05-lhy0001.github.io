# Project file tree — react-canvas

Note: `node_modules/` is collapsed to keep the tree readable. If you want the full `node_modules` expansion I can produce it separately.

```
react-canvas/
├─ .gitignore
├─ index.html
├─ package.json
├─ README.md
├─ vite.config.js
├─ canvas-summary.html
├─ public/
│  └─ vite.svg
├─ node_modules/  (collapsed)
└─ src/
   ├─ App.jsx
   ├─ App.css
   ├─ index.css
   ├─ main.jsx
   ├─ assets/
   │  └─ react.svg
   └─ components/
      ├─ Account.jsx
      ├─ Calendar.jsx
      ├─ Courses.jsx
      ├─ Dashboard.jsx
      ├─ Files.jsx
      ├─ History.jsx
      ├─ Inbox.jsx
      ├─ Login.jsx
      └─ PlannerEmptyState.jsx
```

## Brief descriptions
- `App.jsx` — uses `react-router-dom` and provides top navigation to the basic components.
- `components/` — simple placeholder components for Login, Account, Dashboard, Courses, Files, Calendar, Inbox, History, and Planner empty-state.
- `canvas-summary.html` — a small HTML summary with a "Download as PDF" button.

You can paste this into a README or the repo root for easy browsing.
