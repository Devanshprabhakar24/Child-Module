# Certificate Assets

## Tree Background Image

To use a custom tree background image in the certificate:

1. Save your tree image as `tree-background.jpg` in this directory
2. The image will be used as a subtle overlay (15% opacity) on the certificate header
3. Recommended image size: 595x180 pixels (or any size, it will be scaled)
4. Supported formats: JPG, PNG

## Current Setup

The certificate will work without the image (using solid green background), but adding the tree image will make it more visually appealing.

### How to add the image:

```bash
# Copy your tree image to this directory
cp /path/to/your/tree-image.jpg backend/src/go-green/assets/tree-background.jpg
```

Or manually save the tree image you provided in the chat as `tree-background.jpg` in this directory.
