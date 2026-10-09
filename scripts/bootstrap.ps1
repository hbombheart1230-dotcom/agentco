param([switch]$InstallPyright)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

try {
    foreach ($command in @('git', 'node', 'npm.cmd')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "Required prerequisite missing: $command" }
    }
    # Compare numeric components without depending on an npm package.
    $nodeVersion = [version]((& node --version).Trim().TrimStart('v').Split('-')[0])
    if ($LASTEXITCODE -ne 0 -or $nodeVersion -lt [version]'22.19.0') { throw 'Node >=22.19.0 is required.' }
    $npmVersion = [version]((& npm.cmd --version).Trim())
    if ($LASTEXITCODE -ne 0 -or $npmVersion.Major -lt 7) { throw 'npm >=7 is required for lockfile installation.' }
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'package-lock.json'))) { throw 'package-lock.json is required for npm ci.' }
    if (-not (Get-Command pyright-langserver -ErrorAction SilentlyContinue) -or -not (Get-Command pyright.cmd -ErrorAction SilentlyContinue)) {
        if (-not $InstallPyright) { throw 'pyright-langserver missing. Install pyright with npm install -g pyright, or rerun with -InstallPyright.' }
        & npm.cmd install -g pyright
        if ($LASTEXITCODE -ne 0) { throw 'pyright installation failed.' }
    }
    if (-not (Get-Command pyright-langserver -ErrorAction SilentlyContinue)) { throw 'pyright-langserver still unavailable on PATH after installation.' }
    & pyright.cmd --version
    if ($LASTEXITCODE -ne 0) { throw 'pyright prerequisite check failed.' }
    Push-Location -LiteralPath $repoRoot
    try {
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
        $settings = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'pi-dev/settings.json') | ConvertFrom-Json
        foreach ($packageSource in $settings.packages) {
            & node scripts/pi.mjs install $packageSource
            if ($LASTEXITCODE -ne 0) { throw "Pi package restore failed: $packageSource" }
        }
        & node scripts/pi.mjs --version
        if ($LASTEXITCODE -ne 0) { throw 'Pi launcher check failed.' }
    } finally { Pop-Location }
    if (-not (Test-Path -LiteralPath (Join-Path $repoRoot '.env'))) {
        Write-Host 'WARN: .env is absent. Create it from .env.example, then fill provider keys locally. Existing .env is never overwritten.'
    }
    Write-Host 'PASS: pinned Pi baseline restored. Edge is required for browser MCP; run scripts/doctor.ps1 and node scripts/smoke.mjs.'
    exit 0
} catch {
    Write-Host "FAIL: $($_.Exception.Message)"
    exit 1
}
