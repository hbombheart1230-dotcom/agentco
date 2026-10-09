$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$counts = @{ PASS = 0; WARN = 0; FAIL = 0 }
function Report($level, $message) {
    $counts[$level]++
    Write-Host "${level}: $message"
}
Report PASS "Repository root: $repoRoot"
foreach ($command in @('git', 'node', 'npm.cmd')) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        $versionText = & $command --version
        if ($LASTEXITCODE -eq 0) { Report PASS "$command available ($versionText)" } else { Report FAIL "$command version check failed" }
    } else { Report FAIL "$command missing" }
}
if (Get-Command node -ErrorAction SilentlyContinue) {
    try {
        $nodeVersion = [version]((& node --version).Trim().TrimStart('v').Split('-')[0])
        if ($nodeVersion -ge [version]'22.19.0') { Report PASS 'Node compatible (>=22.19.0)' } else { Report FAIL 'Node >=22.19.0 required' }
    } catch { Report FAIL 'Cannot determine Node compatibility' }
}
if (Get-Command npm.cmd -ErrorAction SilentlyContinue) {
    try {
        $npmVersion = [version]((& npm.cmd --version).Trim())
        if ($npmVersion.Major -ge 7) { Report PASS 'npm compatible (>=7)' } else { Report FAIL 'npm >=7 required' }
    } catch { Report FAIL 'Cannot determine npm compatibility' }
}
if (Test-Path -LiteralPath (Join-Path $repoRoot '.env')) { Report PASS '.env present (values not inspected)' } else { Report WARN '.env absent; create from .env.example locally' }
try {
    $manifest = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'package.json') | ConvertFrom-Json
    $expected = $manifest.dependencies.'@earendil-works/pi-coding-agent'
    $installed = Get-Content -Raw -LiteralPath (Join-Path $repoRoot 'node_modules/@earendil-works/pi-coding-agent/package.json') | ConvertFrom-Json
    if ($expected -eq '1.0.4' -and $installed.version -eq $expected) { Report PASS "Pi exact version $expected" } else { Report FAIL "Pi version mismatch (expected $expected, installed $($installed.version))" }
    Push-Location -LiteralPath $repoRoot
    try {
        & npm.cmd ls --omit=dev --depth=0
        if ($LASTEXITCODE -eq 0) { Report PASS 'npm dependencies valid' } else { Report FAIL 'npm dependency tree invalid' }
    } finally { Pop-Location }
} catch { Report FAIL 'Pi/npm dependencies unavailable' }
Report PASS "Agentco PI_CODING_AGENT_DIR target: $(Join-Path $repoRoot 'pi-dev') (launcher overrides external value)"
foreach ($packageSpec in @(@('@ian-pascoe/pi-lsp','0.8.0'), @('@tmustier/pi-skill-creator','0.3.4'))) {
    try {
        $packageManifest = Get-Content -Raw -LiteralPath (Join-Path $repoRoot "pi-dev/npm/node_modules/$($packageSpec[0])/package.json") | ConvertFrom-Json
        if ($packageManifest.version -eq $packageSpec[1]) { Report PASS "Pi managed package: $($packageSpec[0])@$($packageSpec[1])" } else { Report FAIL "Pi managed package version mismatch: $($packageSpec[0])" }
    } catch { Report FAIL "Pi managed package missing: $($packageSpec[0]); run bootstrap.ps1" }
}
foreach ($relativePath in @('pi-dev/settings.json','pi-dev/mcp.json','pi-dev/AGENTS.md','pi-dev/extensions/permission-gate.ts','pi-dev/extensions/protected-paths.ts','pi-dev/extensions/git-checkpoint.ts','pi-dev/agents/scout.md','pi-dev/agents/planner.md','pi-dev/agents/worker.md','pi-dev/agents/reviewer.md','pi-dev/prompts/implement.md','pi-dev/prompts/implement-and-review.md','pi-dev/prompts/scout-and-plan.md')) {
    if (Test-Path -LiteralPath (Join-Path $repoRoot $relativePath)) { Report PASS "Config present: $relativePath" } else { Report FAIL "Config missing: $relativePath" }
}
if ((Get-Command pyright-langserver -ErrorAction SilentlyContinue) -and (Get-Command pyright.cmd -ErrorAction SilentlyContinue)) {
    & pyright.cmd --version
    if ($LASTEXITCODE -eq 0) { Report PASS 'pyright available' } else { Report FAIL 'pyright check failed' }
} else { Report FAIL 'pyright missing; bootstrap.ps1 -InstallPyright' }
$edgeFound = $false
foreach ($basePath in @(${env:ProgramFiles}, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA)) {
    if ($basePath -and (Test-Path -LiteralPath (Join-Path $basePath 'Microsoft/Edge/Application/msedge.exe'))) { $edgeFound = $true }
}
if ($edgeFound -or (Get-Command msedge -ErrorAction SilentlyContinue)) { Report PASS 'Edge available for configured msedge MCP' } else { Report WARN 'Install Microsoft Edge for browser MCP (--browser msedge)' }
if (Test-Path -LiteralPath (Join-Path $repoRoot 'scripts/smoke.mjs')) { Report PASS 'Smoke command: node scripts/smoke.mjs' } else { Report FAIL 'Smoke script missing' }
Write-Host "SUMMARY: PASS=$($counts.PASS) WARN=$($counts.WARN) FAIL=$($counts.FAIL)"
if ($counts.FAIL -gt 0) { exit 1 }
exit 0
