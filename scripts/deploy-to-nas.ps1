# Deploy built dist/ to Synology NAS web/path8
# Usage: run this script from project root in an elevated PowerShell session if required.
# It will prompt for NAS credentials and map a temporary drive.

param(
    [string]$NasHost = '192.168.1.132',
    [string]$WebShare = 'web',
    [string]$TargetFolder = 'path8',
    [string]$LocalDist = "$PSScriptRoot\..\dist"
)

# Choose an available drive letter (Z downwards)
$driveLetters = 'Z','Y','X','W','V','U'
$mapped = $null
foreach ($d in $driveLetters) {
    if (-not (Test-Path "${d}:") ) { $mapped = $d; break }
}
if (-not $mapped) { Write-Error "No free drive letters available (tried $($driveLetters -join ','))."; exit 1 }

$escapedRoot = "\\$NasHost\$WebShare"
Write-Host "Will map $escapedRoot to drive ${mapped}:" -ForegroundColor Cyan
$creds = Get-Credential -Message "Enter credentials for NAS (username format may be 'admin' or 'NASDomain\\user')"

# Map the network drive
Try {
    New-PSDrive -Name $mapped -PSProvider FileSystem -Root "\\$NasHost\$WebShare" -Credential $creds -ErrorAction Stop | Out-Null
} Catch {
    Write-Error "Failed to map network drive: $($_.Exception.Message)"
    exit 1
}

$dest = "${mapped}:\\$TargetFolder"
# Create target folder if missing
if (-not (Test-Path $dest)) {
    Write-Host "Creating $dest" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
}

# Copy files
Write-Host "Copying files from $LocalDist to $dest" -ForegroundColor Cyan
Try {
    Copy-Item -Path "$LocalDist\*" -Destination $dest -Recurse -Force -ErrorAction Stop
} Catch {
    Write-Error "Copy failed: $($_.Exception.Message)"
    # Clean up map
    Remove-PSDrive -Name $mapped -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "Files copied successfully." -ForegroundColor Green

# Unmap drive
Remove-PSDrive -Name $mapped -Force -ErrorAction SilentlyContinue
Write-Host "Disconnected ${mapped}:" -ForegroundColor Gray

# End
