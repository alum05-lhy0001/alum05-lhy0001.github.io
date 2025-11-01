# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## NewCanvas - Canvas-like components

I added basic placeholder React components under `src/components` to mirror common Canvas/learning platform pages:

- `Login.jsx` - simple login placeholder
- `Account.jsx` - account/profile placeholder
- `Dashboard.jsx` - main dashboard placeholder
- `Courses.jsx` - list of courses placeholder
- `Files.jsx` - files/resources placeholder
- `Calendar.jsx` - calendar placeholder
- `Inbox.jsx` - messages placeholder
- `History.jsx` - activity history placeholder
- `PlannerEmptyState.jsx` - empty planner UI placeholder (replicates the provided structure)

Routing is enabled via `react-router-dom` in `src/App.jsx`. Start the dev server with:

```bash
npm install
npm run dev
```

You can navigate to the new routes at `/`, `/courses`, `/files`, `/calendar`, `/inbox`, `/history`, `/account`, `/login`, and `/planner-empty`.

## Ebooks server (MySQL) — dev instructions

I added a small Express server at `server/index.cjs` that exposes two endpoints:

- `GET /api/ebooks` — lists ebook ids and titles
- `GET /api/ebooks/:id/download` — streams the PDF blob back as a download

How to load PDFs into MySQL (example SQL you provided):

```sql
USE itEBooks_db;

INSERT INTO ebooks (title, pdf_data)
VALUES
('User Group Leadership', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\User_Group_Leadership.pdf')),
('Get Fit with Apple Watch', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Get_Fit_with_Apple_Watch.pdf')),
('Thinking Ahead', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Thinking_Ahead.pdf')),
('Effective JavaScript', LOAD_FILE('C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Effective_JavaScript.pdf'));
```

Start the server (dev):

```powershell
npm run start:server
```

By default the server assumes a MySQL connection on localhost with database `itEBooks_db`. Use env vars to override: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`.

## Deploy

See `deploy.md` for step-by-step deployment instructions to a Synology NAS (SMB/WinSCP/SCP) and troubleshooting tips. The project includes a PowerShell deploy helper at `scripts/deploy-to-nas.ps1` and an npm script:

```powershell
npm run deploy
```

This script runs a production build and then prompts for NAS credentials to copy the `dist/` folder to your NAS web share.

