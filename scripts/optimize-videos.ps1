# Video Compression Script for Corridor Website (PowerShell)
# This script compresses videos using FFmpeg to reduce file size

Write-Host "Starting video optimization..." -ForegroundColor Cyan

# Check if FFmpeg is installed
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegPath) {
    Write-Host "ERROR: FFmpeg is not installed. Please install FFmpeg first:" -ForegroundColor Red
    Write-Host "   Windows: Download from https://ffmpeg.org/download.html" -ForegroundColor Yellow
    Write-Host "   Or use: winget install ffmpeg" -ForegroundColor Yellow
    exit 1
}

# Create backup directory
$backupDir = "public\backup"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}
Write-Host "Creating backups..." -ForegroundColor Cyan

# Function to compress video
function Compress-Video {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Quality = 28  # Default CRF 28 (good balance)
    )
    
    if (-not (Test-Path $InputPath)) {
        Write-Host "WARNING: File not found: $InputPath" -ForegroundColor Yellow
        return
    }
    
    # Get original size
    $originalFile = Get-Item $InputPath
    $originalSizeMB = [math]::Round($originalFile.Length / 1MB, 2)
    
    Write-Host "Compressing: $($originalFile.Name)" -ForegroundColor Cyan
    Write-Host "   Original size: $originalSizeMB MB" -ForegroundColor Gray
    
    # Backup original
    Copy-Item $InputPath "$backupDir\$($originalFile.Name)"
    
    # Compress video
    # -crf: Quality (18-28, lower = better quality but larger file)
    # -preset: Encoding speed (ultrafast, fast, medium, slow, veryslow)
    # -movflags +faststart: Enables fast streaming
    $ffmpegArgs = @(
        "-i", "`"$InputPath`"",
        "-c:v", "libx264",
        "-crf", $Quality.ToString(),
        "-preset", "medium",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        "-y",
        "`"$OutputPath`""
    )
    
    Write-Host "   Running FFmpeg (this may take a while)..." -ForegroundColor Gray
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -NoNewWindow -Wait -PassThru
    
    if (Test-Path $OutputPath) {
        $newFile = Get-Item $OutputPath
        $newSizeMB = [math]::Round($newFile.Length / 1MB, 2)
        $reduction = [math]::Round((1 - ($newFile.Length / $originalFile.Length)) * 100, 1)
        
        Write-Host "   SUCCESS: New size: $newSizeMB MB ($reduction% reduction)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "   ERROR: Compression failed!" -ForegroundColor Red
        Write-Host ""
    }
}

# Compress videos
Write-Host "Compressing VideoGuillaume.mp4..." -ForegroundColor Cyan
Compress-Video -InputPath "public\VideoGuillaume.mp4" -OutputPath "public\VideoGuillaume-compressed.mp4" -Quality 28

Write-Host "Compressing corridorGif.mp4..." -ForegroundColor Cyan
Compress-Video -InputPath "public\corridorGif.mp4" -OutputPath "public\corridorGif-compressed.mp4" -Quality 28

Write-Host "Compressing AnimatieFlyer.mp4..." -ForegroundColor Cyan
Compress-Video -InputPath "public\AnimatieFlyer.mp4" -OutputPath "public\AnimatieFlyer-compressed.mp4" -Quality 28

Write-Host ""
Write-Host "Video optimization complete!" -ForegroundColor Green
Write-Host "Review the compressed files and replace originals if satisfied." -ForegroundColor Yellow
Write-Host "Backups saved in: $backupDir" -ForegroundColor Cyan
