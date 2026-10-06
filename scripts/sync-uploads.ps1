[CmdletBinding()]
param (
    [switch]$DryRun
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = (Get-Item "$PSScriptRoot\..").FullName
$SourcePath  = Join-Path $ProjectRoot "public\uploads"
$DestBucket  = "parspack:c479629/uploads"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Cineflow S3 Storage Synchronizer (Parspack)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " [•] Source Path : $SourcePath" -ForegroundColor Gray
Write-Host " [•] Target S3   : $DestBucket" -ForegroundColor Gray
Write-Host "========================================================`n" -ForegroundColor Cyan

if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: 'rclone' command not found in your PATH." -ForegroundColor Red
    Write-Host "Please install rclone or add its binary to Environment Variables." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $SourcePath)) {
    Write-Host "⚠️ Source directory does not exist: $SourcePath" -ForegroundColor Yellow
    Write-Host "Creating empty uploads directory..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $SourcePath -Force | Out-Null
}

$rcloneArgs = @(
    "copy",
    $SourcePath,
    $DestBucket,
    "--transfers=2",
    "--checkers=4",
    "--tpslimit=4",
    "--tpslimit-burst=1",
    "--retries=20",
    "--low-level-retries=10",
    "--retries-sleep=3s",
    "--fast-list",
    "--header", "Cache-Control: public, max-age=31536000, immutable",
    "--progress"
)

if ($DryRun) {
    $rcloneArgs += "--dry-run"
    Write-Host "🔍 Running in DRY-RUN mode (No files will be uploaded)...`n" -ForegroundColor Magenta
}

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

& rclone @rcloneArgs

$stopwatch.Stop()
$elapsed = [math]::Round($stopwatch.Elapsed.TotalSeconds, 2)

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " ✅ Sync completed successfully in $elapsed seconds!" -ForegroundColor Green
    Write-Host "========================================================`n" -ForegroundColor Green
} else {
    Write-Host "`n========================================================" -ForegroundColor Red
    Write-Host " ❌ Sync failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host " Check network connection or bucket credentials." -ForegroundColor Yellow
    Write-Host "========================================================`n" -ForegroundColor Red
    exit $LASTEXITCODE
}
