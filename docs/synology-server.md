Running the Node API on Synology (pm2 or Docker)

This document shows two simple ways to run the Node API (`server/index.cjs`) on a Synology NAS so the API is available at the NAS host and the static site can be served from the same host.

Prerequisites
- SSH access to your Synology (Control Panel → Terminal & SNMP → Enable SSH)
- Node.js available on the NAS (some Synology models provide Node via Package Center or you can use a Docker container)
- If using MySQL, ensure the DB is reachable from the NAS and env vars are set appropriately.

Option A — Run with pm2 (Node must be installed on the NAS)
1. SSH into the NAS:

    ssh nasuser@192.168.1.132

2. Install Node/npm or use the Synology Node package (varies by model). Then install pm2 globally:

    npm i -g pm2

3. Copy your server files (at least `server/` and `data/ebooks` if you use filesystem fallback) to a folder on the NAS, e.g. `/volume1/web/react-canvas-api`.

4. From that folder, install dependencies and start with pm2:

    npm ci
    pm2 start server/index.cjs --name react-canvas-api --update-env -- 

   Provide any environment overrides, for example:

    DB_HOST=localhost DB_USER=root DB_PASSWORD=secret DB_NAME=itEBooks_db pm2 start server/index.cjs --name react-canvas-api --update-env --

5. Save pm2 process list so it restarts on reboot (pm2 startup instructions vary):

    pm2 save
    pm2 startup

6. The API should now be accessible on port 4000 by default. If you want to expose it on port 80/443, configure Synology reverse proxy (Control Panel → Application Portal → Reverse Proxy) to forward `/api` to `http://127.0.0.1:4000`.

Option B — Run inside Docker
1. On NAS enable Docker (Package Center) and create a folder to contain the app, e.g. `/volume1/docker/react-canvas`.

2. Create a simple Dockerfile in that folder (or use an existing Node image):

    FROM node:20-alpine
    WORKDIR /app
    COPY server/ ./server
    COPY package.json package-lock.json ./
    RUN npm ci --only=production
    EXPOSE 4000
    CMD ["node","server/index.cjs"]

3. Build and run the image on the NAS (or use Docker Compose):

    docker build -t react-canvas-api .
    docker run -d --name react-canvas-api -p 4000:4000 -v /volume1/docker/react-canvas/data:/app/data react-canvas-api

4. Configure Synology Reverse Proxy to route `/api` requests to `http://127.0.0.1:4000`.

Reverse proxy example (forward /api to node service):
- Source: Protocol HTTP, Hostname: (leave blank or set your NAS hostname), Port: 80, Path: /api
- Destination: Protocol HTTP, Hostname: 127.0.0.1, Port: 4000, Path: /

Notes and troubleshooting
- If the app needs to serve both frontend and API from the same host, copy the `dist/` contents into the NAS web folder (e.g., `/var/services/web/path8`) and use the reverse proxy to forward `/api` to the Node process.
- On some Synology models, the Node package is outdated; using Docker is often simpler and more reproducible.
- Ensure file permissions on `data/ebooks` permit the Node process (user `root` or the Docker container user) to read PDF files.

If you want, I can generate a sample `docker-compose.yml` for you and a `pm2` start script with recommended env vars.

---

Additional sample artifacts provided with this repository

- `docker-compose.yml` (root): builds the API service from `./server` and exposes port 4000. It mounts `./data` into the container so your `data/ebooks` remain available to the API.
- `server/Dockerfile`: a minimal production Dockerfile that installs production deps and runs `index.cjs`.
- `server/ecosystem.config.js`: pm2 ecosystem file so you can `pm2 start ecosystem.config.js` if you prefer pm2.

Quick docker-compose usage (from the repo root on the NAS):

```sh
# build and start the API container in background
docker-compose up -d --build api

# show logs
docker-compose logs -f api

# stop and remove
docker-compose down
```

If you want the API to be reachable at `http://192.168.1.132/api/` while the static app is in `/web/path8`, add a reverse proxy rule in DSM (Control Panel → Application Portal → Reverse Proxy) that forwards `/api` to `http://127.0.0.1:4000`.

If you prefer nginx running in Docker as a front-proxy (instead of the DSM reverse proxy), uncomment and configure the `proxy` service in the repository `docker-compose.yml` and provide a suitable `nginx.conf` that proxies `/api` to `http://api:4000`.

Environment and CORS notes

- The frontend production build defaults to calling `/api/ebooks` (empty API base). That works when the API is on the same host and available under `/api/`. If your API runs on a different origin (different host or port), either:
    - Configure a reverse proxy so the API is reachable under the same origin (recommended), or
    - Change the frontend to use an explicit API base by setting the `VITE_API_BASE` env var at build time.

Example build with explicit API base:

```sh
# set API base to the NAS host, then build
set "VITE_API_BASE=http://192.168.1.132:4000"; npm run build
```

That will produce a build that uses `http://192.168.1.132:4000` for API calls.
