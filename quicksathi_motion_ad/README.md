# QuickSathi — 30-Second Motion Graphic Ad Campaign 🚀
> **Style**: Billion-Dollar Tech Startup (Apple Keynote / Linear / Stripe / Mercury aesthetic)  
> **Resolution**: 1920 × 1080 (Full HD, 16:9)  
> **Duration**: 30.00 Seconds Exact  
> **Soundtrack**: Custom 48kHz Stereo Synced Tech-Bass & UI Chimes

---

## 📁 Folder Structure

```
quicksathi_motion_ad/
├── index.html                # Interactive Browser Player & Storyboard Studio
├── package.json              # Engine dependencies (puppeteer-core)
├── README.md                 # Project documentation & Storyboard guide
│
├── screenshots/              # High-Resolution UI Captures from QuickSathi
│   ├── 01_hero_desktop.png   # 1920x1080 Home Page Hero & Search
│   ├── 02_services_grid.png  # 1920x1080 Services Catalog Grid
│   ├── 03_ac_services.png    # 1920x1080 AC Repair Category & Pricing
│   ├── 04_mobile_home.png    # 430x932 iPhone Mobile App Home
│   ├── 05_mobile_ac.png      # 430x932 Mobile Booking Flow
│   └── 06_provider_platform.png # 1920x1080 Provider Onboarding
│
├── assets/                   # Brand Assets & Sound Design
│   ├── logo-full-light.png   # QuickSathi full brand typography
│   ├── logo-icon.png         # Brand geometric emblem
│   ├── app-mockup.png        # Official app mockup
│   └── soundtrack_30s.wav    # Procedural 48kHz synced soundtrack
│
├── renders/                  # Final Production Video Exports
│   ├── quicksathi_30s_motion_ad.mp4   # 1080p 30fps Master Video (H.264 + AAC)
│   └── quicksathi_motion_preview.webp # Animated loop preview
│
└── src/                      # Source Motion Graphics Engine & Generators
    ├── motion_engine.js      # Core Canvas Motion Engine (6 scenes & camera physics)
    ├── generate_soundtrack.js# Procedural audio synthesizer
    └── render_mp4.js         # Automated headless Puppeteer + FFmpeg renderer
```

---

## 🎬 Storyboard & Scene Breakdown

| Timestamp | Scene Name | Core Message | Visual Highlights |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:05** | **The Catalyst** | *"Finding reliable home help shouldn't feel like a gamble."* | Deep obsidian space, warning tags (*Unverified Technicians*, *Hidden Fees*, *Endless Waiting*), shutter transition flash. |
| **00:05 - 00:11** | **The Reveal** | *"Meet QuickSathi. Your home services, elevated."* | Sub-bass drop, glowing 3D titanium browser displaying live Home UI (`01_hero_desktop.png`), 4.9★ rating badge, 60-min rapid arrival. |
| **00:11 - 00:17** | **Transparent Pricing** | *"Fixed Upfront Pricing. Zero Surges. Zero Hassle."* | Camera zoom into AC Service catalog (`03_ac_services.png`), animated cursor ripple, ₹499 price lock card with 30-day warranty. |
| **00:17 - 00:23** | **Mobile Tracking** | *"Tap. Track. Relax. At your door in 60 mins."* | 3D iPhone mockup scrolling live UI (`04_mobile_home.png`), live provider dispatch tracking ("Rajesh K. is 6 mins away"), 50k+ homes counter. |
| **00:23 - 00:27** | **Top 5% Standard** | *"Only the top 5% of technicians qualify."* | 4-pillar security grid: Police clearance, Aadhaar verified, trade exam certified, and ₹10,000 damage protection guarantee. |
| **00:27 - 00:30** | **The Climax & CTA** | *"Elevate your everyday life. quicksathi.in"* | Radiant golden aura, official logo, launch promo code banner (`QUICK20 for 20% OFF`), iOS & Android store badges. |

---

## 🚀 How to View & Use

### 1. Watch the Master Video
Open `renders/quicksathi_30s_motion_ad.mp4` in VLC, QuickTime, or Windows Media Player.

### 2. Interactive Browser Player
Double-click `index.html` in any modern web browser (Edge, Chrome, Brave, Safari).
Features:
- **Interactive Scrubber**: Scrub backwards and forwards through any frame.
- **Scene Jumping**: Click any scene pill (`[Scene 1]`, `[Scene 2]`, etc.) to jump immediately.
- **Export 4K Frame**: Capture an instant high-res PNG frame of whatever is currently on screen.
- **Audio Toggle**: Mute or play with the synchronized bass and chime soundtrack.

### 3. Re-Rendering or Customizing
To modify text, colors, or timings, edit `src/motion_engine.js`.
Then run:
```bash
node src/render_mp4.js
```
The script will automatically spin up the local pipeline, render the deterministic frames, and re-export `renders/quicksathi_30s_motion_ad.mp4`.
