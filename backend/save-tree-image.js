/**
 * Helper script to save tree background image for certificate
 * 
 * Usage:
 * 1. Save your tree image in this directory as 'tree-image.jpg'
 * 2. Run: node save-tree-image.js
 * 
 * Or provide a URL:
 * node save-tree-image.js https://example.com/tree.jpg
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const targetPath = path.join(__dirname, 'src', 'go-green', 'assets', 'tree-background.jpg');

// Check if URL is provided as argument
const imageUrl = process.argv[2];

if (imageUrl) {
    console.log(`📥 Downloading tree image from: ${imageUrl}`);

    const protocol = imageUrl.startsWith('https') ? https : http;

    protocol.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
            console.error(`❌ Failed to download image. Status: ${response.statusCode}`);
            process.exit(1);
        }

        const fileStream = fs.createWriteStream(targetPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`✅ Tree image saved successfully to: ${targetPath}`);
            console.log(`📄 File size: ${fs.statSync(targetPath).size} bytes`);
        });
    }).on('error', (err) => {
        console.error(`❌ Error downloading image: ${err.message}`);
        process.exit(1);
    });
} else {
    // Check if tree-image.jpg exists in current directory
    const sourcePath = path.join(__dirname, 'tree-image.jpg');

    if (fs.existsSync(sourcePath)) {
        console.log(`📁 Copying tree image from: ${sourcePath}`);
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Tree image saved successfully to: ${targetPath}`);
        console.log(`📄 File size: ${fs.statSync(targetPath).size} bytes`);
    } else {
        console.log(`
❌ No image found!

Please either:
1. Save your tree image as 'tree-image.jpg' in the backend directory, then run:
   node save-tree-image.js

2. Or provide a URL:
   node save-tree-image.js https://example.com/tree.jpg

3. Or manually save the image to:
   ${targetPath}
    `);
        process.exit(1);
    }
}
