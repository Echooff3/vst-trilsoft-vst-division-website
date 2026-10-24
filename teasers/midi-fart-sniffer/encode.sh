#!/usr/bin/env bash
# Re-encode a Remotion render for scroll scrubbing (a keyframe every 6
# frames) and pull its first and last frames as posters.
#   ./encode.sh out/desk.mp4 ../../public/assets/mfs-teaser-desk
set -euo pipefail
in="$1"; out="$2"
ffmpeg -v error -y -i "$in" -c:v libx264 -preset slow -crf 21 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -an "$out.mp4"
ffmpeg -v error -y -i "$out.mp4" -vf "select=eq(n\,0)" -frames:v 1 -q:v 3 "$out-start.jpg"
ffmpeg -v error -y -sseof -0.05 -i "$out.mp4" -frames:v 1 -q:v 3 -update 1 "$out-end.jpg"
echo "wrote $out.mp4, $out-start.jpg, $out-end.jpg"
