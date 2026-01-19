#!/bin/bash

export TAURI_PRIVATE_KEY="PATH TO KEY"
export TAURI_KEY_PASSWORD=""
GITHUB_TOKEN="GITHUB PERSONAL ACCESS TOKEN"
REPO="Midwest-Diesel/ebay-inventory"

npm run tauri build
version=$(jq -r '.version' src-tauri/tauri.conf.json)

bundle_dir="src-tauri/target/release/bundle/nsis"
msi_dir="src-tauri/target/release/bundle/msi"
signature_file="$bundle_dir/eBay-Inventory_${version}_x64-setup.exe.sig"
zip_file="$bundle_dir/eBay-Inventory_${version}_x64-setup.exe"
latest_json="latest.json"

# Copy signature content
if [ -f "$signature_file" ]; then
  signature=$(cat "$signature_file")
else
  echo "Signature file not found for version $version!"
  exit 1
fi

pub_date=$(TZ=America/Chicago date -u +"%Y-%m-%dT%H:%M:%SZ")

jq --arg version "$version" \
   --arg versionPrefix "v$version" \
   --arg signature "$signature" \
   --arg pub_date "$pub_date" \
   '.version = $versionPrefix |
    .platforms."windows-x86_64".signature = $signature |
    .platforms."windows-x86_64".url = "https://github.com/Midwest-Diesel/ebay-inventory/releases/download/v\($version)/eBay-Inventory_\($version)_x64-setup.nsis.zip" |
    .pub_date = $pub_date' \
   "$latest_json" > tmp.json && mv tmp.json "$latest_json"

echo "latest.json updated with version $version."

TAG="v$version"
TITLE="v$version"
BODY="Release for version $version"

# Create the release
response=$(curl -s -X POST "https://api.github.com/repos/$REPO/releases" \
-H "Authorization: token $GITHUB_TOKEN" \
-H "Accept: application/vnd.github.v3+json" \
-d @- <<EOF
{
  "tag_name": "$TAG",
  "name": "$TITLE",
  "body": "$BODY",
  "draft": false,
  "prerelease": false
}
EOF
)

upload_url=$(echo "$response" | jq -r '.upload_url' | sed "s/{?name,label}//")

if [ "$upload_url" != "null" ]; then
  echo "Uploading $zip_file..."
  curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @"$zip_file" \
  "$upload_url?name=$(basename "$zip_file")"
else
  echo "Failed to create release: $response"
  exit 1
fi


if [ -d "$bundle_dir" ]; then
  rm -rf "$bundle_dir"/*
else
  echo "Error cleaning files in $bundle_dir"
fi

if [ -d "$msi_dir" ]; then
  rm -rf "$msi_dir"/*
else
  echo "Error cleaning files in $msi_dir"
fi
