# Image to WebP Conversion Script for Corridor Website
# Converts PNG and JPG images to WebP format for better compression

Write-Host "Starting image optimization (WebP conversion)..." -ForegroundColor Cyan

# Check if ImageMagick or cwebp is available
$hasImageMagick = Get-Command magick -ErrorAction SilentlyContinue
$hasCwebp = Get-Command cwebp -ErrorAction SilentlyContinue

if (-not $hasImageMagick -and -not $hasCwebp) {
    Write-Host "ERROR: No image conversion tool found!" -ForegroundColor Red
    Write-Host "   Please install one of the following:" -ForegroundColor Yellow
    Write-Host "   1. ImageMagick: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
    Write-Host "   2. WebP tools: https://developers.google.com/speed/webp/download" -ForegroundColor Yellow
    Write-Host "   Or use online tools like: https://squoosh.app/" -ForegroundColor Yellow
    exit 1
}

# Create backup directory
$backupDir = "public\backup"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Function to convert image to WebP using ImageMagick
function Convert-ToWebP-ImageMagick {
    param(
        [string]$InputPath,
        [int]$Quality = 85
    )
    
    $inputFile = Get-Item $InputPath
    $outputPath = $InputPath -replace '\.(png|jpg|jpeg)$', '.webp'
    
    Write-Host "Converting: $($inputFile.Name)" -ForegroundColor Cyan
    
    $originalSizeMB = [math]::Round($inputFile.Length / 1MB, 2)
    Write-Host "   Original size: $originalSizeMB MB" -ForegroundColor Gray
    
    # Backup original (only if not already backed up)
    if (-not (Test-Path "$backupDir\$($inputFile.Name)")) {
        Copy-Item $InputPath "$backupDir\$($inputFile.Name)"
    }
    
    # Convert to WebP
    magick "$InputPath" -quality $Quality "$outputPath"
    
    if (Test-Path $outputPath) {
        $newFile = Get-Item $outputPath
        $newSizeMB = [math]::Round($newFile.Length / 1MB, 2)
        $reduction = [math]::Round((1 - ($newFile.Length / $inputFile.Length)) * 100, 1)
        
        Write-Host "   SUCCESS: WebP size: $newSizeMB MB ($reduction% reduction)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "   ERROR: Conversion failed!" -ForegroundColor Red
        Write-Host ""
    }
}

# Function to convert image to WebP using cwebp
function Convert-ToWebP-Cwebp {
    param(
        [string]$InputPath,
        [int]$Quality = 85
    )
    
    $inputFile = Get-Item $InputPath
    $outputPath = $InputPath -replace '\.(png|jpg|jpeg)$', '.webp'
    
    Write-Host "Converting: $($inputFile.Name)" -ForegroundColor Cyan
    
    $originalSizeMB = [math]::Round($inputFile.Length / 1MB, 2)
    Write-Host "   Original size: $originalSizeMB MB" -ForegroundColor Gray
    
    # Backup original
    if (-not (Test-Path "$backupDir\$($inputFile.Name)")) {
        Copy-Item $InputPath "$backupDir\$($inputFile.Name)"
    }
    
    # Convert to WebP
    cwebp -q $Quality "$InputPath" -o "$outputPath"
    
    if (Test-Path $outputPath) {
        $newFile = Get-Item $outputPath
        $newSizeMB = [math]::Round($newFile.Length / 1MB, 2)
        $reduction = [math]::Round((1 - ($newFile.Length / $inputFile.Length)) * 100, 1)
        
        Write-Host "   SUCCESS: WebP size: $newSizeMB MB ($reduction% reduction)" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "   ERROR: Conversion failed!" -ForegroundColor Red
        Write-Host ""
    }
}

# Get all PNG and JPG files
$imageFiles = Get-ChildItem -Path "public" -File | Where-Object {$_.Extension -match '\.(png|jpg|jpeg)$'}

if ($imageFiles.Count -eq 0) {
    Write-Host "WARNING: No PNG or JPG images found in public folder" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($imageFiles.Count) images to convert" -ForegroundColor Cyan
Write-Host ""

# Convert images
foreach ($image in $imageFiles) {
    if ($hasImageMagick) {
        Convert-ToWebP-ImageMagick -InputPath $image.FullName -Quality 85
    } elseif ($hasCwebp) {
        Convert-ToWebP-Cwebp -InputPath $image.FullName -Quality 85
    }
}

Write-Host ""
Write-Host "Image optimization complete!" -ForegroundColor Green
Write-Host "WebP files created. HTML will use them automatically with PNG/JPG fallback." -ForegroundColor Yellow
Write-Host "Backups saved in: $backupDir" -ForegroundColor Cyan
