#!/bin/bash
# Video Compression Script for Corridor Website
# This script compresses videos using FFmpeg to reduce file size

echo "🎬 Starting video optimization..."

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    echo "   macOS: brew install ffmpeg"
    echo "   Linux: sudo apt-get install ffmpeg"
    exit 1
fi

# Create backup directory
mkdir -p public/backup
echo "📦 Creating backups..."

# Function to compress video
compress_video() {
    local input="$1"
    local output="$2"
    local quality="${3:-28}"  # Default CRF 28 (good balance)
    
    if [ ! -f "$input" ]; then
        echo "⚠️  File not found: $input"
        return
    fi
    
    # Get original size
    local original_size=$(stat -f%z "$input" 2>/dev/null || stat -c%s "$input" 2>/dev/null)
    local original_mb=$(echo "scale=2; $original_size / 1048576" | bc)
    
    echo "📹 Compressing: $(basename "$input")"
    echo "   Original size: ${original_mb} MB"
    
    # Backup original
    cp "$input" "public/backup/$(basename "$input")"
    
    # Compress video
    # -crf: Quality (18-28, lower = better quality but larger file)
    # -preset: Encoding speed (ultrafast, fast, medium, slow, veryslow)
    # -movflags +faststart: Enables fast streaming
    ffmpeg -i "$input" \
        -c:v libx264 \
        -crf $quality \
        -preset medium \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y "$output" 2>&1 | grep -E "(Duration|Stream|Output|error)" || true
    
    if [ -f "$output" ]; then
        local new_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output" 2>/dev/null)
        local new_mb=$(echo "scale=2; $new_size / 1048576" | bc)
        local reduction=$(echo "scale=1; (1 - $new_size / $original_size) * 100" | bc)
        
        echo "   ✅ New size: ${new_mb} MB (${reduction}% reduction)"
        echo ""
    else
        echo "   ❌ Compression failed!"
        echo ""
    fi
}

# Compress videos
echo "🎥 Compressing VideoGuillaume.mp4..."
compress_video "public/VideoGuillaume.mp4" "public/VideoGuillaume-compressed.mp4" 28

echo "🎥 Compressing corridorGif.mp4..."
compress_video "public/corridorGif.mp4" "public/corridorGif-compressed.mp4" 28

echo "🎥 Compressing AnimatieFlyer.mp4..."
compress_video "public/AnimatieFlyer.mp4" "public/AnimatieFlyer-compressed.mp4" 28

echo ""
echo "✅ Video optimization complete!"
echo "📝 Review the compressed files and replace originals if satisfied."
echo "💾 Backups saved in: public/backup/"
