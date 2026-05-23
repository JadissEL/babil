# Drain intelligence queue until pending=0 or max rounds reached.
param([int]$MaxRounds = 20, [int]$MaxJobs = 25)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
for ($i = 1; $i -le $MaxRounds; $i++) {
  Write-Host "=== Drain round $i / $MaxRounds ==="
  npm run intelligence:worker-loop -- --max-jobs $MaxJobs --sleep-ms 2000
  if ($LASTEXITCODE -ne 0) { Write-Warning "worker-loop exit $LASTEXITCODE" }
  npm run intelligence:status 2>&1 | Select-String -Pattern '"pending"'
  $status = npm run intelligence:status 2>&1
  if ($status -match '"pending":\s*0') {
    Write-Host "Queue empty after round $i"
    exit 0
  }
}
Write-Host "Max rounds reached; check intelligence:status"
exit 1
