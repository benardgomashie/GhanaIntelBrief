# PWA Icon Generation Guide

Since canvas package installation can be complex, here are alternative ways to create your PWA icons:

## Option 1: Use Online Tools (Recommended)
1. Visit https://www.pwabuilder.com/imageGenerator
2. Upload a square logo (1024x1024px recommended)
3. Download the generated icon pack
4. Extract all icons to the `public/` folder

## Option 2: Use Figma/Photoshop
Create icons with Ghana flag gradient (red-yellow-green) with these sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

Design guidelines:
- Background: Ghana flag gradient (red → yellow → green)
- Add a black star in the center
- Include "GIB" or full logo
- Export as PNG with transparency

## Option 3: Quick Placeholder (Development Only)
For now, I've created the icon structure. You can temporarily:
1. Copy your og-image.png to icon-192x192.png
2. Copy it again to icon-512x512.png
3. The manifest is configured and ready

## Current Status
✅ PWA manifest created
✅ Service worker configured
✅ Offline page created
✅ Layout updated with PWA meta tags

⚠️ Icons need to be created (see options above)

## Testing PWA
Once icons are in place:
1. Deploy to production
2. Open site in Chrome/Edge
3. Look for "Install" button in address bar
4. Test offline mode by going offline in DevTools
