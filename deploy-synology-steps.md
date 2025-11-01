Synology deployment quick steps
==============================

This file summarizes the exact commands and checklist to run the API on a Synology NAS either with Docker (recommended) or pm2 (native Node). It also explains how to host the static `dist/` files under `/web/path8`.

Prereqs
- SSH access to NAS
- Docker (or Node + npm + pm2) installed on NAS
- Copy the repo (or `server/` and `data/`) to the NAS (e.g. `/volume1/docker/react-canvas`)

Option 1 — Docker / docker-compose (recommended)

1. Copy the repo directory to the NAS (via SCP/WinSCP or by copying a zip and extracting in DSM File Station).

2. SSH into the NAS and change to repo folder:

```powershell
ssh nasuser@192.168.1.132
cd /volume1/docker/react-canvas
```

3. Build and start the API container:

```powershell
docker-compose up -d --build api
```

4. Verify it's running and healthy:

```powershell
docker-compose ps
docker-compose logs -f api
```

5. Configure DSM Reverse Proxy (Control Panel → Application Portal → Reverse Proxy):
   - Source: Protocol HTTP, Port 80, Path /api
   - Destination: Protocol HTTP, Hostname 127.0.0.1, Port 4000, Path /

6. Place the static build in the web folder so it's available at `http://192.168.1.132/path8/`:

```powershell
# on Windows machine (example)
# npm run build
# then copy dist/* to the NAS web share, e.g. \\192.168.1.132\web\path8\
```

Option 2 — Native Node + pm2

1. SSH and copy server files to an on-NAS folder, e.g. `/volume1/web/react-canvas-api`.
2. Install dependencies and pm2:

```sh
cd /volume1/web/react-canvas-api
npm ci --production
npm i -g pm2
pm2 start ecosystem.config.js
pm2 save
```

3. Configure DSM Reverse Proxy to forward `/api` to `http://127.0.0.1:4000`.

Reverse proxy / CORS note
- The frontend is built to use `/api/ebooks` by default in production. If you run the API on the same host and route `/api/` to it, no extra CORS setup is needed.
- If the API lives on another origin, either set `VITE_API_BASE` at build time or enable CORS on the API (the server currently serves same-origin requests; you can add CORS headers if needed).

Quick checklist
- [ ] Copy repo or compiled `dist/` + `server/` + `data/` to NAS
- [ ] Choose Docker or pm2
- [ ] Start API container or pm2 process
- [ ] Add DSM Reverse Proxy forwarding `/api` → `http://127.0.0.1:4000`
- [ ] Place `dist/` contents into `/volume1/web/path8` (or `\NAS\web\path8`) and confirm `index.html` references `/path8/` assets

If you'd like, I can also generate a small `nginx.conf` snippet or provide a ready-made one for the `docker-compose` proxy service.