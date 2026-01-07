#!/bin/bash
# Optimize Assets (Convert PNG to WebP)

if ! command -v cwebp &> /dev/null
then
    echo "cwebp could not be found. Please install webp."
    exit 1
fi

find ./assets -name "*.png" -print0 | while read -d $'\0' file
do
    echo "Converting $file to WebP..."
    cwebp -q 80 "$file" -o "${file%.*}.webp"
    rm "$file"
done

echo "Asset optimization complete."
