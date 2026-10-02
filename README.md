# 💍 Royal Islamic 3D Folding Wedding Invitation Card
### For Juveriya & Abdul Hadi

An ultra-luxurious, interactive 3D gatefold Islamic wedding card web application and high-resolution 3D studio render suite created with love for Mohammed Salman's sister **Juveriya** and groom **Abdul Hadi**.

---

## ✨ Features & Guest Personalization Flow

1. **Guest Name Welcome Gate**:
   - Before revealing the invitation, guests are greeted with a royal entrance screen featuring:
     - Holy Bismillah calligraphy in gold: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`
     - *"The Wedding Celebration of Abdul Hadi & Juveriya"*
     - An elegant prompt to enter their name (with an optional checkbox to include **"+ with Family"**).
   - Once submitted, it smoothly transitions to the 3D wedding card with celebratory audio!
   - Guests can change their name anytime using the **"Change"** button.

2. **Personalized WhatsApp Direct Sender (Connected by Mobile Number)**:
   - Click the green **"Send Invite"** button on the top nav or bottom bar.
   - Enter your relative's name (e.g. *Saniya*) and their mobile number (e.g. *9849012345*).
   - Tapping **"Open WhatsApp & Send"** automatically opens WhatsApp directly to that relative's chat with the complete wedding invitation and their personalized link (`?name=Saniya`)!
   - When they tap the link on WhatsApp, the website automatically loads with their name already filled in!
   - Includes a **Sent Invitations Tracker** to keep track of everyone you have already invited.

3. **Personalized Invitation Banner**:
   - Directly prints on the page and inside the card:
     ```
     ✨ You are cordially invited: [Entered Name] + with Family ✨
     ```
   - Automatically personalizes WhatsApp invitation text and calendar invites!

3. **URL Parameter Direct Personalization (WhatsApp Sharing Secret)**:
   - You can send personalized links directly to relatives on WhatsApp!
   - Example:
     `https://your-domain.com/?name=Uncle+Tariq`
     or
     `index.html?name=Mohammed+Salman`
   - It will automatically greet them by name without requiring them to type it in!

4. **Front Cover Design (Clean & Royal)**:
   - **All English clutter and text removed**: Kept ONLY the divine **Bismillah ir-Rahman ir-Rahim in Arabic calligraphy** (`بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`) in embossed gold foil against rich emerald green velvet, centered above the royal golden wax seal.
   - Clean, serene, authentic Islamic artistry.

5. **Realistic 3D Gatefold Card Simulation**:
   - Built with high-performance CSS 3D transforms (`perspective`, `transform-style: preserve-3d`).
   - Interactive golden wax seal that unfolds the 3D doors 180° with ceremonial audio chimes.
   - 3D interactive mouse and smartphone gyroscope tilt with shifting metallic gold foil light reflection.

6. **Event Schedule & Sunnah Blessings**:
   - **Groom**: Abdul Hadi (S/o Mr. Abdul Basith)
   - **Bride**: Juveriya (D/o Mr. Mohd Jani Miya)
   - **Nikah**: 21st Nov 2025 at 8:00 PM (Falak Convention Hall, Balapur, Telangana)
   - **Walima**: 22nd Nov 2025 at 8:00 PM onwards (Koh-e-Toor Function Hall, Golconda, Hyderabad)
   - Quranic verse from Surah Ar-Rum (30:21) and Sunnah Du'a for the newly married couple.

7. **Audio & Visual Atmosphere**:
   - Web Audio API synthesizer for ambient sitar/santoor melodies and realistic card fold chimes (100% offline, zero external files needed).
   - High-performance canvas falling rose petals and gold dust.

8. **Live Customizer & Utilities**:
   - Edit any names, dates, venues, or RSVP contacts on the fly.
   - WhatsApp share button with personalized message.
   - Add to Calendar (`.ics` file for Google, Apple, and Outlook calendars).
   - High-res print stylesheet for physical card printing.

---

## 🚀 How to Run & View

### Option 1: Direct File Open
Simply double-click [`index.html`](file:///Users/mohammedsalman/Documents/Juveriya/index.html) or run:
```bash
open "/Users/mohammedsalman/Documents/Juveriya/index.html"
```

### Option 2: Local Web Server
```bash
cd "/Users/mohammedsalman/Documents/Juveriya"
python3 -m http.server 3000
```
Then visit `http://localhost:3000`.

---

## 📁 Project Structure

```
/Users/mohammedsalman/Documents/Juveriya/
├── index.html                  # Master 3D interactive wedding invitation
├── css/style.css               # Luxury emerald velvet & embossed gold styling
├── js/app.js                   # Guest personalization, 3D fold & audio engine
├── assets/images/              # High-resolution 3D studio mockups
│   ├── card_3d_open.jpg        # Open 3D standing gatefold render
│   ├── card_3d_closed.jpg      # Closed gatefold with wax seal render
│   └── reference_card.jpg      # Original reference card
├── package.json                # Project preview scripts
└── README.md                   # Full documentation
```
