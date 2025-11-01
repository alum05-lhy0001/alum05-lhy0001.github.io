<#
One-click Windows deploy: builds the app and runs the interactive deploy script.
Usage: run from project root
    .\scripts\deploy-windows.ps1
#>

param(
    [switch]$Yes
)

# Confirm
if (-not $Yes) {
    $resp = Read-Host "This will run 'npm run build' and then copy files to your NAS using the interactive deploy script. Continue? (y/N)"
    if ($resp -notin @('y','Y','yes','Yes')) { Write-Host "Cancelled"; exit 0 }
}

# Run build
Write-Host "Running npm run build..."
$build = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npm run build" -NoNewWindow -Wait -PassThru
if ($build.ExitCode -ne 0) { Write-Error "Build failed (exit $($build.ExitCode)). Aborting."; exit $build.ExitCode }

# Run the interactive deploy script (prompts for credentials)
Write-Host "Running interactive deploy script..."
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\deploy-to-nas.ps1

Write-Host "Deploy script finished. Check output above for any errors."