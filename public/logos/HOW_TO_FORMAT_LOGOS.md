# How to Format IB and IGCSE Logos

## Option 1: Using Canva

### Steps:
1. **Go to Canva.com** and create a new design
2. **Set canvas size**: 512x512 pixels (square) for IB, 512x256 pixels (wide) for IGCSE
3. **Upload your logo images**:
   - Drag and drop the official IB logo image
   - Drag and drop the official Cambridge Assessment logo image
4. **Resize and position**:
   - Make sure logos are centered
   - Leave some padding around edges (about 10-20px)
   - Ensure logos are clear and not pixelated
5. **Export**:
   - Click "Download" button
   - Choose format: **PNG** (with transparent background)
   - Quality: **High** or **Highest**
   - Name files: `ib-logo.png` and `igcse-logo.png`

### File Specifications:
- **IB Logo**: 
  - Size: 512x512px (square)
  - Format: PNG with transparent background
  - File name: `ib-logo.png`
  
- **IGCSE Logo**:
  - Size: 512x256px (wide rectangle) or 512x512px (square)
  - Format: PNG with transparent background  
  - File name: `igcse-logo.png`

## Option 2: Using Online Tools

### Remove.bg (for transparent backgrounds):
1. Go to remove.bg
2. Upload your logo image
3. Download with transparent background
4. Resize if needed using any image editor

### TinyPNG (for optimization):
1. Go to tinypng.com
2. Upload your PNG files
3. Download optimized versions (smaller file size, same quality)

## Option 3: Using Image Editors

### Photoshop/GIMP:
1. Open logo image
2. Remove background (if needed)
3. Resize to recommended dimensions
4. Export as PNG with transparency
5. Save as `ib-logo.png` or `igcse-logo.png`

## After Formatting:

1. **Place files in**: `color/public/logos/`
2. **File names must be exactly**:
   - `ib-logo.png`
   - `igcse-logo.png`

3. **Then run**:
   ```bash
   cd color
   git add public/logos/*.png
   git commit -m "Add properly formatted IB and IGCSE logos"
   git push
   ```

## Quick Canva Template:
- Search for "Logo" templates in Canva
- Use "Custom size" and set dimensions above
- Upload your official logos
- Export as PNG with transparent background


