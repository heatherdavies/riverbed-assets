(() => {
  'use strict';

  const DAYS = [
    ['Grounding & Anchoring', 'Rooting the Seed', 'Planting a purpose or intention.', 'Rest your finger on the seed, then press slowly until the soil yields.', 'What is ready to take root, quietly and without force?', 'REST & HOLD', 'press-hold', '../assets/day-01-rooting-the-seed.webp'],
    ['Grounding & Anchoring', 'Deep Anchor', 'Building foundational strength.', 'Draw one unhurried line down the taproot’s path.', 'Strength begins below the surface.', 'DRAW DOWNWARD', 'downward-drag', '../assets/day-02-deep-anchor.webp'],
    ['Grounding & Anchoring', 'First Light', 'Celebrating the first signs of visible progress.', 'Brush loose soil softly away from the new needles.', 'A first green sign is enough.', 'BRUSH SOFTLY', 'soft-brush', '../assets/day-03-first-light.webp'],
    ['Structuring & Stretching', 'Developing Trunk', 'Reinforcing personal structure and integrity.', 'Trace steadily upward along the forming trunk.', 'Let your structure rise from what is grounded.', 'TRACE UPWARD', 'upward-trace', '../assets/day-04-developing-trunk.webp'],
    ['Structuring & Stretching', 'Stronger Structure', 'Cultivating flexible strength.', 'Find the small ring of branches around the young trunk. Place two fingers there, then draw one slow circle.', 'Strength can remain responsive.', 'CIRCLE THE BRANCH CLUSTER', 'two-finger-circle', '../assets/day-05-stronger-structure.webp'],
    ['Structuring & Stretching', 'Branching Out', 'Embracing growth and expansion.', 'Sweep outward along the branches toward the light.', 'There is room to extend.', 'SWEEP OUTWARD', 'outward-sweep', '../assets/day-06-branching-out.webp'],
    ['Weathering & Completing', 'Weathering Growth', 'Mastering resilience.', 'Move with the canopy slowly, letting it bend and return.', 'Flexibility keeps the roots intact.', 'MOVE WITH WIND', 'wind-brush', '../assets/day-07-weathering-growth.webp'],
    ['Weathering & Completing', 'Forming Features', 'Integrating wisdom and complexity.', 'Notice the sap and young cones with individual, unhurried touches.', 'Detail holds a living history.', 'NOTICE DETAIL', 'feature-touch', '../assets/day-08-forming-features.webp'],
    ['Weathering & Completing', 'Full Maturity', 'Completed growth, peace, and deep rootedness.', 'Sweep outward to open the tree into its wider landscape.', 'You are rooted, complete, and still becoming.', 'OPEN OUTWARD', 'landscape-release', '../assets/day-09-full-maturity.webp'],
  ].map(([stage, title, intent, instruction, contemplation, prompt, gesture, image], index) => ({
    day: index + 1, stage, title, intent, instruction, contemplation, prompt, gesture, image,
  }));

  const COMPLETIONS = [
    ['Rooted.', 'What is ready to take root, quietly and without force?'],
    ['Anchored.', 'Strength begins below the surface.'],
    ['First light.', 'A first green sign is enough.'],
    ['Steady.', 'Let your structure rise from what is grounded.'],
    ['Strengthening.', 'Strength can remain responsive.'],
    ['Opening.', 'There is room to extend.'],
    ['Resilient.', 'Flexibility keeps the roots intact.'],
    ['Forming.', 'Detail holds a living history.'],
    ['Mature.', 'You are rooted, complete, and still becoming.'],
  ];

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    scene: $('#scene'), image: $('#sceneImage'), canvas: $('#materialCanvas'), rail: $('#dayRail'), target: $('.seed-target'),
    stage: $('#stageText'), title: $('#titleText'), intent: $('#intentText'), instruction: $('#instructionText'),
    prompt: $('#gesturePromptText'), copy: $('#ritualCopy'), completion: $('#completionText'), assist: $('#assistButton'), returnToSeed: $('#returnToSeedButton'),
    intro: $('#dayOneIntro'), introTitle: $('#introTitle'), introIntent: $('#introIntent'), introInstruction: $('#introInstruction'), introDismiss: $('#introDismiss'),
    dayOneCompletion: $('#dayOneCompletion'), completionKicker: $('#completionKicker'), completionTitle: $('#completionTitle'), completionReflection: $('#completionReflection'), nextDay: $('#nextDayButton'), restartDay: $('#restartDayButton'), gestureHint: $('#gestureHint'), gestureHintText: $('#gestureHintText'),
    menu: $('#menuButton'), panel: $('#sidePanel'), scrim: $('#scrim'), closePanel: $('#closePanelButton'),
    journey: $('#journeyList'), panelDay: $('#panelDayValue'), sound: $('#soundButton'), panelSound: $('#panelSoundButton'),
    haptic: $('#hapticButton'), motion: $('#motionButton'), reset: $('#resetButton'), home: $('#homeButton'),
  };
  const canvas = elements.canvas;
  const ctx = canvas.getContext('2d');
  const state = {
    day: 1,
    completed: new Set(JSON.parse(localStorage.getItem('pine-review-completed') || '[]')),
    contacts: new Map(),
    progress: 0,
    material: { soil: 0, root: 0, bark: 0, bough: 0, needles: 0.12, wind: 0.1 },
    brushes: [],
    sound: localStorage.getItem('pine-review-sound') === 'on',
    haptics: localStorage.getItem('pine-review-haptics') || 'subtle',
    reducedMotion: localStorage.getItem('pine-review-motion') === 'on',
    lastTick: performance.now(),
    lastHaptic: 0,
    audio: null,
    panelOpen: false,
    introVisible: true,
    introTimer: null,
    quality: window.devicePixelRatio > 2 ? 'standard' : 'high',
  };

  function clamp(value, min = 0, max = 1) { return Math.max(min, Math.min(max, value)); }

  function resetToDayOne() {
    state.completed.clear();
    persist();
    setDay(1);
  }

  function activatePrimaryControl(button) {
    if (button.dataset.day) return setDay(Number(button.dataset.day));
    switch (button.id) {
      case 'assistButton': return assistedAdvance();
      case 'nextDayButton': return state.day < 9 ? setDay(state.day + 1) : resetToDayOne();
      case 'restartDayButton': return resetToDayOne();
      case 'returnToSeedButton': return resetToDayOne();
      case 'introDismiss': return dismissIntro();
      case 'menuButton': return setPanel(true);
      case 'closePanelButton': return closePanel();
      case 'scrim': return closePanel();
      case 'soundButton':
      case 'panelSoundButton': return toggleSound();
      case 'hapticButton': state.haptics = state.haptics === 'off' ? 'subtle' : state.haptics === 'subtle' ? 'on' : 'off'; updateSettings(); return persist();
      case 'motionButton': state.reducedMotion = !state.reducedMotion; updateSettings(); return persist();
      case 'resetButton': return resetToDayOne();
      case 'homeButton': return setDay(1);
      default: return undefined;
    }
  }

  function bindPrimaryControls() {
    const lastReleaseByButton = new WeakMap();
    const activate = (event) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !document.body.contains(button)) return;
      const now = performance.now();
      const lastRelease = lastReleaseByButton.get(button) ?? { time: -Infinity, type: '' };
      if (!(button.dataset.day || button.id)) return;
      if (event.type === 'click' && now - lastRelease.time < 750) return;
      if (event.type !== 'click' && event.type !== lastRelease.type && now - lastRelease.time < 80) return;
      lastReleaseByButton.set(button, { time: now, type: event.type });
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      activatePrimaryControl(button);
    };
    document.addEventListener('touchend', activate, { capture: true, passive: false });
    document.addEventListener('pointerup', activate, true);
    document.addEventListener('click', activate, true);
  }

  function persist() {
    localStorage.setItem('pine-review-completed', JSON.stringify([...state.completed]));
    localStorage.setItem('pine-review-sound', state.sound ? 'on' : 'off');
    localStorage.setItem('pine-review-haptics', state.haptics);
    localStorage.setItem('pine-review-motion', state.reducedMotion ? 'on' : 'off');
  }
  function resetMaterial() {
    state.contacts.clear(); state.progress = 0;
    state.material = { soil: 0, root: 0, bark: 0, bough: 0, needles: 0.12, wind: 0.1 };
    state.brushes = [];
    elements.scene.classList.remove('day-one-complete', 'practice-complete');
    elements.copy.classList.remove('completed'); elements.completion.textContent = '';
  }
  function current() { return DAYS[state.day - 1]; }

  function showCompletionState() {
    const [title, reflection] = COMPLETIONS[state.day - 1];
    const next = DAYS[state.day];
    elements.completionKicker.textContent = `DAY ${String(state.day).padStart(2, '0')} COMPLETE`;
    elements.completionTitle.textContent = title;
    elements.completionReflection.textContent = reflection;
    elements.nextDay.textContent = next ? `CONTINUE TO ${next.title.toUpperCase()}` : 'RETURN TO DAY 1';
    elements.restartDay.textContent = state.day === 1 ? 'START AGAIN AT DAY 1' : 'START THE JOURNEY AGAIN';
    elements.scene.classList.add('practice-complete');
    if (state.day === 1) elements.scene.classList.add('day-one-complete');
  }

  function updateDayOneIntro() {
    const show = state.introVisible;
    elements.intro.classList.toggle('visible', show);
    elements.scene.classList.toggle('practice-intro-open', show);
    clearTimeout(state.introTimer);
    state.introTimer = null;
  }

  function dismissIntro() {
    if (!state.introVisible) return;
    state.introVisible = false;
    updateDayOneIntro();
  }

  function renderNavigation() {
    elements.rail.innerHTML = DAYS.map((day) => `<button class="day-dot ${day.day === state.day ? 'active' : ''} ${state.completed.has(day.day) ? 'done' : ''}" type="button" data-day="${day.day}" aria-label="Day ${day.day}: ${day.title}${state.completed.has(day.day) ? ', completed' : ''}"></button>`).join('');
    elements.journey.innerHTML = DAYS.map((day) => {
      const active = day.day === state.day ? 'active' : '';
      const done = state.completed.has(day.day);
      return `<button type="button" class="day-button ${active}" data-day="${day.day}"><span class="day-num">${String(day.day).padStart(2, '0')}</span><span class="day-title">${day.title}</span><span class="day-state">${done ? '✓' : day.day === state.day ? 'NOW' : ''}</span></button>`;
    }).join('');
  }

  function setDay(day) {
    state.day = clamp(Math.round(day), 1, 9);
    elements.scene.dataset.day = String(state.day);
    const restoredCompletedDay = state.completed.has(state.day);
    state.introVisible = !restoredCompletedDay;
    resetMaterial();
    if (restoredCompletedDay) {
      state.progress = 1;
      if (state.day === 1) state.material.soil = .88;
      if (state.day === 2) state.material.root = 1;
      if (state.day === 3) { state.material.soil = 1; state.material.needles = .7; }
      if (state.day === 4) state.material.bark = 1;
      showCompletionState();
    }
    const config = current();
    elements.image.classList.remove('loaded');
    elements.image.src = config.image;
    elements.image.alt = `Day ${config.day}: ${config.title}.`;
    elements.stage.textContent = `DAY ${String(config.day).padStart(2, '0')} · ${config.stage.toUpperCase()}`;
    elements.title.textContent = config.title;
    elements.intent.textContent = config.intent;
    elements.instruction.textContent = config.instruction;
    elements.introTitle.textContent = config.title;
    elements.introIntent.textContent = config.intent;
    elements.introInstruction.textContent = config.instruction;
    elements.introDismiss.textContent = state.day === 1 ? 'BEGIN WITH THE SEED' : 'BEGIN PRACTICE';
    elements.prompt.textContent = config.prompt;
    elements.gestureHintText.textContent = config.prompt;
    elements.assist.textContent = `GUIDED ${config.prompt}`;
    elements.panelDay.textContent = `${String(config.day).padStart(2, '0')} / 09`;
    elements.image.addEventListener('load', () => { elements.image.classList.add('loaded'); requestAnimationFrame(positionSeedTarget); }, { once: true });
    requestAnimationFrame(positionSeedTarget);
    renderNavigation();
    updateDayOneIntro();
    closePanel();
  }

  function setPanel(open) {
    state.panelOpen = open;
    elements.panel.classList.toggle('open', open); elements.scrim.classList.toggle('open', open);
    elements.panel.setAttribute('aria-hidden', String(!open)); elements.menu.setAttribute('aria-expanded', String(open));
  }
  function closePanel() { setPanel(false); }

  const DAY_ONE_SEED = { x: 0.51, y: 0.562 };

  function positionSeedTarget() {
    if (state.day !== 1 || !elements.image.naturalWidth || !elements.image.naturalHeight) return;
    const rect = elements.scene.getBoundingClientRect();
    const scale = Math.max(rect.width / elements.image.naturalWidth, rect.height / elements.image.naturalHeight);
    const renderedWidth = elements.image.naturalWidth * scale;
    const renderedHeight = elements.image.naturalHeight * scale;
    const cropX = (renderedWidth - rect.width) / 2;
    const cropY = (renderedHeight - rect.height) / 2;
    const left = elements.image.naturalWidth * DAY_ONE_SEED.x * scale - cropX;
    const top = elements.image.naturalHeight * DAY_ONE_SEED.y * scale - cropY;
    elements.target.style.left = `${left}px`;
    elements.target.style.top = `${top}px`;
  }

  function resize() {
    const rect = elements.scene.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, state.quality === 'high' ? 1.65 : 1.25);
    canvas.width = Math.max(1, Math.round(rect.width * scale)); canvas.height = Math.max(1, Math.round(rect.height * scale));
    canvas.style.width = `${rect.width}px`; canvas.style.height = `${rect.height}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    positionSeedTarget();
  }

  function contactFrom(event, phase) {
    const rect = elements.scene.getBoundingClientRect();
    const now = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
    const x = clamp((event.clientX - rect.left) / rect.width);
    const y = clamp((event.clientY - rect.top) / rect.height);
    const prior = state.contacts.get(event.pointerId);
    const px = prior?.x ?? x; const py = prior?.y ?? y;
    const elapsed = Math.max(1, now - (prior?.timestamp || now));
    const contact = { id: event.pointerId, phase, x, y, px, py, vx: (x - px) / elapsed * 1000, vy: (y - py) / elapsed * 1000, duration: (prior?.duration || 0) + (prior ? elapsed : 0), timestamp: now, pressure: event.pressure > 0 ? event.pressure : undefined };
    if (phase === 'end' || phase === 'cancel') state.contacts.delete(event.pointerId); else state.contacts.set(event.pointerId, contact);
    return contact;
  }

  function contactResponse(contact) {
    const dx = contact.x - contact.px; const dy = contact.y - contact.py;
    const speed = clamp(Math.hypot(contact.vx, contact.vy) * 0.45);
    const move = clamp(Math.hypot(dx, dy) * 3.4);
    const pressure = clamp(contact.pressure || 0.42);
    let before = state.progress;
    switch (state.day) {
      case 1: {
        const hold = clamp(contact.duration / 3200);
        state.material.soil = Math.max(state.material.soil, hold * (.56 + pressure * .3)); state.progress = Math.max(state.progress, hold); break;
      }
      case 2: {
        const inRootCorridor = Math.abs(contact.x - .5) < .3 && contact.y > .27 && contact.y < .9;
        const reachedDepth = clamp((contact.y - .29) / .58);
        if (inRootCorridor && (contact.phase === 'begin' || dy > .002)) {
          state.material.root = Math.max(state.material.root, reachedDepth);
          state.progress = Math.max(state.progress, reachedDepth);
        }
        break;
      }
      case 3: {
        const brush = Math.abs(dx) + Math.abs(dy) + Math.min(.055, Math.abs(contact.vx) * .005 + Math.abs(contact.vy) * .005);
        if (brush > .002 && contact.phase === 'move') {
          state.brushes.push({ x: contact.x, y: contact.y, radius: .09 });
          if (state.brushes.length > 72) state.brushes.shift();
          state.material.soil = clamp(state.material.soil + brush * .82);
          state.material.needles = Math.max(state.material.needles, .12 + state.material.soil * .68);
          state.progress = Math.max(state.progress, state.material.soil);
        }
        break;
      }
      case 4: {
        const inTrunkCorridor = Math.abs(contact.x - .5) < .25 && contact.y > .18 && contact.y < .84;
        const reachedHeight = clamp((.78 - contact.y) / .54);
        if (inTrunkCorridor && (contact.phase === 'begin' || dy < -.002)) {
          state.material.bark = Math.max(state.material.bark, reachedHeight);
          state.progress = Math.max(state.progress, reachedHeight);
        }
        break;
      }
      case 5: { const energy = move + Math.min(.14, speed * .1); state.material.bough = Math.max(state.material.bough, energy * .85); state.progress = clamp(state.progress + energy * .2); break; }
      case 6: { const out = Math.max(0, dx) + Math.max(0, contact.vx) * .014; state.material.bough = clamp(state.material.bough + out * 1.25); state.material.needles = Math.max(state.material.needles, .17 + out * .45); state.progress = clamp(state.progress + out * 1.2); break; }
      case 7: { const brush = Math.abs(dx) + Math.abs(dy) + speed * .05; state.material.bough = Math.max(state.material.bough, brush * .52); state.material.wind = Math.max(state.material.wind, .08 + brush * .36); state.progress = clamp(state.progress + brush * .62); break; }
      case 8: { if (contact.phase === 'begin') { state.material.bark = Math.max(state.material.bark, .22 + pressure * .12); state.progress = clamp(state.progress + .16); } break; }
      case 9: { const release = Math.max(0, dx) + Math.max(0, contact.vx) * .017; state.material.bough = Math.max(state.material.bough, release * .2); state.progress = clamp(state.progress + release * 1.05); break; }
    }
    if (state.progress > before + .015 || contact.phase === 'begin') respond('contact', Math.max(move, speed, .18));
    if (state.progress >= .999) completeDay();
  }

  function assistedAdvance() {
    state.progress = clamp(state.progress + .16); state.material.soil = Math.max(state.material.soil, state.progress * .75); state.material.root = Math.max(state.material.root, state.progress * .75); state.material.bark = Math.max(state.material.bark, state.progress * .35); state.material.bough = Math.max(state.material.bough, state.progress * .3); state.material.needles = Math.max(state.material.needles, .16 + state.progress * .18);
    respond('movement', .35); if (state.progress >= .999) completeDay();
  }

  function completeDay() {
    const newlyCompleted = !state.completed.has(state.day);
    state.progress = 1;
    if (newlyCompleted) {
      state.completed.add(state.day);
      persist();
      renderNavigation();
    }
    if (state.day === 1) state.material.soil = 1;
    if (state.day === 2) state.material.root = 1;
    if (state.day === 3) { state.material.soil = 1; state.material.needles = .7; }
    if (state.day === 4) state.material.bark = 1;
    showCompletionState();
    if (newlyCompleted) respond('completion', .9);
  }

  function respond(kind, strength) {
    if (state.sound) playTone(kind, strength);
    if (state.haptics === 'off' || !navigator.vibrate) return;
    const now = performance.now(); if (now - state.lastHaptic < 115 && kind !== 'completion') return;
    state.lastHaptic = now;
    const day = state.day; const base = day <= 2 ? 17 : day <= 6 ? 10 : 7; const factor = state.haptics === 'on' ? 1 : .64;
    const duration = Math.max(5, Math.round(base * factor * (.75 + strength)));
    try { navigator.vibrate(kind === 'completion' ? [duration + 13, 40, duration] : [duration]); } catch (_) { /* visual feedback remains */ }
  }

  function playTone(kind, strength) {
    try {
      const Context = window.AudioContext || window.webkitAudioContext; if (!Context) return;
      state.audio ||= new Context(); if (state.audio.state === 'suspended') state.audio.resume();
      const now = state.audio.currentTime; const oscillator = state.audio.createOscillator(); const gain = state.audio.createGain();
      const base = state.day <= 2 ? 54 : state.day >= 7 ? 240 : 120;
      oscillator.type = state.day <= 2 ? 'sine' : state.day >= 7 ? 'triangle' : 'sine'; oscillator.frequency.setValueAtTime(base * (kind === 'completion' ? 1.5 : 1), now); oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, base * .76), now + .23);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.011 * strength, now + .02); gain.gain.exponentialRampToValueAtTime(.0001, now + .28); oscillator.connect(gain).connect(state.audio.destination); oscillator.start(now); oscillator.stop(now + .3);
    } catch (_) { /* browser may block audio; stay silent */ }
  }

  function advanceStationarySeedHold(timestamp) {
    if (state.day !== 1 || state.completed.has(1) || state.contacts.size === 0) return;
    const contact = state.contacts.values().next().value;
    const elapsed = Math.max(contact.duration, contact.duration + Math.max(0, timestamp - contact.timestamp));
    const hold = clamp(elapsed / 3200);
    state.material.soil = Math.max(state.material.soil, hold * (.56 + (contact.pressure || .42) * .3));
    state.progress = Math.max(state.progress, hold);
    if (state.progress >= .999) completeDay();
  }

  function draw(timestamp) {
    const dt = Math.min(64, timestamp - state.lastTick); state.lastTick = timestamp;
    advanceStationarySeedHold(timestamp);
    const decay = state.reducedMotion ? .08 : .045; const scale = dt / 16.667;
    const soilTarget = state.day === 1 && state.completed.has(1) ? .88 : 0;
    if (state.day !== 3) state.material.soil += (soilTarget - state.material.soil) * (state.completed.has(1) ? .09 : decay) * scale;
    if (state.day !== 4) state.material.bark += (0 - state.material.bark) * decay * scale;
    if (![5, 6, 7].includes(state.day)) state.material.bough += (0 - state.material.bough) * (decay * .58) * scale;
    if (state.day !== 2) state.material.root += (0 - state.material.root) * (decay * .2) * scale;
    const baseline = state.reducedMotion ? .025 : state.day >= 7 ? .13 : .07;
    const held = [...state.contacts.values()].some((c) => c.duration > 480);
    const needleTarget = held && state.day >= 7 ? .045 : baseline;
    state.material.wind += (baseline - state.material.wind) * .018 * scale;
    state.material.needles += (needleTarget + state.material.bough * .38 - state.material.needles) * .06 * scale;

    const width = canvas.clientWidth; const height = canvas.clientHeight; ctx.clearRect(0, 0, width, height);
    drawAtmosphere(width, height, timestamp); drawMaterial(width, height, timestamp); drawContacts(width, height, timestamp);
    requestAnimationFrame(draw);
  }

  function drawAtmosphere(w, h, t) {
    if (state.day < 7) return;
    const drift = state.reducedMotion ? 0 : Math.sin(t / 9500) * 18;
    const mist = ctx.createLinearGradient(0, h * .28, 0, h * .76);
    mist.addColorStop(0, 'rgba(175,205,192,0)'); mist.addColorStop(.45, `rgba(176,204,190,${.06 + state.material.wind * .12})`); mist.addColorStop(1, 'rgba(2,23,16,0)');
    ctx.fillStyle = mist; ctx.fillRect(drift - 20, h * .2, w + 40, h * .62);
  }

  function drawMaterial(w, h, t) {
    const m = state.material; const config = current();
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    if (state.day === 1) {
      const r = Math.max(35, w * (.08 + m.soil * .13)); const x = w * .51; const y = h * .562;
      const g = ctx.createRadialGradient(x, y, 3, x, y, r); g.addColorStop(0, `rgba(214,183,118,${m.soil * .28})`); g.addColorStop(.7, `rgba(25,62,37,${m.soil * .19})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * .58, 0, 0, Math.PI * 2); ctx.fill();
      if (state.completed.has(1)) { ctx.save(); ctx.globalCompositeOperation = 'source-over'; const soil = ctx.createRadialGradient(x, y, 2, x, y, w * .16); soil.addColorStop(0, 'rgba(24,21,15,.96)'); soil.addColorStop(.48, 'rgba(51,39,25,.8)'); soil.addColorStop(1, 'rgba(15,18,12,0)'); ctx.fillStyle = soil; ctx.beginPath(); ctx.ellipse(x, y, w * .15, w * .105, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    } else if (state.day === 2) {
      const progress = Math.max(m.root, state.progress); ctx.strokeStyle = `rgba(239,229,184,${.35 + progress * .45})`; ctx.lineWidth = 2 + progress * 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(w * .5, h * .29); const yEnd = h * (.29 + progress * .58); ctx.bezierCurveTo(w * .45, h * .46, w * .56, h * .66, w * .49, yEnd); ctx.stroke();
    } else if (state.day === 3) {
      ctx.save(); ctx.globalCompositeOperation = 'source-over'; const soilPatch = ctx.createRadialGradient(w * .5, h * .6, 8, w * .5, h * .6, Math.min(w, h) * .3); soilPatch.addColorStop(0, 'rgba(76,58,39,.88)'); soilPatch.addColorStop(.68, 'rgba(46,34,23,.78)'); soilPatch.addColorStop(1, 'rgba(20,20,13,0)'); ctx.fillStyle = soilPatch; ctx.beginPath(); ctx.ellipse(w * .5, h * .6, w * .28, h * .16, 0, 0, Math.PI * 2); ctx.fill(); for (let i = 0; i < 56; i++) { const px = w * (.3 + ((i * 37) % 100) / 250); const py = h * (.48 + ((i * 53) % 100) / 520); ctx.fillStyle = `rgba(103,79,51,${.24 + (i % 4) * .05})`; ctx.beginPath(); ctx.arc(px, py, 2 + (i % 4), 0, Math.PI * 2); ctx.fill(); } ctx.globalCompositeOperation = 'destination-out'; state.brushes.forEach(({ x, y, radius }) => { const clear = ctx.createRadialGradient(w * x, h * y, 2, w * x, h * y, Math.min(w, h) * radius); clear.addColorStop(0, 'rgba(0,0,0,.96)'); clear.addColorStop(.66, 'rgba(0,0,0,.72)'); clear.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = clear; ctx.beginPath(); ctx.arc(w * x, h * y, Math.min(w, h) * radius, 0, Math.PI * 2); ctx.fill(); }); ctx.restore(); ctx.strokeStyle = `rgba(161,207,108,${.16 + m.needles * .56})`; ctx.lineWidth = 1.35; for (let i = 0; i < 9; i++) { const nx = w * (.45 + (i % 5) * .026); const ny = h * (.61 + Math.floor(i / 5) * .025); ctx.beginPath(); ctx.moveTo(nx, ny); ctx.quadraticCurveTo(nx + (i % 2 ? 5 : -4), ny - 18 - m.needles * 24, nx + (i % 2 ? 9 : -8), ny - 31 - m.needles * 28); ctx.stroke(); }
    } else if (state.day === 4) {
      ctx.strokeStyle = `rgba(211,181,111,${.18 + state.progress * .5})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * .5, h * .77); ctx.quadraticCurveTo(w * .48, h * .58, w * .51, h * (.76 - state.progress * .45)); ctx.stroke();
    } else if (state.day === 5) {
      ctx.strokeStyle = `rgba(202,176,106,${.12 + state.progress * .36})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(w * .5, h * .51, Math.min(w, h) * (.1 + state.progress * .08), 0, Math.PI * 2); ctx.stroke();
    } else if (state.day === 6) {
      const reveal = Math.max(m.bough, state.progress);
      const branches = [
        [[.5,.47],[.43,.4],[.25,.3],[.08,.24]],
        [[.51,.44],[.61,.37],[.77,.25],[.93,.18]],
        [[.5,.57],[.38,.51],[.2,.46],[.06,.45]],
        [[.52,.57],[.66,.5],[.83,.43],[.96,.39]],
        [[.51,.68],[.64,.68],[.78,.72],[.93,.77]],
      ];
      branches.forEach((branch, index) => {
        const amount = clamp(reveal * branches.length - index);
        if (amount <= 0) return;
        ctx.strokeStyle = `rgba(224,207,126,${.16 + amount * .58})`;
        ctx.lineWidth = 1.2 + amount * 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        const steps = 28;
        for (let step = 0; step <= Math.ceil(steps * amount); step += 1) {
          const t = Math.min(1, step / steps); const q = 1 - t;
          const x = q*q*q*branch[0][0] + 3*q*q*t*branch[1][0] + 3*q*t*t*branch[2][0] + t*t*t*branch[3][0];
          const y = q*q*q*branch[0][1] + 3*q*q*t*branch[1][1] + 3*q*t*t*branch[2][1] + t*t*t*branch[3][1];
          if (step === 0) ctx.moveTo(w * x, h * y); else ctx.lineTo(w * x, h * y);
        }
        ctx.stroke();
      });
    } else if (state.day === 7) {
      ctx.strokeStyle = `rgba(199,220,196,${.07 + m.wind * .24})`; ctx.lineWidth = 1.2; const motion = state.reducedMotion ? 0 : Math.sin(t / 700) * 12; for (let i = 0; i < 8; i++) { const y = h * (.28 + i * .055); ctx.beginPath(); ctx.moveTo(w * .06 + motion, y); ctx.bezierCurveTo(w * .28, y - 10, w * .66, y + 10, w * .95 + motion, y - 4); ctx.stroke(); }
    } else if (state.day === 8) {
      const points = [[.63,.44],[.72,.56],[.48,.63],[.78,.35],[.38,.48]]; points.slice(0, Math.ceil(state.progress * 5)).forEach(([x,y], index) => { const glow = ctx.createRadialGradient(w*x,h*y,0,w*x,h*y,36); glow.addColorStop(0, `rgba(216,177,91,${.38 - index*.03})`); glow.addColorStop(1,'rgba(216,177,91,0)'); ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(w*x,h*y,36,0,Math.PI*2); ctx.fill(); });
    } else if (state.day === 9) {
      ctx.fillStyle = `rgba(227,235,222,${state.progress * .12})`; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = `rgba(235,221,169,${state.progress * .42})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(w * (.5 - state.progress * .25), h * .57); ctx.quadraticCurveTo(w*.5,h*.5,w*(.5 + state.progress*.27),h*.47); ctx.stroke();
    }
    ctx.restore();
  }

  function drawContacts(w, h, t) {
    state.contacts.forEach((contact) => {
      const x = contact.x * w; const y = contact.y * h; const pulse = state.reducedMotion ? 0 : (Math.sin(t / 220 + contact.id) + 1) * .5;
      const radius = 16 + pulse * 7;
      const g = ctx.createRadialGradient(x, y, 1, x, y, radius); g.addColorStop(0, 'rgba(241,229,182,.42)'); g.addColorStop(.5,'rgba(177,190,119,.14)'); g.addColorStop(1,'rgba(177,190,119,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,radius,0,Math.PI*2); ctx.fill();
    });
    const y = h - 22; const wProgress = w * .34; const x = (w - wProgress) / 2; ctx.fillStyle = 'rgba(242,235,205,.18)'; ctx.fillRect(x, y, wProgress, 1); ctx.fillStyle = 'rgba(201,178,104,.85)'; ctx.fillRect(x, y, wProgress * state.progress, 1.5);
  }

  function bind() {
    const preserveControls = (event) => Boolean(event.target.closest('button'));
    const blockNativeSceneGesture = (event) => { if (!preserveControls(event)) event.preventDefault(); };
    elements.scene.addEventListener('contextmenu', blockNativeSceneGesture);
    elements.scene.addEventListener('dragstart', blockNativeSceneGesture);
    elements.scene.addEventListener('selectstart', blockNativeSceneGesture);
    elements.scene.addEventListener('touchstart', blockNativeSceneGesture, { passive: false });
    elements.scene.addEventListener('touchmove', blockNativeSceneGesture, { passive: false });
    elements.scene.addEventListener('pointerdown', (event) => { if (state.panelOpen || preserveControls(event)) return; event.preventDefault(); if (state.day === 1 && state.introVisible) dismissIntro(); try { elements.scene.setPointerCapture?.(event.pointerId); } catch (_) { /* synthetic or unsupported capture: continue with the contact */ } const c = contactFrom(event, 'begin'); contactResponse(c); });
    elements.scene.addEventListener('pointermove', (event) => { if (!state.contacts.has(event.pointerId)) return; const c = contactFrom(event, 'move'); contactResponse(c); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => elements.scene.addEventListener(name, (event) => { if (!state.contacts.has(event.pointerId)) return; const c = contactFrom(event, name === 'pointercancel' ? 'cancel' : 'end'); contactResponse(c); }));
    bindPrimaryControls();
    window.addEventListener('resize', resize);
  }
  function toggleSound() { state.sound = !state.sound; updateSettings(); persist(); }
  function updateSettings() {
    elements.sound.textContent = `SOUND ${state.sound ? 'ON' : 'OFF'}`; elements.sound.setAttribute('aria-pressed', String(state.sound));
    elements.panelSound.textContent = state.sound ? 'ON' : 'OFF'; elements.panelSound.setAttribute('aria-pressed', String(state.sound));
    elements.haptic.textContent = state.haptics.toUpperCase(); elements.haptic.classList.toggle('active', state.haptics !== 'off');
    elements.motion.textContent = state.reducedMotion ? 'ON' : 'OFF'; elements.motion.setAttribute('aria-pressed', String(state.reducedMotion));
  }

  window.PineReview = { setDay, assistedAdvance, dismissIntro, getState: () => ({ day: state.day, progress: state.progress, completed: [...state.completed], contacts: state.contacts.size, introVisible: state.introVisible }), reset: () => { state.completed.clear(); resetMaterial(); persist(); renderNavigation(); } };
  bind(); resize(); updateSettings(); setDay(1); requestAnimationFrame(draw);
})();
