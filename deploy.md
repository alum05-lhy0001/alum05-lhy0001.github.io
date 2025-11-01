Deploying react-canvas to Synology NAS (192.168.1.132)

This document shows quick, safe steps to build and deploy the app to a Synology NAS web share so the app is available at http://192.168.1.132/path8/.

Notes before you begin
- This repository is configured with Vite base `/path8/`. The app uses HashRouter so server rewrites are not required.
- The NAS web root commonly lives at `/var/services/web/` and is exposed via the shared folder `web` in DSM.
- You will need a DSM user account with write permissions to the `web` shared folder.

1) Build locally

Open PowerShell in the project root and run:

```powershell
npm run build
```

This produces the `dist/` folder containing `index.html` and `assets/`.

2) Option A — Copy via SMB (Windows file share)

This is convenient from Windows but depends on SMB being enabled on the NAS and your account having share permissions.

Map a temporary drive and copy (prompts for password):

```powershell
# Map the web share to drive letter Y:
net use Y: \\\192.168.1.132\web /user:YOUR_NAS_USER /persistent:no

# Create target folder under web if missing
New-Item -Path "Y:\path8" -ItemType Directory -Force

# Copy build output to the NAS
Copy-Item -Path ".\dist\*" -Destination "Y:\path8" -Recurse -Force

# Unmap after copy finishes
net use Y: /delete
```

Troubleshooting SMB mapping:
- If `net use` fails with 'user name or password is incorrect', try alternate username formats:
  - `YOURUSER`
  - `NASNAME\YOURUSER` (replace NASNAME with your Synology hostname)
  - `YOURDOMAIN\\YOURUSER` (if applicable)
- If `net view \\\192.168.1.132` returns Access Denied, check DSM: Control Panel → File Services → SMB is enabled, and the `web` shared folder permissions allow your user.
- If you hit "System error 85 The local device name is already in use" pick a different letter (e.g., R: or S:).

3) Option B — Upload via SFTP (recommended if SMB is problematic)

SFTP (SSH) is often simpler and more reliable. Enable SSH in DSM first: Control Panel → Terminal & SNMP → Enable SSH.

Use WinSCP (GUI):
- Host name: 192.168.1.132
- Port: 22
- File protocol: SFTP
- Username: YOUR_NAS_USER
- Password: (your DSM password)

Then navigate in WinSCP to `/var/services/web/` and create `path8` if it doesn't exist. Drag the contents of your local `dist/` into the `path8` folder.

Or use scp from PowerShell (OpenSSH client required):

```powershell
scp -r .\dist\* YOUR_NAS_USER@192.168.1.132:/var/services/web/path8/
```

4) Verify
- Open a browser and visit: http://192.168.1.132/path8/
- HashRouter uses URLs like: http://192.168.1.132/path8/#/courses

5) Troubleshooting checklist
- If assets 404: ensure `index.html` and `assets/` are directly under `/var/services/web/path8/` (not `/path8/dist/...`).
- If direct-route (non-hash) 404s occur: either switch to HashRouter (already done here) or add server rewrite rules to serve `index.html` for unknown paths.
- Permissions: confirm `web` shared folder permissions in DSM for your user (read/write).
- Auto Block / Firewall: check DSM Security settings to ensure your local IP isn't blocked.

6) Automating deploy locally (optional)
- `package.json` has a `deploy` script that builds and runs a PowerShell deploy script (prompts for credentials):

```powershell
npm run deploy
```

This calls `./scripts/deploy-to-nas.ps1` which maps a temporary drive, copies `dist/`, then unmaps.

7) If you want server rewrites instead (Apache/nginx on Synology)
- Let me know and I will provide the small rewrite snippet for `index.html` fallback in nginx or Apache.

---
If you want, I can also add a brief `deploy-windows.md` with screenshots for mapping and WinSCP, or update the `README.md` with an entry linking to this `deploy.md`.