# 👑 Royal Luxury Interactive Wedding Invitation Website

A cinematic, royal digital wedding invitation website crafted to feel like an opulent physical Indian wedding card coming alive in the browser.

---

## 🌟 Key Highlights & Features

1. **100% Data-Driven Architecture (`data.js`)**
   - **Zero hardcoded HTML content**: Bride & groom names, dates, ceremonies, addresses, photos, calendar events, audio, and final blessings are completely configured in `data.js`.
   - Reusable template: Swap `data.js` and assets to create an entirely new wedding invitation within seconds.

2. **3D Royal Wedding Entrance Door**
   - Carved wooden double doors with antique gold inlay, hanging marigold toran, and brass handles.
   - Cinematic opening physics with golden light burst, floating flower petals, and auto-audio playback unlock.

3. **Handcrafted Physical Aesthetic & Gold Foil**
   - Handmade ivory parchment surfaces, deckled torn edges, and subtle paper grain overlays.
   - Dynamic metallic gold foil typography and ornamental dividers.

4. **Split Couple Reveal & Live Countdown**
   - Arched royal portraits with central gold ampersand connector.
   - Live Days/Hours/Mins/Secs countdown ticker with auto "Day Has Arrived" celebration banner.

5. **Interactive Scrapbook Story & Journey Timeline**
   - Polaroid-style milestone memories with tilted physical scrapbook feel.
   - Continuous glowing gold vine timeline with ceremonies (Mehndi, Haldi, Sangeet, Muhurtham, Reception).

6. **Guest Utilities & Calendar Engine**
   - Dynamic **Add to Calendar** engine supporting **Google Calendar**, **Outlook Web**, and dynamic **Apple / .ICS** file downloads.
   - Quick **Google Maps** direct navigation buttons without requiring API keys.

7. **Editorial Gallery & Lightbox**
   - Asymmetric collage layout with gold photo corners.
   - Fullscreen cinematic image lightbox with mobile touch swipe gestures and keyboard navigation.

8. **Royal Background Audio with Synthesizer Fallback**
   - Audio controller with animated 3-bar equalizer.
   - Built-in Web Audio API royal instrumental synthesizer fallback so ambient music plays out-of-the-box even without external audio files.

9. **WhatsApp & Copy Link Sharing**
   - Dynamic invitation URL sharing on WhatsApp using `window.location.href`.
   - One-tap clipboard link copy with luxury toast notification.

10. **GitHub Pages & Subdirectory Safe**
    - 100% relative paths (`./assets/...`, `./data.js`) for root and subfolder hosting.

---

## 📂 Project Structure

```text
weddingworld1/
├── index.html                  # Semantic structural skeleton
├── data.js                     # Single source of truth (ALL wedding data)
├── README.md                   # System documentation
├── favicon/
│   └── favicon.svg             # Royal gold & maroon favicon
│
└── assets/
    ├── css/
    │   ├── variables.css       # Design tokens, royal palette, gold foils
    │   ├── global.css          # Paper textures, reset, typography, cards
    │   ├── animations.css      # 3D door swing, petals, shimmer, reveals
    │   ├── wedding-card.css    # Section styling & components
    │   └── responsive.css      # Mobile, tablet, & desktop breakpoints
    │
    ├── js/
    │   ├── door.js             # 3D Door opening sequence & particles
    │   ├── calendar.js         # Google, Apple (.ics), Outlook generator
    │   ├── lightbox.js         # Fullscreen modal & swipe gestures
    │   ├── gallery.js          # Editorial collage builder
    │   ├── timeline.js         # Interactive journey timeline
    │   ├── maps.js             # Venue & GPS maps handler
    │   ├── music.js            # Audio player & Web Audio synthesizer
    │   └── app.js              # Master orchestrator & DOM injector
    │
    ├── images/
    │   ├── couple/             # Couple portraits
    │   ├── bride/              # Bride royal portraits
    │   ├── groom/              # Groom royal portraits
    │   ├── events/             # Mehndi, Haldi, Sangeet, Wedding, Reception
    │   ├── gallery/            # Curated memories & scrapbook photos
    │   ├── family/             # Family blessing portraits
    │   ├── textures/           # Paper grains & motifs
    │   └── decorations/        # Gold ornaments & mandalas
    │
    └── audio/
        └── wedding-song.mp3    # Background wedding music file
```

---

## 🚀 How to Customize for a New Wedding

### Step 1: Update `data.js`
Open `data.js` and edit the details:
- **Couple Details**: Names, portraits, wedding date (`YYYY-MM-DD`), display date, tagline, and invitation text.
- **Story Milestones**: Add years, titles, descriptions, and photo paths.
- **Events**: Add/modify ceremonies, times, venues, and Google Maps links.
- **Gallery**: Add photo paths and captions.
- **Family**: Add names and titles for Bride's and Groom's families.
- **Venue**: Set venue name, full address, and Google Maps URL.
- **Feature Toggles**: Turn any section `true` or `false` (e.g. `story: false` or `music: false`).

### Step 2: Replace Images & Audio
Add your photographs to `assets/images/` and update their relative file paths in `data.js` (e.g., `./assets/images/couple/couple.jpg`).

---

## 🌐 Deployment to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, go to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and `/root` (or the folder path).
4. Click **Save**.
5. Your royal wedding invitation is instantly live at `https://<username>.github.io/<repository-name>/`.
