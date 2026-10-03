/**
 * Juveriya & Abdul Hadi - Royal 3D Folding Islamic Wedding Card
 * Guest Name Gate, Personalized Greeting ("You are invited [Name] + with Family"),
 * Pure Arabic Bismillah Front Crest, 3D Gatefold, Web Audio Synthesizer,
 * Petals Particle Canvas, Live Customizer, and RSVP Calendar Integration.
 */

(function () {
  'use strict';

  // =========================================================================
  // Default Wedding Data
  // =========================================================================
  const DEFAULT_DATA = {
    groomName: 'Abdul Hadi',
    brideName: 'Juveriya',
    groomParents: '(S/o Mr. Abdul Basith)',
    brideParents: '(D/o Mr. Mohd Jani Miya)',
    baratTitle: 'Nikah',
    baratDate: 'On 21st Nov 2025',
    baratTime: '8:00 pm',
    baratVenue: 'Falak Convention Hall,\nBalapur, Telangana.',
    walimaTitle: 'Walima',
    walimaDate: 'On 22nd Nov 2025',
    walimaTime: '8:00 pm onwards',
    walimaVenue: 'Koh-e-Toor Function Hall,\nGolconda, Hyderabad.',
    rsvpContact: '+91 94403 94950',
    familyCompliments: 'Near & Dear Family, Relatives & Friends'
  };

  const STORAGE_KEY = 'juveriya_wedding_card_data';
  const GUEST_STORAGE_KEY = 'juveriya_wedding_guest_name';
  const GUEST_FAMILY_KEY = 'juveriya_wedding_guest_family';

  // =========================================================================
  // DOM Elements
  // =========================================================================
  // Guest Gate Elements
  const guestGateScreen = document.getElementById('guestGateScreen');
  const guestGateForm = document.getElementById('guestGateForm');
  const gateGuestNameInput = document.getElementById('gateGuestNameInput');
  const gateWithFamilyCheck = document.getElementById('gateWithFamilyCheck');
  const btnEditGuestName = document.getElementById('btnEditGuestName');

  // Personalized Ribbon & Inner Card Name Elements
  const displayBannerGuestName = document.getElementById('displayBannerGuestName');
  const displayBannerFamilyTag = document.getElementById('displayBannerFamilyTag');
  const displayCardGuestName = document.getElementById('displayCardGuestName');
  const displayCardFamilyTag = document.getElementById('displayCardFamilyTag');

  // 3D Card Elements
  const weddingCard = document.getElementById('weddingCard');
  const cardWrapper = document.getElementById('cardWrapper');
  const waxSeal = document.getElementById('waxSeal');
  const waxSealWrapper = document.getElementById('waxSealWrapper');
  const frontBismillahWrapper = document.getElementById('frontBismillahWrapper');
  const foilSheens = document.querySelectorAll('.card-foil-sheen');

  // Top Nav Buttons
  const btnFoldToggle = document.getElementById('btnFoldToggle');
  const btnAudioToggle = document.getElementById('btnAudioToggle');
  const btnPetalsToggle = document.getElementById('btnPetalsToggle');
  const btnGalleryToggle = document.getElementById('btnGalleryToggle');
  const btnCustomizeToggle = document.getElementById('btnCustomizeToggle');

  // Floating Action Bar Buttons
  const fabToggleFold = document.getElementById('fabToggleFold');
  const fabPrintCard = document.getElementById('fabPrintCard');
  const fabDirections = document.getElementById('fabDirections');

  // In-Card Action Buttons
  const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');
  const btnAddToCalendar = document.getElementById('btnAddToCalendar');

  // Modals
  const galleryModal = document.getElementById('galleryModal');
  const btnCloseGallery = document.getElementById('btnCloseGallery');
  const customizerModal = document.getElementById('customizerModal');
  const btnCloseCustomizer = document.getElementById('btnCloseCustomizer');
  const customizerForm = document.getElementById('cardCustomizerForm');
  const btnResetDefaults = document.getElementById('btnResetDefaults');

  // Canvas
  const canvas = document.getElementById('particlesCanvas');
  const ctx = canvas.getContext('2d');

  // State
  let isOpen = false;
  let isAudioPlaying = false;
  let arePetalsEnabled = true;
  let audioContext = null;
  let ambientMelodyInterval = null;

  // 3D Tilt State
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  // =========================================================================
  // Guest Name Management & Personalization Flow (Fixed by Admin)
  // =========================================================================
  function initGuestPersonalization() {
    // If Admin portal requested via ?admin=true or #admin, redirect directly to dedicated admin portal
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('portal') === 'admin' || window.location.hash === '#admin') {
      window.location.replace('admin.html');
      return;
    }

    const gateRelativeView = document.getElementById('gateRelativeView');
    const gateFallbackView = document.getElementById('gateFallbackView');
    const gateGuestNameDisplay = document.getElementById('gateGuestNameDisplay');
    const gateGuestFamilyDisplay = document.getElementById('gateGuestFamilyDisplay');
    const btnEnterInvitation = document.getElementById('btnEnterInvitation');

    // 1. Check for URL parameters: e.g. ?name=Salman+Khan&family=true
    const paramName = urlParams.get('name') || urlParams.get('guest');
    const paramFamily = urlParams.get('family');

    let initialName = '';
    let withFamily = true;

    if (paramName) {
      initialName = paramName.trim();
      withFamily = paramFamily === 'true' || paramFamily === '1';
      setGuestInformation(initialName, withFamily);
    } else {
      // 2. Check localStorage for previously typed/assigned name
      const savedName = localStorage.getItem(GUEST_STORAGE_KEY);
      const savedFamily = localStorage.getItem(GUEST_FAMILY_KEY);

      if (savedName) {
        initialName = savedName;
        withFamily = savedFamily === null ? true : savedFamily === 'true';
        setGuestInformation(initialName, withFamily);
      }
    }

    // If name is fixed by Admin or saved: Show the unchangeable royal relative view
    if (initialName) {
      if (gateRelativeView) gateRelativeView.style.display = 'flex';
      if (gateFallbackView) gateFallbackView.style.display = 'none';
      if (gateGuestNameDisplay) gateGuestNameDisplay.textContent = initialName;
      if (gateGuestFamilyDisplay) {
        gateGuestFamilyDisplay.textContent = '& FAMILY';
        gateGuestFamilyDisplay.style.display = withFamily ? 'inline-block' : 'none';
      }
    } else {
      // Fallback only if someone visits without any link/name
      if (gateRelativeView) gateRelativeView.style.display = 'none';
      if (gateFallbackView) gateFallbackView.style.display = 'block';
    }

    // Direct step testing parameter support (e.g. ?step=0, ?step=1, ?step=2, ?step=3)
    const testStepParam = urlParams.get('step');
    if (testStepParam !== null) {
      if (guestGateScreen) guestGateScreen.classList.add('is-hidden');
      if (gateAutoAdvanceTimer) clearTimeout(gateAutoAdvanceTimer);
      if (cardAutoOpenTimer) clearTimeout(cardAutoOpenTimer);

      if (testStepParam === '0') {
        currentUnfoldStep = 0;
        weddingCard.classList.remove('unfolding-active', 'step-1-horizontal', 'step-2-diagonal', 'step-3-vertical', 'is-open');
        isOpen = false;
        updateCardScale();
      } else if (testStepParam === '1') {
        currentUnfoldStep = 1;
        weddingCard.classList.remove('step-2-diagonal', 'step-3-vertical', 'is-open');
        weddingCard.classList.add('unfolding-active', 'step-1-horizontal');
        updateStepIndicator(1);
        updateCardScale();
      } else if (testStepParam === '2') {
        currentUnfoldStep = 2;
        weddingCard.classList.remove('step-1-horizontal', 'step-3-vertical', 'is-open');
        weddingCard.classList.add('unfolding-active', 'step-2-diagonal');
        updateStepIndicator(2);
        updateCardScale();
      } else if (testStepParam === '3') {
        currentUnfoldStep = 4;
        weddingCard.classList.remove('step-1-horizontal', 'step-2-diagonal');
        weddingCard.classList.add('step-3-vertical', 'is-open');
        isOpen = true;
        updateStepIndicator(4);
        updateCardScale();
      }
      return;
    }

    // Always display this welcome gate screen as the main webpage on load/refresh
    guestGateScreen.classList.remove('is-hidden');

    // Trigger 2-second visual progress fill on gate button
    const gateProgress = document.getElementById('gateEnterProgress');
    if (gateProgress) {
      gateProgress.style.animation = 'none';
      void gateProgress.offsetWidth;
      gateProgress.style.animation = 'autoAdvanceFill 2s linear forwards';
    }

    // Screen 1: Display for exactly 2 seconds and automatically move forward
    if (gateAutoAdvanceTimer) clearTimeout(gateAutoAdvanceTimer);
    gateAutoAdvanceTimer = setTimeout(() => {
      advanceFromGate();
    }, 2000);

    // Wire the Open button for the fixed relative view (tapping advances immediately)
    if (btnEnterInvitation) {
      btnEnterInvitation.onclick = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        advanceFromGate();
      };
    }

    // Tapping on the gate card advances immediately
    const gateCard = document.querySelector('.guest-gate-card');
    if (gateCard) {
      gateCard.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'gateGuestNameInput') return;
        advanceFromGate();
      });
    }
  }

  // =========================================================================
  // 2-Second Automatic Slide Progression Timers
  // Screen 1 (Gate): 2 seconds -> Screen 2 (Closed Card): 2 seconds -> Screen 3 (Opened Card): No Limit!
  // =========================================================================
  let gateAutoAdvanceTimer = null;
  let cardAutoOpenTimer = null;
  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      if (!isAudioPlaying) {
        startAmbientMelody();
      }
    } catch (e) {}
  }

  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });

  function advanceFromGate() {
    if (gateAutoAdvanceTimer) {
      clearTimeout(gateAutoAdvanceTimer);
      gateAutoAdvanceTimer = null;
    }

    if (!guestGateScreen.classList.contains('is-hidden')) {
      guestGateScreen.classList.add('is-hidden');
      try {
        playUnfoldSound();
      } catch (err) {}

      try {
        if (!isAudioPlaying) {
          startAmbientMelody();
        }
      } catch (err) {}
    }

    // Screen 2: Closed 3D Card Cover displays for 2 seconds then auto-opens!
    startCardAutoOpenTimer();
  }

  function startCardAutoOpenTimer() {
    if (cardAutoOpenTimer) {
      clearTimeout(cardAutoOpenTimer);
      cardAutoOpenTimer = null;
    }

    if (isOpen) return;

    // Trigger visual progress animation on card tap button
    const cardProgress = document.getElementById('cardTapProgress');
    if (cardProgress) {
      cardProgress.style.animation = 'none';
      void cardProgress.offsetWidth;
      cardProgress.style.animation = 'autoAdvanceFill 2s linear forwards';
    }

    // Automatically unfold card into Screen 3 after 2 seconds
    cardAutoOpenTimer = setTimeout(() => {
      if (!isOpen) {
        openCard();
      }
    }, 2000);
  }

  function setGuestInformation(name, withFamily) {
    const cleanName = name || 'Honored Guest';
    const familyText = withFamily ? '& FAMILY' : '';

    localStorage.setItem(GUEST_STORAGE_KEY, cleanName);
    localStorage.setItem(GUEST_FAMILY_KEY, withFamily ? 'true' : 'false');

    // Update Banner (if ribbon exists)
    if (displayBannerGuestName) displayBannerGuestName.textContent = cleanName;
    if (displayBannerFamilyTag) {
      displayBannerFamilyTag.textContent = familyText;
      displayBannerFamilyTag.style.display = withFamily ? 'inline-block' : 'none';
    }

    // Update Inner Card
    if (displayCardGuestName) displayCardGuestName.textContent = cleanName;
    if (displayCardFamilyTag) {
      displayCardFamilyTag.textContent = familyText;
      displayCardFamilyTag.style.display = withFamily ? 'inline-block' : 'none';
    }
  }

  function handleGateSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const gateInput = document.getElementById('gateGuestNameInput');
    const enteredName = gateInput ? gateInput.value.trim() : '';

    setGuestInformation(enteredName || 'Honored Guest', true);
    advanceFromGate();
  }

  function reopenGuestGate() {
    guestGateScreen.classList.remove('is-hidden');
    setTimeout(() => {
      gateGuestNameInput.focus();
      gateGuestNameInput.select();
    }, 200);
  }

  // =========================================================================
  // Web Audio API Synthesizer (Zero External Dependencies)
  // Generates royal chime sounds for folding and soothing traditional melodies
  // =========================================================================
  function getAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  // Card Opening & Unfolding Chime Sound
  function playUnfoldSound() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Soft paper flap / rustle sound
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(450, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // Harmonious Gold Chimes
      const frequencies = isOpen ? [440, 554.37, 659.25, 880] : [880, 659.25, 554.37, 440];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.9);
      });
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  // Royal Wax Seal Fracture Snap & Golden Shimmer Burst Sound
  function playWaxCrackSound() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // 1. Sharp tactile wax fracture / crack snap impulse
      const crackBufferSize = Math.floor(ctx.sampleRate * 0.12);
      const crackBuffer = ctx.createBuffer(1, crackBufferSize, ctx.sampleRate);
      const crackData = crackBuffer.getChannelData(0);
      for (let i = 0; i < crackBufferSize; i++) {
        crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.015));
      }
      const crackNoise = ctx.createBufferSource();
      crackNoise.buffer = crackBuffer;
      const crackFilter = ctx.createBiquadFilter();
      crackFilter.type = 'highpass';
      crackFilter.frequency.setValueAtTime(1400, now);

      const crackGain = ctx.createGain();
      crackGain.gain.setValueAtTime(0.35, now);
      crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      crackNoise.connect(crackFilter);
      crackFilter.connect(crackGain);
      crackGain.connect(ctx.destination);
      crackNoise.start(now);

      // 2. Resonant body pop / seal break thud
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = 'triangle';
      snapOsc.frequency.setValueAtTime(260, now);
      snapOsc.frequency.exponentialRampToValueAtTime(65, now + 0.14);

      snapGain.gain.setValueAtTime(0.28, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.15);

      // 3. Radiant Golden Light Burst Sparkle Chimes
      const burstFrequencies = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7 royal octave flourish
      burstFrequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.06);

        gain.gain.setValueAtTime(0.0001, now + 0.05 + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05 + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + idx * 0.06 + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + 0.05 + idx * 0.06);
        osc.stop(now + 0.05 + idx * 0.06 + 0.75);
      });
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  // Step 2: Diagonal Unfolding Sparkle Chime Sound
  function playDiagonalChimeSound() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const frequencies = [554.37, 659.25, 830.61, 987.77, 1108.73];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.85);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.9);
      });
    } catch (e) {}
  }

  // Step 3: Vertical Unfolding Royal Flourish Chime Sound
  function playCompletionHarpSound() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const frequencies = [523.25, 659.25, 783.99, 1046.50];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.09 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 1.2);
      });
    } catch (e) {}
  }

  // Ambient Wedding Sitar / Santoor Melody Generator
  function startAmbientMelody() {
    try {
      const ctx = getAudioContext();
      isAudioPlaying = true;
      if (btnAudioToggle) {
        btnAudioToggle.classList.add('active');
        const txt = btnAudioToggle.querySelector('.btn-text');
        if (txt) txt.textContent = 'Music On';
      }

      // Raga Bhupali notes
      const scale = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 739.99];

      // Gentle Tanpura Drone in D
      const droneOsc = ctx.createOscillator();
      const droneGain = ctx.createGain();
      droneOsc.type = 'triangle';
      droneOsc.frequency.setValueAtTime(146.83, ctx.currentTime);
      droneGain.gain.setValueAtTime(0.035, ctx.currentTime);
      droneOsc.connect(droneGain);
      droneGain.connect(ctx.destination);
      droneOsc.start();

      ambientMelodyInterval = setInterval(() => {
        if (!isAudioPlaying) {
          droneOsc.stop();
          return;
        }

        const now = ctx.currentTime;
        const noteFreq = scale[Math.floor(Math.random() * scale.length)];
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();

        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(noteFreq, now);

        bellGain.gain.setValueAtTime(0.001, now);
        bellGain.gain.linearRampToValueAtTime(0.045, now + 0.05);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);

        bellOsc.start(now);
        bellOsc.stop(now + 1.6);
      }, 700);

    } catch (e) {
      console.warn('Audio autoplay restricted:', e);
    }
  }

  function stopAmbientMelody() {
    isAudioPlaying = false;
    if (btnAudioToggle) {
      btnAudioToggle.classList.remove('active');
      const txt = btnAudioToggle.querySelector('.btn-text');
      if (txt) txt.textContent = 'Music';
    }
    if (ambientMelodyInterval) {
      clearInterval(ambientMelodyInterval);
      ambientMelodyInterval = null;
    }
  }

  function toggleAudio() {
    if (isAudioPlaying) {
      stopAmbientMelody();
    } else {
      startAmbientMelody();
    }
  }

  // =========================================================================
  // Sequential 3-Step 3D Card Unfolding (1 Second for each Step)
  // Step 1 (0s to 1s): Horizontally
  // Step 2 (1s to 2s): Diagonally
  // Step 3 (2s to 3s): Vertically -> Fully Open Reference Photo Card!
  // =========================================================================
  let currentUnfoldStep = 0;
  let isUnfolding = false;
  let unfoldStepTimeout1 = null;
  let unfoldStepTimeout2 = null;
  let unfoldStepTimeout3 = null;
  let bannerFadeTimeout = null;

  function updateStepIndicator(step) {
    const banner = document.getElementById('unfoldStepBanner');
    const badge = document.getElementById('stepBadgeText');
    const dot1 = document.getElementById('stepDot1');
    const dot2 = document.getElementById('stepDot2');
    const dot3 = document.getElementById('stepDot3');
    if (!banner || !badge) return;

    if (bannerFadeTimeout) {
      clearTimeout(bannerFadeTimeout);
      bannerFadeTimeout = null;
    }

    banner.classList.remove('fade-out');
    banner.classList.add('is-active');

    if (step === 1) {
      badge.textContent = '✦ Step 1 of 3: Unfolding Horizontally ✦';
      if (dot1) dot1.classList.add('active');
      if (dot2) dot2.classList.remove('active');
      if (dot3) dot3.classList.remove('active');
    } else if (step === 2) {
      badge.textContent = '✦ Step 2 of 3: Unfolding Diagonally ✦';
      if (dot1) dot1.classList.add('active');
      if (dot2) dot2.classList.add('active');
      if (dot3) dot3.classList.remove('active');
    } else if (step === 3) {
      badge.textContent = '✦ Step 3 of 3: Unfolding Vertically ✦';
      if (dot1) dot1.classList.add('active');
      if (dot2) dot2.classList.add('active');
      if (dot3) dot3.classList.add('active');
    } else if (step === 4) {
      badge.textContent = '✦ Royal Wedding Card Opened ✦';
      if (dot1) dot1.classList.add('active');
      if (dot2) dot2.classList.add('active');
      if (dot3) dot3.classList.add('active');
      bannerFadeTimeout = setTimeout(() => {
        if (banner) banner.classList.add('fade-out');
      }, 2500);
    }
  }

  let currentScale = 1;

  function updateCardScale() {
    const isCardOpen = weddingCard && (
      weddingCard.classList.contains('is-open') ||
      weddingCard.classList.contains('step-1-horizontal') ||
      weddingCard.classList.contains('step-2-diagonal') ||
      weddingCard.classList.contains('step-3-vertical')
    );
    // Closed card is 440px wide x 620px high. Open card has 2 flaps unfolded (total width 880px x 660px high).
    const targetWidth = isCardOpen ? 900 : 460;
    const targetHeight = isCardOpen ? 700 : 640;
    const availWidth = Math.max(300, window.innerWidth - 24);
    const availHeight = Math.max(400, window.innerHeight - 80);
    const scaleW = availWidth / targetWidth;
    const scaleH = availHeight / targetHeight;
    currentScale = Math.min(1, scaleW, scaleH);
    if (currentScale < 0.38) currentScale = 0.38;
    document.documentElement.style.setProperty('--card-scale', currentScale);
  }

  function openCard(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    // Cancel any pending auto-open timer when card is opened
    if (cardAutoOpenTimer) {
      clearTimeout(cardAutoOpenTimer);
      cardAutoOpenTimer = null;
    }
    if (isOpen || isUnfolding) return;
    isUnfolding = true;

    // Clear any previous timeouts
    if (unfoldStepTimeout1) clearTimeout(unfoldStepTimeout1);
    if (unfoldStepTimeout2) clearTimeout(unfoldStepTimeout2);
    if (unfoldStepTimeout3) clearTimeout(unfoldStepTimeout3);

    // Audio melody auto-play
    try {
      if (!isAudioPlaying && !sessionStorage.getItem('audioPrompted')) {
        sessionStorage.setItem('audioPrompted', 'true');
        startAmbientMelody();
      }
    } catch (err) {}

    // Clear inline transform on weddingCard so CSS classes control 3D transforms
    if (weddingCard) weddingCard.style.transform = '';

    // -----------------------------------------------------------------
    // STEP 1: Unfolding Horizontally (0s to 1s)
    // -----------------------------------------------------------------
    currentUnfoldStep = 1;
    weddingCard.classList.remove('step-2-diagonal', 'step-3-vertical', 'is-open');
    weddingCard.classList.add('unfolding-active', 'step-1-horizontal');
    updateStepIndicator(1);
    updateCardScale();

    try {
      playWaxCrackSound();
      playUnfoldSound();
    } catch (err) {}

    // -----------------------------------------------------------------
    // STEP 2: Unfolding Diagonally (1s to 2s)
    // -----------------------------------------------------------------
    unfoldStepTimeout1 = setTimeout(() => {
      currentUnfoldStep = 2;
      weddingCard.classList.remove('step-1-horizontal');
      weddingCard.classList.add('step-2-diagonal');
      updateStepIndicator(2);
      updateCardScale();

      try {
        playDiagonalChimeSound();
      } catch (err) {}
    }, 1000);

    // -----------------------------------------------------------------
    // STEP 3: Unfolding Vertically (2s to 3s)
    // -----------------------------------------------------------------
    unfoldStepTimeout2 = setTimeout(() => {
      currentUnfoldStep = 3;
      weddingCard.classList.remove('step-2-diagonal');
      weddingCard.classList.add('step-3-vertical', 'is-open');
      updateStepIndicator(3);
      updateCardScale();

      try {
        playCompletionHarpSound();
      } catch (err) {}
    }, 2000);

    // -----------------------------------------------------------------
    // COMPLETED: Final Opened Reference Photo Card at 3s
    // Stays open indefinitely without closing!
    // -----------------------------------------------------------------
    unfoldStepTimeout3 = setTimeout(() => {
      currentUnfoldStep = 4;
      isOpen = true;
      isUnfolding = false;
      weddingCard.classList.remove('step-1-horizontal', 'step-2-diagonal');
      weddingCard.classList.add('step-3-vertical', 'is-open');
      updateStepIndicator(4);
      updateCardScale();
    }, 3000);
  }

  function closeCard(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    // "for last page no limit... stays open indefinitely so guests can view without being closed"
    // Never auto-close or close on accidental click.
    return;
  }

  function toggleCardFold(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    if (!isOpen && !isUnfolding) {
      openCard(e);
    }
  }

  // Expose globally so onclick="openCard()" or onclick="toggleCardFold()" work infallibly
  window.openCard = openCard;
  window.closeCard = closeCard;
  window.toggleCardFold = toggleCardFold;

  // =========================================================================
  // Interactive 3D Perspective Tilt on Mouse/Touch Move
  // =========================================================================
  function handlePointerMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = cardWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (clientX - centerX) / (window.innerWidth / 2);
    const deltaY = (clientY - centerY) / (window.innerHeight / 2);

    targetRotateY = Math.max(-16, Math.min(16, deltaX * 14));
    targetRotateX = Math.max(-12, Math.min(12, -deltaY * 12));

    // Dynamic light sheen reflection
    const sheenX = 50 + deltaX * 40;
    const sheenY = 50 + deltaY * 40;
    foilSheens.forEach(sheen => {
      sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 240, 189, 0.25) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)`;
    });
  }

  function handlePointerLeave() {
    targetRotateX = 0;
    targetRotateY = 0;
  }

  function updateCardTilt() {
    currentRotateX += (targetRotateX - currentRotateX) * 0.08;
    currentRotateY += (targetRotateY - currentRotateY) * 0.08;

    if (cardWrapper) {
      cardWrapper.style.transform = `scale(${currentScale}) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
    }
    requestAnimationFrame(updateCardTilt);
  }
  requestAnimationFrame(updateCardTilt);
  window.addEventListener('resize', updateCardScale);
  window.addEventListener('orientationchange', updateCardScale);

  // =========================================================================
  // Canvas Particles: Falling Rose Petals & Gold Dust
  // =========================================================================
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20 - Math.random() * 50;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 1.5 + 0.8;
      this.speedX = Math.random() * 1.2 - 0.6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.04;
      this.isPetal = Math.random() > 0.45;
      this.opacity = Math.random() * 0.7 + 0.3;
      this.hue = this.isPetal ? Math.floor(Math.random() * 15 + 345) : 45;
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.y * 0.02) * 0.8 + this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;

      if (this.isPetal) {
        ctx.fillStyle = `hsl(${this.hue}, 75%, 45%)`;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffe49e';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  let particles = [];
  function initParticles() {
    resizeCanvas();
    particles = [];
    const count = window.innerWidth < 650 ? 30 : 60;
    for (let i = 0; i < count; i++) {
      const p = new Particle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function animateParticles() {
    if (arePetalsEnabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(animateParticles);
  }

  function togglePetals() {
    arePetalsEnabled = !arePetalsEnabled;
    btnPetalsToggle.classList.toggle('active', arePetalsEnabled);
    if (!arePetalsEnabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // =========================================================================
  // Data Management & Card Customizer
  // =========================================================================
  function loadCardData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_DATA;
      const parsed = JSON.parse(saved);
      // Migrate if old defaults or old city/number are detected
      if (parsed.groomParents && (parsed.groomParents.includes('Ikramul') || parsed.groomParents.includes('Usmani')) ||
          (parsed.baratVenue && parsed.baratVenue.includes('Allahabad')) ||
          (parsed.rsvpContact && parsed.rsvpContact.includes('97890'))) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
        return DEFAULT_DATA;
      }
      return Object.assign({}, DEFAULT_DATA, parsed);
    } catch (e) {
      return DEFAULT_DATA;
    }
  }

  function saveCardData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Unable to save wedding data to localStorage:', e);
    }
  }

  function applyDataToCard(data) {
    // Names & Parents
    document.getElementById('displayGroomName').textContent = data.groomName;
    document.getElementById('displayBrideName').textContent = data.brideName;
    document.getElementById('displayGroomParents').textContent = data.groomParents;
    document.getElementById('displayBrideParents').textContent = data.brideParents;

    // Barat / Nikah
    document.getElementById('displayBaratTitle').textContent = data.baratTitle;
    document.getElementById('displayBaratDate').textContent = data.baratDate;
    document.getElementById('displayBaratTime').textContent = data.baratTime;
    document.getElementById('displayBaratVenue').innerHTML = data.baratVenue.replace(/\n/g, '<br>');

    // Walima
    document.getElementById('displayWalimaTitle').textContent = data.walimaTitle;
    document.getElementById('displayWalimaDate').textContent = data.walimaDate;
    document.getElementById('displayWalimaTime').textContent = data.walimaTime;
    document.getElementById('displayWalimaVenue').innerHTML = data.walimaVenue.replace(/\n/g, '<br>');

    // Contact & Compliments
    const cleanPhone = (data.rsvpContact || '').replace(/[^0-9+]/g, '');
    document.getElementById('displayRsvpContact').innerHTML = `<a href="tel:${cleanPhone}" class="contact-phone-link"><i class="fa-solid fa-phone"></i> ${data.rsvpContact}</a>`;
    document.getElementById('displayFamilyCompliments').textContent = data.familyCompliments;
  }

  function populateCustomizerForm(data) {
    document.getElementById('inputGroomName').value = data.groomName;
    document.getElementById('inputBrideName').value = data.brideName;
    document.getElementById('inputGroomParents').value = data.groomParents.replace(/^\(|\)$/g, '');
    document.getElementById('inputBrideParents').value = data.brideParents.replace(/^\(|\)$/g, '');
    document.getElementById('inputBaratDate').value = data.baratDate;
    document.getElementById('inputBaratTime').value = data.baratTime;
    document.getElementById('inputBaratVenue').value = data.baratVenue;
    document.getElementById('inputWalimaDate').value = data.walimaDate;
    document.getElementById('inputWalimaTime').value = data.walimaTime;
    document.getElementById('inputWalimaVenue').value = data.walimaVenue;
    document.getElementById('inputRsvpContact').value = data.rsvpContact;
    document.getElementById('inputFamilyCompliments').value = data.familyCompliments;
  }

  function handleCustomizerSubmit(e) {
    e.preventDefault();

    const updated = {
      groomName: document.getElementById('inputGroomName').value.trim() || DEFAULT_DATA.groomName,
      brideName: document.getElementById('inputBrideName').value.trim() || DEFAULT_DATA.brideName,
      groomParents: `(${document.getElementById('inputGroomParents').value.trim()})`,
      brideParents: `(${document.getElementById('inputBrideParents').value.trim()})`,
      baratTitle: DEFAULT_DATA.baratTitle,
      baratDate: document.getElementById('inputBaratDate').value.trim(),
      baratTime: document.getElementById('inputBaratTime').value.trim(),
      baratVenue: document.getElementById('inputBaratVenue').value.trim(),
      walimaTitle: DEFAULT_DATA.walimaTitle,
      walimaDate: document.getElementById('inputWalimaDate').value.trim(),
      walimaTime: document.getElementById('inputWalimaTime').value.trim(),
      walimaVenue: document.getElementById('inputWalimaVenue').value.trim(),
      rsvpContact: document.getElementById('inputRsvpContact').value.trim(),
      familyCompliments: document.getElementById('inputFamilyCompliments').value.trim()
    };

    saveCardData(updated);
    applyDataToCard(updated);
    customizerModal.classList.remove('is-active');
    playUnfoldSound();
  }

  function handleResetDefaults() {
    if (confirm('Reset wedding card details back to original defaults?')) {
      localStorage.removeItem(STORAGE_KEY);
      applyDataToCard(DEFAULT_DATA);
      populateCustomizerForm(DEFAULT_DATA);
      customizerModal.classList.remove('is-active');
    }
  }

  // =========================================================================
  // WhatsApp Share & Calendar Integration
  // =========================================================================
  function shareOnWhatsApp() {
    const data = loadCardData();
    const guestName = localStorage.getItem(GUEST_STORAGE_KEY) || 'Honored Guest';
    const withFamily = localStorage.getItem(GUEST_FAMILY_KEY) !== 'false';
    const guestLine = withFamily ? `${guestName} & FAMILY` : guestName;

    const shareText = 
      `✨ *Royal Wedding Invitation* ✨\n\n` +
      `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n` +
      `*You are cordially invited: ${guestLine}*\n\n` +
      `The pleasure of your company is requested at the wedding celebration of:\n\n` +
      `💍 *${data.groomName}* & *${data.brideName}* 💍\n\n` +
      `🌙 *${data.baratTitle}:*\n` +
      `📅 ${data.baratDate} at ${data.baratTime}\n` +
      `📍 ${data.baratVenue}\n\n` +
      `🌟 *${data.walimaTitle}:*\n` +
      `📅 ${data.walimaDate} at ${data.walimaTime}\n` +
      `📍 ${data.walimaVenue}\n\n` +
      `📞 Contact No: ${data.rsvpContact}\n\n` +
      `Open your personalized 3D invitation card here:\n${window.location.href}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  }

  function generateCalendarEvent() {
    const data = loadCardData();
    const icsContent = 
      "BEGIN:VCALENDAR\n" +
      "VERSION:2.0\n" +
      "PRODID:-//Juveriya & Abdul Hadi Wedding//EN\n" +
      "BEGIN:VEVENT\n" +
      "SUMMARY:" + data.baratTitle + ": " + data.groomName + " & " + data.brideName + "\n" +
      "DESCRIPTION:Auspicious wedding ceremony of " + data.groomName + " and " + data.brideName + "\\nVenue: " + data.baratVenue + "\n" +
      "LOCATION:Falak Convention Hall, Balapur, Telangana\n" +
      "DTSTART:20251121T143000Z\n" +
      "DTEND:20251121T183000Z\n" +
      "END:VEVENT\n" +
      "BEGIN:VEVENT\n" +
      "SUMMARY:" + data.walimaTitle + ": " + data.groomName + " & " + data.brideName + "\n" +
      "DESCRIPTION:Walima reception ceremony of " + data.groomName + " and " + data.brideName + "\\nVenue: " + data.walimaVenue + "\n" +
      "LOCATION:Koh-e-Toor Function Hall, Golconda, Hyderabad\n" +
      "DTSTART:20251122T143000Z\n" +
      "DTEND:20251122T183000Z\n" +
      "END:VEVENT\n" +
      "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Wedding_Invitation_${data.groomName}_${data.brideName}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function openVenuesMap() {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=Falak+Convention+Hall+Balapur+Telangana`;
    window.open(mapsUrl, '_blank');
  }

  // =========================================================================
  // Event Listeners Initialization
  // =========================================================================
  function initEvents() {
    // Guest Gate Form
    if (guestGateForm) guestGateForm.addEventListener('submit', handleGateSubmit);
    if (btnEditGuestName) btnEditGuestName.addEventListener('click', reopenGuestGate);

    // =========================================================================
    // Tap to Open Triggers (Robust Touch & Click Handling)
    // =========================================================================
    const cardTapBtn = document.getElementById('cardTapBtn');
    const cardTapContainer = document.getElementById('cardTapContainer');
    const flapLeft = document.getElementById('flapLeft');
    const flapRight = document.getElementById('flapRight');

    const handleOpenTrigger = (e) => {
      if (e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.cancelable && e.type === 'touchend') {
          e.preventDefault();
        }
      }
      if (!isOpen) {
        openCard(e);
      }
    };

    // Card Tap Button & Container
    if (cardTapBtn) {
      cardTapBtn.addEventListener('click', handleOpenTrigger);
      cardTapBtn.addEventListener('touchend', handleOpenTrigger);
    }
    if (cardTapContainer) {
      cardTapContainer.addEventListener('click', handleOpenTrigger);
      cardTapContainer.addEventListener('touchend', handleOpenTrigger);
    }

    // Wax Seal & Wrapper
    if (waxSeal) {
      waxSeal.addEventListener('click', handleOpenTrigger);
      waxSeal.addEventListener('touchend', handleOpenTrigger);
    }
    if (waxSealWrapper) {
      waxSealWrapper.addEventListener('click', handleOpenTrigger);
      waxSealWrapper.addEventListener('touchend', handleOpenTrigger);
    }

    // Closed Gate Flaps
    if (flapLeft) {
      flapLeft.addEventListener('click', (e) => {
        if (!isOpen) handleOpenTrigger(e);
      });
      flapLeft.addEventListener('touchend', (e) => {
        if (!isOpen) handleOpenTrigger(e);
      });
    }
    if (flapRight) {
      flapRight.addEventListener('click', (e) => {
        if (!isOpen) handleOpenTrigger(e);
      });
      flapRight.addEventListener('touchend', (e) => {
        if (!isOpen) handleOpenTrigger(e);
      });
    }

    // Card Body: When closed, tap opens card in 3 sequential steps. When open, stays open indefinitely!
    if (weddingCard) {
      weddingCard.addEventListener('click', (e) => {
        if (!isOpen && currentUnfoldStep === 0) {
          handleOpenTrigger(e);
        }
      });
    }

    // Navigation Controls (Optional)
    if (btnAudioToggle) btnAudioToggle.addEventListener('click', toggleAudio);
    if (btnPetalsToggle) btnPetalsToggle.addEventListener('click', togglePetals);

    // Reference Design Photo Lightbox Modal
    const btnHeaderRefPhoto = document.getElementById('btnHeaderRefPhoto');
    const refPhotoModal = document.getElementById('refPhotoModal');
    const btnCloseRefPhoto = document.getElementById('btnCloseRefPhoto');
    if (btnHeaderRefPhoto && refPhotoModal) {
      btnHeaderRefPhoto.addEventListener('click', () => {
        refPhotoModal.classList.add('is-active');
      });
    }
    if (btnCloseRefPhoto && refPhotoModal) {
      btnCloseRefPhoto.addEventListener('click', () => {
        refPhotoModal.classList.remove('is-active');
      });
    }

    // 3D Photos Gallery Modal (Optional)
    if (btnGalleryToggle) {
      btnGalleryToggle.addEventListener('click', () => {
        if (galleryModal) galleryModal.classList.add('is-active');
      });
    }
    if (btnCloseGallery) {
      btnCloseGallery.addEventListener('click', () => {
        if (galleryModal) galleryModal.classList.remove('is-active');
      });
    }

    // Customizer Modal (Optional)
    if (btnCustomizeToggle) {
      btnCustomizeToggle.addEventListener('click', () => {
        populateCustomizerForm(loadCardData());
        if (customizerModal) customizerModal.classList.add('is-active');
      });
    }
    if (btnCloseCustomizer) {
      btnCloseCustomizer.addEventListener('click', () => {
        if (customizerModal) customizerModal.classList.remove('is-active');
      });
    }
    if (customizerForm) customizerForm.addEventListener('submit', handleCustomizerSubmit);
    if (btnResetDefaults) btnResetDefaults.addEventListener('click', handleResetDefaults);

    // Close Modals on backdrop click
    [galleryModal, customizerModal, refPhotoModal, document.getElementById('waSenderModal')].forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('is-active');
        }
      });
    });

    // Card Actions
    if (btnShareWhatsapp) btnShareWhatsapp.addEventListener('click', shareOnWhatsApp);
    if (btnAddToCalendar) btnAddToCalendar.addEventListener('click', generateCalendarEvent);
    if (fabPrintCard) fabPrintCard.addEventListener('click', () => window.print());
    if (fabDirections) fabDirections.addEventListener('click', openVenuesMap);

    // WhatsApp Relative Sender Tool Initialization
    initWaRelativeSender();

    // 3D Perspective Tilt on Mouse and Touch
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    // Window Resize
    window.addEventListener('resize', () => {
      resizeCanvas();
    });
  }

  // =========================================================================
  // WhatsApp Relative Invite Sender by Mobile Number
  // =========================================================================
  const WA_SENT_STORAGE_KEY = 'juveriya_sent_relatives_list';

  function initWaRelativeSender() {
    const waSenderModal = document.getElementById('waSenderModal');
    const btnOpenWaSender = document.getElementById('btnOpenWaSender');
    const fabSendWa = document.getElementById('fabSendWa');
    const btnCloseWaSender = document.getElementById('btnCloseWaSender');
    const waSenderForm = document.getElementById('waSenderForm');
    const inputWaRelativeName = document.getElementById('inputWaRelativeName');
    const inputWaMobileNumber = document.getElementById('inputWaMobileNumber');
    const checkWaWithFamily = document.getElementById('checkWaWithFamily');
    const waMessagePreviewText = document.getElementById('waMessagePreviewText');
    const btnCopyWaLink = document.getElementById('btnCopyWaLink');
    const btnClearWaHistory = document.getElementById('btnClearWaHistory');

    if (!waSenderModal || !btnOpenWaSender) return;

    // Open Modal
    function openModal() {
      waSenderModal.classList.add('is-active');
      renderSentRelatives();
      updateWaMessagePreview();
      setTimeout(() => inputWaRelativeName.focus(), 250);
    }

    btnOpenWaSender.addEventListener('click', () => {
      window.location.href = 'admin.html';
    });
    if (fabSendWa) {
      fabSendWa.addEventListener('click', () => {
        window.location.href = 'admin.html';
      });
    }

    // Generate Personalized Message
    function buildPersonalizedInvite(relativeName, withFamily) {
      const data = loadCardData();
      const cleanName = relativeName.trim() || 'Saniya';
      const greeting = withFamily ? `${cleanName} with Family` : cleanName;
      
      // Determine invite URL (Always ensures a valid live web link for WhatsApp)
      let baseUrl = 'https://salmankhan080405-bot.github.io/Juveriya/';
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.protocol === 'file:';
      if (!isLocal && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
        baseUrl = window.location.origin + window.location.pathname;
      }
      const inviteUrl = withFamily 
        ? `${baseUrl}?name=${encodeURIComponent(cleanName)}&family=true` 
        : `${baseUrl}?name=${encodeURIComponent(cleanName)}`;

      const message = 
        `Dear ${greeting},\n` +
        `We warmly invite you to join us on this special occasion. 💍✨\n` +
        `Please tap the link below to view your personalized wedding invitation:\n` +
        `👉 ${inviteUrl}`;

      return { greeting, message, inviteUrl };
    }

    // Update live preview box
    function updateWaMessagePreview() {
      const name = inputWaRelativeName.value || 'Saniya';
      const withFamily = checkWaWithFamily.checked;
      const { message } = buildPersonalizedInvite(name, withFamily);
      waMessagePreviewText.textContent = message;
    }

    inputWaRelativeName.addEventListener('input', updateWaMessagePreview);
    checkWaWithFamily.addEventListener('change', updateWaMessagePreview);

    // Copy Link button
    btnCopyWaLink.addEventListener('click', () => {
      const name = inputWaRelativeName.value.trim() || 'Guest';
      const { inviteUrl } = buildPersonalizedInvite(name, checkWaWithFamily.checked);
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(inviteUrl).then(() => {
          btnCopyWaLink.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => {
            btnCopyWaLink.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Link';
          }, 2000);
        });
      } else {
        prompt('Copy your personal link:', inviteUrl);
      }
    });

    // Form Submit: Open WhatsApp and save (Debounced)
    let isSubmittingWa = false;
    waSenderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isSubmittingWa) return;

      const relativeName = inputWaRelativeName.value.trim();
      if (!relativeName) return;

      isSubmittingWa = true;
      const btnSubmit = document.getElementById('btnSubmitWaSend');
      if (btnSubmit) btnSubmit.disabled = true;

      const withFamily = checkWaWithFamily.checked;
      const { greeting, message, inviteUrl } = buildPersonalizedInvite(relativeName, withFamily);

      // Launch WhatsApp (opens contact picker immediately)
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');

      // Save to Sent Tracker
      saveSentRelative({
        name: relativeName,
        withFamily: withFamily,
        inviteUrl: inviteUrl,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      renderSentRelatives();

      setTimeout(() => {
        if (btnSubmit) btnSubmit.disabled = false;
        isSubmittingWa = false;
      }, 2500);
    });

    // Sent Tracker Storage Helpers
    function getSentRelatives() {
      try {
        const saved = localStorage.getItem(WA_SENT_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }

    function saveSentRelative(item) {
      const list = getSentRelatives();
      // Remove previous duplicate by name if present
      const filtered = list.filter(x => (x.name || '').toLowerCase() !== (item.name || '').toLowerCase());
      filtered.unshift(item); // Add to beginning
      localStorage.setItem(WA_SENT_STORAGE_KEY, JSON.stringify(filtered.slice(0, 50)));
    }

    function renderSentRelatives() {
      const list = getSentRelatives();
      const container = document.getElementById('sentRelativesList');
      const countEl = document.getElementById('sentCount');
      if (!container || !countEl) return;

      countEl.textContent = list.length;

      if (list.length === 0) {
        container.innerHTML = '<div style="color: rgba(223,183,108,0.5); font-size: 0.75rem; text-align: center; padding: 10px;">No invitations sent yet. Enter a relative name above!</div>';
        return;
      }

      container.innerHTML = list.map(item => `
        <div class="sent-relative-item">
          <div>
            <div class="sent-rel-name">${item.name} ${item.withFamily ? '<span style="font-weight: normal; font-size: 0.72rem; color: var(--color-gold-champagne);">with Family</span>' : ''}</div>
            <div class="sent-rel-phone"><i class="fa-regular fa-clock"></i> <span class="sent-rel-time">${item.date || ''}</span></div>
          </div>
          <button type="button" class="sent-rel-resend" data-name="${item.name}" data-family="${item.withFamily}">
            Resend
          </button>
        </div>
      `).join('');

      // Wire resend buttons
      container.querySelectorAll('.sent-rel-resend').forEach(btn => {
        btn.addEventListener('click', () => {
          inputWaRelativeName.value = btn.getAttribute('data-name');
          checkWaWithFamily.checked = btn.getAttribute('data-family') === 'true';
          updateWaMessagePreview();
          waSenderForm.dispatchEvent(new Event('submit'));
        });
      });
    }

    btnClearWaHistory.addEventListener('click', () => {
      if (confirm('Clear sent invitations history?')) {
        localStorage.removeItem(WA_SENT_STORAGE_KEY);
        renderSentRelatives();
      }
    });

    renderSentRelatives();
  }

  // =========================================================================
  // Bootstrap Application
  // =========================================================================
  function init() {
    const data = loadCardData();
    applyDataToCard(data);
    initParticles();
    animateParticles();
    initGuestPersonalization();
    initEvents();

    console.log('💍 Royal Islamic 3D Wedding Card initialized for Juveriya & Abdul Hadi');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
