(() => {
  'use strict';

  const DAY_OPENING_REFLECTIONS = [
    'What intention are you ready to place in the soil?',
    'What holds you steady when the ground beneath you shifts?',
    'What quiet beginning is ready to meet the light?',
    'What in you is ready to rise with quiet strength?',
    'Where might yielding become a deeper kind of strength?',
    'What within you is ready to turn toward the light?',
    'How might you bend with the wind and remain rooted?',
    'What quiet wisdom in you is asking to be seen?',
    'What horizon opens when you let yourself widen?',
  ];
  const DAY_OPENING_REFLECTION_PROMPT = 'Let the thought settle, then press Begin Practice.';

  const DAYS = [
    ['Grounding & Anchoring', 'Planting the Seed', 'Planting a purpose or intention.', 'Rest your finger on the seed, then press it gently into the soil.', 'What intention are you ready to place in the soil?', 'PRESS INTO SOIL', 'press-hold', '../assets/day-01-rooting-the-seed.webp'],
    ['Grounding & Anchoring', 'Deep Anchor', 'Building foundational strength.', 'Draw one unhurried line down the taproot’s path.', 'Strength begins below the surface.', 'DRAW DOWNWARD', 'downward-drag', '../assets/day-02-deep-anchor-match-endpoint.webp'],
    ['Grounding & Anchoring', 'First Light', 'Celebrating the first signs of visible progress.', 'Brush loose soil slowly away from around the young seedling. Every cleared pass stays open.', 'A first green sign is enough.', 'BRUSH TO REVEAL', 'soft-brush', '../assets/day-03-seedling-reveal.png'],
    ['Structuring & Stretching', 'Developing Trunk', 'Reinforcing personal structure and integrity.', 'Trace steadily upward along the forming trunk.', 'Let your structure rise from what is grounded.', 'TRACE UPWARD', 'upward-trace', '../assets/day-04-developing-trunk.webp'],
    ['Structuring & Stretching', 'Stronger Structure', 'Cultivating flexible strength.', 'Begin at the gold point. Spiral slowly upward around the young trunk.', 'Layer by layer, the young trunk finds its strength.', 'SPIRAL UPWARD', 'upward-spiral', '../assets/day-05-stronger-structure.webp'],
    ['Structuring & Stretching', 'Branching Out', 'Embracing growth and expansion.', 'Touch a branch, then sweep outward along the branch you chose.', 'There is room to extend.', 'TRACE THE BRANCHES', 'outward-sweep', '../assets/day-06-branching-out.webp'],
    ['Weathering & Completing', 'Weathering Growth', 'Mastering resilience.', 'Brush slowly left and right across the canopy. Watch the tree bend with the wind, then return.', 'Flexibility keeps the roots intact.', 'SWAY THE CANOPY', 'wind-brush', '../assets/day-07-weathering-growth.webp'],
    ['Weathering & Completing', 'Forming Features', 'Integrating wisdom and complexity.', 'Touch five warm points of sap or young cones. Each touch will reveal a quiet glow.', 'Detail holds a living history.', 'TOUCH 5 DETAILS', 'feature-touch', '../assets/day-08-forming-features.webp'],
    ['Weathering & Completing', 'Full Maturity', 'Completed growth, peace, and deep rootedness.', 'Sweep outward from the trunk to reveal the tree’s wider forest landscape.', 'You are rooted, complete, and still becoming.', 'OPEN THE FOREST', 'landscape-release', '../assets/day-09-full-maturity.webp'],
  ].map(([stage, title, intent, instruction, contemplation, prompt, gesture, image], index) => ({
    day: index + 1, stage, title, intent, instruction, contemplation, prompt, gesture, image, openingReflection: DAY_OPENING_REFLECTIONS[index],
  }));

  const COMPLETIONS = [
    ['Planted.', ''],
    ['Anchored.', 'Strength begins below the surface.'],
    ['First light.', 'A first green sign is enough.'],
    ['Steady.', 'Let your structure rise from what is grounded.'],
    ['Strengthened.', 'Layer by layer, the young trunk finds its strength.'],
    ['Opening.', 'There is room to extend.'],
    ['Resilient.', 'Flexibility keeps the roots intact.'],
    ['Forming.', 'Detail holds a living history.'],
    ['Mature.', 'You are rooted, complete, and still becoming.'],
  ];

  const DAY_SIX_BRANCHES = [
    [[.5,.47],[.43,.4],[.25,.3],[.08,.24]], [[.51,.44],[.61,.37],[.77,.25],[.93,.18]],
    [[.5,.57],[.38,.51],[.2,.46],[.06,.45]], [[.52,.57],[.66,.5],[.83,.43],[.96,.39]],
    [[.51,.68],[.4,.65],[.2,.67],[.06,.7]], [[.51,.68],[.64,.68],[.78,.72],[.93,.77]],
    [[.5,.39],[.43,.33],[.33,.24],[.25,.16]], [[.52,.51],[.67,.48],[.81,.48],[.98,.51]],
    [[.49,.62],[.4,.59],[.25,.56],[.1,.55]],
  ];
  const daySixPoint = (branch, progress) => { const t = clamp(progress); const q = 1 - t; return { x: q*q*q*branch[0][0] + 3*q*q*t*branch[1][0] + 3*q*t*t*branch[2][0] + t*t*t*branch[3][0], y: q*q*q*branch[0][1] + 3*q*q*t*branch[1][1] + 3*q*t*t*branch[2][1] + t*t*t*branch[3][1] }; };
  const DAY_TWO_ROOT_PATH = [[.5093,.2740],[.5157,.2854],[.5185,.2995],[.5213,.3177],[.5259,.3385],[.5296,.3620],[.5315,.3865],[.5333,.4115],[.5333,.4365],[.5324,.4615],[.5296,.4865],[.5259,.5104],[.5185,.5339],[.5093,.5563],[.4981,.5781],[.4852,.5979],[.4722,.6146],[.4602,.6292],[.4537,.6417],[.4574,.6510],[.4676,.6615],[.4815,.6729],[.4954,.6849],[.505,.720]];
  const DAY_THREE_VISIBLE_SOIL_CELLS = new Set([
    '3:1', '4:1', '5:1', '6:1', '7:1', '8:1',
    '2:2', '3:2', '4:2', '5:2', '6:2', '7:2', '8:2', '9:2',
    '1:3', '2:3', '3:3', '4:3', '5:3', '6:3', '7:3', '8:3', '9:3',
    '1:4', '2:4', '3:4', '4:4', '5:4', '6:4', '7:4', '8:4', '9:4',
    '1:5', '2:5', '3:5', '4:5', '5:5', '6:5', '7:5', '8:5', '9:5', '10:5',
    '1:6', '2:6', '3:6', '4:6', '5:6', '6:6', '7:6', '8:6', '9:6',
    '2:7', '3:7', '4:7', '5:7', '6:7', '7:7', '8:7',
  ]);
  const DAY_THREE_CLEAR_CELL_TARGET = Math.ceil(DAY_THREE_VISIBLE_SOIL_CELLS.size * .9);
  const DAY_FIVE_COMPLETION_THRESHOLD = .74;
  const DAY_NINE_COMPLETION_THRESHOLD = .48;
  const DAY_EIGHT_DETAILS = [
    { kind: 'needles', point: [.250, .508] },
    { kind: 'cone', point: [.426, .411] },
    { kind: 'sap', point: [.713, .372] },
    { kind: 'sap', point: [.676, .560] },
  ];
  const AMBIENCE_SOURCES = {
    roots: '../assets/audio/root-and-soil-forest-air.mp3',
    boughs: '../assets/audio/trunk-and-bough-forest-air.mp3',
    vista: '../assets/audio/weather-and-vista-forest-air.mp3',
  };
  const COIL_HAPTIC_LANDMARKS = [.18, .36, .54, .70];
  const BRANCH_HAPTIC_LANDMARKS = [.24, .48, .72];
  function projectScenePoint(point, image = elements.image) {
    const rect = elements.scene.getBoundingClientRect();
    if (!rect.width || !rect.height || !image.naturalWidth || !image.naturalHeight) return { x: point[0], y: point[1] };
    const scale = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const cropX = (renderedWidth - rect.width) / 2;
    const cropY = (renderedHeight - rect.height) / 2;
    return {
      x: (image.naturalWidth * point[0] * scale - cropX) / rect.width,
      y: (image.naturalHeight * point[1] * scale - cropY) / rect.height,
    };
  }
  function projectDayTwoPoint(point) {
    const rect = elements.scene.getBoundingClientRect();
    const image = elements.dayTwoImage;
    if (!rect.width || !rect.height || !image.naturalWidth || !image.naturalHeight) return { x: point[0], y: point[1] };
    const scale = Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const cropX = (renderedWidth - rect.width) / 2;
    const cropY = (renderedHeight - rect.height) / 2;
    return {
      x: (image.naturalWidth * point[0] * scale - cropX) / rect.width,
      y: (image.naturalHeight * point[1] * scale - cropY) / rect.height,
    };
  }
  function drawDayTwoFreehand(w, h) {
    state.dayTwoStrokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      const active = state.dayTwoActive.has(stroke.id);
      ctx.save();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = active ? 'rgba(242,224,155,.7)' : 'rgba(218,198,126,.38)';
      ctx.shadowBlur = active ? 11 : 5;
      ctx.strokeStyle = active ? 'rgba(248,232,163,.94)' : 'rgba(239,225,173,.82)';
      ctx.lineWidth = active ? 4.4 : 3.35;
      ctx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(w * point.x, h * point.y);
        else ctx.lineTo(w * point.x, h * point.y);
      });
      ctx.stroke();
      const last = stroke.points[stroke.points.length - 1];
      ctx.fillStyle = 'rgba(248,231,164,.78)';
      ctx.beginPath(); ctx.arc(w * last.x, h * last.y, active ? 3.3 : 2.15, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }
  function findDaySixBranch(x, y) { let closest = { index: -1, progress: 0, distance: Infinity }; DAY_SIX_BRANCHES.forEach((branch, index) => { for (let step = 0; step <= 44; step += 1) { const progress = step / 44; const point = daySixPoint(branch, progress); const distance = Math.hypot(x - point.x, y - point.y); if (distance < closest.distance) closest = { index, progress, distance }; } }); return closest.distance < .075 ? closest : null; }

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    scene: $('#scene'), image: $('#sceneImage'), dayTwoImage: $('#dayTwoSceneImage'), windImage: $('#windSceneImage'), buriedImage: $('#buriedSceneImage'), dayThreeSoil: $('#dayThreeSoilTexture'), canvas: $('#materialCanvas'), rail: $('#dayRail'), target: $('.seed-target'),
    stage: $('#stageText'), title: $('#titleText'), intent: $('#intentText'), instruction: $('#instructionText'),
    prompt: $('#gesturePromptText'), copy: $('#ritualCopy'), completion: $('#completionText'), assist: $('#assistButton'), returnToSeed: $('#returnToSeedButton'),
    intro: $('#dayOneIntro'), introTitle: $('#introTitle'), introIntent: $('#introIntent'), introReflection: $('#introReflection'), introReflectionPrompt: $('#introReflectionPrompt'), introDismiss: $('#introDismiss'), postBeginInstruction: $('#postBeginInstruction'), postBeginInstructionText: $('#postBeginInstructionText'),
    veil: $('#dayOneVeil'), action: $('#dayOneAction'), actionInstruction: $('#dayOneActionInstruction'), howToBegin: $('#howToBeginButton'),
    dayOneCompletion: $('#dayOneCompletion'), completionKicker: $('#completionKicker'), completionTitle: $('#completionTitle'), completionReflection: $('#completionReflection'), journeyReflection: $('#journeyReflection'), nextDay: $('#nextDayButton'), restartDay: $('#restartDayButton'), secondJourneyGuidance: $('#secondJourneyGuidance'), gestureHint: $('#gestureHint'), gestureHintText: $('#gestureHintText'),
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
    clearedSoil: new Set(),
    branchReveals: 0,
    branchTrace: 0,
    branchProgress: Array(9).fill(0),
    dayEightReveals: new Set(),
    dayEightHintStartedAt: 0,
    dayTwoStrokes: [],
    dayTwoActive: new Map(),
    daySixStrokes: [],
    daySixActive: new Map(),
    windLean: 0,
    windVelocity: 0,
    pendingCompletion: false,
    completionTimer: null,
    burialStartedAt: 0,
    seedPoint: { x: 0.51, y: 0.562 },
    sound: localStorage.getItem('pine-review-sound') === 'on',
    haptics: localStorage.getItem('pine-review-haptics') || 'subtle',
    reducedMotion: localStorage.getItem('pine-review-motion') === 'on',
    lastTick: performance.now(),
    lastHaptic: 0,
    audio: null,
    ambience: { players: new Map(), active: null, unlocked: false, fadeFrame: 0 },
    tactileMarks: new Set(),
    firstTouchAcknowledged: false,
    panelOpen: false,
    introVisible: true,
    postBeginInstructionVisible: false,
    veilLifted: false,
    introTimer: null,
    quality: window.devicePixelRatio > 2 ? 'standard' : 'high',
  };
  localStorage.removeItem('pine-review-stream');
  localStorage.removeItem('pine-review-personal-unlocked');
  localStorage.removeItem('pine-review-personal-story');
  let dayTransitionToken = 0;
  let pendingDayTransition = null;
  const warmedSceneTransitions = new Map();

  function clamp(value, min = 0, max = 1) { return Math.max(min, Math.min(max, value)); }
  function completionThreshold() { if (state.day === 5) return DAY_FIVE_COMPLETION_THRESHOLD; return state.day === 9 ? DAY_NINE_COMPLETION_THRESHOLD : .999; }

  function restartJourney() {
    state.completed.clear();
    persist();
    setDay(1);
  }
  function resetToDayOne() {
    state.completed.clear();
    persist();
    setDay(1);
  }

  function activatePrimaryControl(button) {
    if (button.dataset.day) return setDay(Number(button.dataset.day));
    switch (button.id) {
      case 'assistButton': return assistedAdvance();
      case 'nextDayButton': return state.day < 9 ? setDay(state.day + 1) : restartJourney();
      case 'restartDayButton': return restartJourney();
      case 'returnToSeedButton': return restartJourney();
      case 'introDismiss': return dismissIntro();
      case 'howToBeginButton': return liftVeil();
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
    state.clearedSoil = new Set();
    state.branchReveals = 0;
    state.branchTrace = 0;
    state.branchProgress = Array(9).fill(0);
    state.dayEightReveals.clear();
    state.dayEightHintStartedAt = 0;
    state.dayTwoStrokes = [];
    state.dayTwoActive.clear();
    state.daySixStrokes = [];
    state.daySixActive.clear();
    state.windLean = 0;
    state.windVelocity = 0;
    elements.windImage.style.transform = '';
    state.pendingCompletion = false;
    clearTimeout(state.completionTimer); state.completionTimer = null;
    state.burialStartedAt = 0;
    state.tactileMarks.clear();
    state.firstTouchAcknowledged = false;
    state.postBeginInstructionVisible = false;
    state.veilLifted = false;
    elements.scene.classList.remove('day-one-complete', 'day-one-buried', 'practice-complete');
    elements.copy.classList.remove('completed'); elements.completion.textContent = '';
  }
  function current() { return DAYS[state.day - 1]; }

  function showCompletionState() {
    const [title, reflection] = COMPLETIONS[state.day - 1];
    const next = DAYS[state.day];
    elements.completionKicker.textContent = `DAY ${String(state.day).padStart(2, '0')} COMPLETE`;
    elements.completionTitle.textContent = title;
    elements.completionReflection.textContent = reflection;
    elements.completionReflection.hidden = !reflection;
    elements.journeyReflection.hidden = state.day !== 9;
    elements.nextDay.disabled = false;
    elements.nextDay.textContent = next ? `CONTINUE TO ${next.title.toUpperCase()}` : 'RETURN TO DAY 1';
    elements.restartDay.textContent = state.day === 1 ? 'START AGAIN AT DAY 1' : 'START THE JOURNEY AGAIN';
    elements.scene.classList.add('practice-complete');
    if (state.day === 1) elements.scene.classList.add('day-one-complete', 'day-one-buried');
    elements.secondJourneyGuidance.hidden = state.day !== 9;
  }

  function updateDayOneIntro() {
    const showSharedIntro = state.introVisible && state.day !== 1;
    const showVeil = state.day === 1 && state.introVisible && !state.veilLifted;
    const showAction = state.day === 1 && state.veilLifted && !state.completed.has(1);
    const showPostBeginInstruction = state.postBeginInstructionVisible && state.day !== 1 && !state.introVisible && !state.completed.has(state.day);
    elements.intro.classList.toggle('visible', showSharedIntro);
    elements.postBeginInstruction.classList.toggle('visible', showPostBeginInstruction);
    elements.scene.classList.toggle('practice-intro-open', showSharedIntro || showVeil);
    elements.scene.classList.toggle('day-one-veil-active', showVeil);
    elements.scene.classList.toggle('day-one-action-open', showAction);
    elements.veil.setAttribute('aria-hidden', String(!showVeil));
    elements.action.setAttribute('aria-hidden', String(!showAction));
    elements.postBeginInstruction.setAttribute('aria-hidden', String(!showPostBeginInstruction));
    clearTimeout(state.introTimer);
    state.introTimer = null;
  }

  function liftVeil() {
    if (state.day !== 1 || state.completed.has(1) || state.veilLifted) return;
    state.veilLifted = true;
    state.introVisible = false;
    unlockAmbience();
    updateDayOneIntro();
    requestAnimationFrame(positionSeedTarget);
  }

  function dismissIntro() {
    if (state.day === 1 && !state.veilLifted) return liftVeil();
    if (!state.introVisible) return;
    state.introVisible = false;
    unlockAmbience();
    if (state.day !== 1) state.postBeginInstructionVisible = true;
    if (state.day === 8) state.dayEightHintStartedAt = performance.now();
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

  function sceneImageSource(config) { return `${config.image}?v=20260821-day2-root-match-2`; }

  function warmSceneTransition(nextDay) {
    if (nextDay < 1 || nextDay > DAYS.length) return null;
    const existing = warmedSceneTransitions.get(nextDay);
    if (existing) return existing;
    const nextConfig = DAYS.find((entry) => entry.day === nextDay);
    const preload = new Image();
    const warmed = { ready: false, promise: null };
    warmed.promise = new Promise((resolve) => {
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        warmed.ready = true;
        resolve();
      };
      const decodeAndSettle = () => {
        if (typeof preload.decode === 'function') preload.decode().catch(() => undefined).then(settle);
        else settle();
      };
      preload.addEventListener('load', decodeAndSettle, { once: true });
      preload.addEventListener('error', settle, { once: true });
      preload.src = sceneImageSource(nextConfig);
      if (preload.complete) decodeAndSettle();
    });
    warmedSceneTransitions.set(nextDay, warmed);
    return warmed;
  }

  function ambienceKeyForDay(day = state.day) { return day <= 3 ? 'roots' : day <= 6 ? 'boughs' : 'vista'; }
  function ambiencePlayer(key) {
    const existing = state.ambience.players.get(key);
    if (existing) return existing;
    const player = new Audio(AMBIENCE_SOURCES[key]);
    player.loop = true;
    player.preload = 'auto';
    player.volume = 0;
    player.setAttribute('playsinline', '');
    state.ambience.players.set(key, player);
    return player;
  }
  function fadeAmbience() {
    cancelAnimationFrame(state.ambience.fadeFrame);
    const activeKey = state.sound && state.ambience.unlocked ? state.ambience.active : null;
    const startedAt = performance.now();
    const frame = (time) => {
      const blend = clamp((time - startedAt) / 1200);
      let settling = false;
      state.ambience.players.forEach((player, key) => {
        const target = key === activeKey ? .115 : 0;
        const next = player.volume + (target - player.volume) * Math.min(1, blend * .2 + .08);
        player.volume = next;
        if (key !== activeKey && next < .004) { player.volume = 0; player.pause(); }
        if (Math.abs(target - player.volume) > .003) settling = true;
      });
      if (settling) state.ambience.fadeFrame = requestAnimationFrame(frame);
    };
    state.ambience.fadeFrame = requestAnimationFrame(frame);
  }
  function silenceAmbience() {
    cancelAnimationFrame(state.ambience.fadeFrame);
    state.ambience.active = null;
    state.ambience.players.forEach((player) => {
      player.volume = 0;
      player.pause();
      try { player.currentTime = 0; } catch (_) { /* stream may not be seekable yet */ }
    });
  }
  function unlockAmbience() {
    if (!state.sound) return;
    state.ambience.unlocked = true;
    const key = ambienceKeyForDay();
    const player = ambiencePlayer(key);
    state.ambience.active = key;
    player.play().catch(() => undefined);
    fadeAmbience();
  }
  function syncAmbienceForDay() {
    if (!state.sound || !state.ambience.unlocked) return;
    const key = ambienceKeyForDay();
    if (state.ambience.active !== key) {
      state.ambience.active = key;
      ambiencePlayer(key).play().catch(() => undefined);
    }
    fadeAmbience();
  }

  function prepareSceneTransition(nextDay) {
    if (pendingDayTransition === nextDay) return;
    const sourceDay = state.day;
    pendingDayTransition = nextDay;
    const transitionToken = ++dayTransitionToken;
    const warmed = warmSceneTransition(nextDay);
    if (warmed && !warmed.ready) {
      elements.nextDay.disabled = true;
      elements.nextDay.textContent = 'PREPARING NEXT DAY…';
    }
    const continueToNextDay = () => {
      if (transitionToken !== dayTransitionToken || pendingDayTransition !== nextDay || state.day !== sourceDay) return;
      pendingDayTransition = null;
      elements.nextDay.disabled = false;
      setDay(nextDay, true);
    };
    if (warmed) warmed.promise.then(continueToNextDay);
    else continueToNextDay();
  }

  function setDay(day, scenePrepared = false) {
    const nextDay = clamp(Math.round(day), 1, 9);
    const requiresPreparedScene = nextDay === state.day + 1 && state.day >= 1 && state.day < 9;
    if (requiresPreparedScene && !scenePrepared) {
      prepareSceneTransition(nextDay);
      return;
    }
    pendingDayTransition = null;
    dayTransitionToken += 1;
    state.day = nextDay;
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
      if (state.day === 5) state.material.bough = 1;
      if (state.day === 6) { state.branchReveals = 9; state.branchTrace = 0; state.branchProgress = Array(9).fill(1); state.material.bough = 9; }
      showCompletionState();
    }
    const config = current();
    const sceneImageSrc = sceneImageSource(config);
    elements.image.classList.remove('loaded');
    elements.image.src = sceneImageSrc;
    if (state.day === 7) {
      elements.windImage.classList.remove('loaded');
      elements.windImage.src = `${config.image}?v=20260819-late-journey-1`;
      elements.windImage.addEventListener('load', () => elements.windImage.classList.add('loaded'), { once: true });
    } else {
      elements.windImage.removeAttribute('src');
      elements.windImage.classList.remove('loaded');
      elements.windImage.style.transform = '';
    }
    if (state.day === 1) {
      elements.buriedImage.classList.remove('loaded');
      elements.buriedImage.src = '../assets/day-01-seed-buried.png?v=20260819-burial-scene-1';
      elements.buriedImage.alt = 'Day 1: planted seed beneath soil.';
      elements.buriedImage.addEventListener('load', () => elements.buriedImage.classList.add('loaded'), { once: true });
    } else {
      elements.buriedImage.removeAttribute('src');
      elements.buriedImage.removeAttribute('alt');
      elements.buriedImage.classList.remove('loaded');
    }
    elements.image.alt = '';
    elements.stage.textContent = `DAY ${String(config.day).padStart(2, '0')} · ${config.stage.toUpperCase()}`;
    elements.title.textContent = config.title;
    elements.intent.textContent = config.intent;
    elements.instruction.textContent = config.instruction;
    elements.introTitle.textContent = config.title;
    elements.introIntent.textContent = config.intent;
    elements.introReflection.textContent = config.openingReflection;
    elements.postBeginInstructionText.textContent = config.instruction;
    elements.introReflectionPrompt.textContent = state.day === 1 ? '' : DAY_OPENING_REFLECTION_PROMPT;
    if (state.day === 1) elements.actionInstruction.innerHTML = '<span>Rest your finger on the seed,</span><span>then press it gently into the soil.</span>';
    else elements.actionInstruction.textContent = config.instruction;
    elements.introDismiss.textContent = state.day === 1 ? 'BEGIN WITH THE SEED' : 'BEGIN PRACTICE';
    elements.prompt.textContent = config.prompt;
    elements.gestureHintText.textContent = config.prompt;
    elements.assist.textContent = `GUIDED ${config.prompt}`;
    elements.panelDay.textContent = `${String(config.day).padStart(2, '0')} / 09`;
    elements.image.addEventListener('load', () => { elements.image.classList.add('loaded'); requestAnimationFrame(positionSeedTarget); }, { once: true });
    requestAnimationFrame(positionSeedTarget);
    renderNavigation();
    updateDayOneIntro();
    elements.journeyReflection.hidden = true;
    elements.secondJourneyGuidance.hidden = true;
    if (state.day < DAYS.length) warmSceneTransition(state.day + 1);
    syncAmbienceForDay();
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
    state.seedPoint = { x: left / rect.width, y: top / rect.height };
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

  function applyWindTransform() {
    const sway = state.windLean * 4.1;
    const drift = state.windLean * 1.35;
    const shear = state.windLean * -.9;
    elements.windImage.style.transform = `translateX(${drift}%) rotate(${sway}deg) skewX(${shear}deg) scale(1.015)`;
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
        const rootStart = projectDayTwoPoint(DAY_TWO_ROOT_PATH[0]);
        const rootEnd = projectDayTwoPoint(DAY_TWO_ROOT_PATH[DAY_TWO_ROOT_PATH.length - 1]);
        const inRootCorridor = Math.abs(contact.x - .5) < .3 && contact.y > Math.max(-.04, rootStart.y - .035) && contact.y < Math.min(1.04, rootEnd.y + .04);
        const reachedDepth = clamp((contact.y - rootStart.y) / Math.max(.08, rootEnd.y - rootStart.y));
        if (contact.phase === 'begin' && inRootCorridor) {
          const stroke = { id: contact.id, points: [{ x: contact.x, y: contact.y }], length: 0 };
          state.dayTwoStrokes.push(stroke);
          state.dayTwoActive.set(contact.id, stroke);
        } else if (contact.phase === 'move') {
          const stroke = state.dayTwoActive.get(contact.id);
          if (stroke && inRootCorridor) {
            const prior = stroke.points[stroke.points.length - 1];
            const segment = Math.hypot(contact.x - prior.x, contact.y - prior.y);
            if (segment > .002) {
              stroke.points.push({ x: contact.x, y: contact.y });
              stroke.length += segment;
            }
          }
        } else if (contact.phase === 'end' || contact.phase === 'cancel') {
          state.dayTwoActive.delete(contact.id);
        }
        if (inRootCorridor && (contact.phase === 'begin' || dy > .002)) {
          state.material.root = Math.max(state.material.root, reachedDepth);
          state.progress = Math.max(state.progress, reachedDepth);
          if (reachedDepth >= .95) { state.progress = 1; markTactile('root-arrive', .72); }
        }
        break;
      }
      case 3: {
        const brush = Math.abs(dx) + Math.abs(dy) + Math.min(.055, Math.abs(contact.vx) * .005 + Math.abs(contact.vy) * .005);
        const inSeedlingPatch = contact.x > .17 && contact.x < .83 && contact.y > .485 && contact.y < .855;
        const beginsBrush = contact.phase === 'begin';
        const movesBrush = contact.phase === 'move' && brush > .001;
        if (inSeedlingPatch && (beginsBrush || movesBrush)) {
          const samples = beginsBrush ? 1 : Math.max(2, Math.ceil(Math.hypot(dx, dy) * 42));
          for (let index = 0; index <= samples; index += 1) {
            const amount = samples ? index / samples : 1;
            const x = contact.px + (contact.x - contact.px) * amount;
            const y = contact.py + (contact.y - contact.py) * amount;
            if (x <= .17 || x >= .83 || y <= .485 || y >= .855) continue;
            const key = `${Math.round((x - .17) / .066)}:${Math.round((y - .485) / .04625)}`;
            state.brushes.push({ x, y, radius: .065 });
            if (DAY_THREE_VISIBLE_SOIL_CELLS.has(key)) state.clearedSoil.add(key);
          }
          state.material.soil = clamp(state.clearedSoil.size / DAY_THREE_VISIBLE_SOIL_CELLS.size);
          state.material.needles = Math.max(state.material.needles, .12 + state.material.soil * .68);
          state.progress = Math.max(state.progress, clamp(state.clearedSoil.size / DAY_THREE_CLEAR_CELL_TARGET));
        }
        break;
      }
      case 4: {
        const inTrunkCorridor = Math.abs(contact.x - .5) < .25 && contact.y > .18 && contact.y < .84;
        const reachedHeight = clamp((.78 - contact.y) / .54);
        if (inTrunkCorridor && (contact.phase === 'begin' || dy < -.002)) {
          state.material.bark = Math.max(state.material.bark, reachedHeight);
          state.progress = Math.max(state.progress, reachedHeight);
          if (reachedHeight >= .95) markTactile('trunk-arrive', .68);
        }
        break;
      }
      case 5: {
        const inCoilZone = Math.abs(contact.x - .5) < .18 && contact.y > .29 && contact.y < .84;
        const coilTravel = Math.abs(dx) + Math.abs(dy);
        if (inCoilZone && contact.phase === 'move' && coilTravel > .003) {
          state.material.bough = clamp(state.material.bough + coilTravel * .34);
          state.progress = Math.max(state.progress, state.material.bough);
          COIL_HAPTIC_LANDMARKS.forEach((landmark, index) => { if (before < landmark && state.progress >= landmark) markTactile(`coil-turn-${index}`, .45, 'coil-turn'); });
        }
        break;
      }
      case 6: {
        const inCanopy = contact.x > .025 && contact.x < .975 && contact.y > .14 && contact.y < .82;
        if (contact.phase === 'begin' && inCanopy) {
          const stroke = { id: contact.id, points: [{ x: contact.x, y: contact.y }], length: 0 };
          state.daySixStrokes.push(stroke);
          state.daySixActive.set(contact.id, stroke);
        } else if (contact.phase === 'move') {
          const stroke = state.daySixActive.get(contact.id);
          if (stroke && inCanopy) {
            const prior = stroke.points[stroke.points.length - 1];
            const segment = Math.hypot(contact.x - prior.x, contact.y - prior.y);
            if (segment > .004) {
              stroke.points.push({ x: contact.x, y: contact.y });
              stroke.length += segment;
              state.material.bough = state.daySixStrokes.reduce((sum, path) => sum + path.length, 0);
              state.progress = clamp(state.material.bough / 2.45);
              BRANCH_HAPTIC_LANDMARKS.forEach((landmark, index) => { if (before < landmark && state.progress >= landmark) markTactile(`branch-waypoint-${index}`, .42, 'branch'); });
            }
          }
        } else if (contact.phase === 'end' || contact.phase === 'cancel') {
          state.daySixActive.delete(contact.id);
        }
        break;
      }
      case 7: {
        const brush = Math.abs(dx) + Math.abs(dy) + speed * .025;
        if (brush > .003) {
          state.material.wind = clamp(state.material.wind + brush * .7);
          state.progress = Math.max(state.progress, state.material.wind);
          if (Math.abs(dx) > .002) {
            state.windVelocity = 0;
            state.windLean = clamp(state.windLean + dx * 1.8, -.82, .82);
            applyWindTransform();
          }
          if (before < .76 && state.progress >= .76) markTactile('wind-crest', .56, 'wind-crest');
        }
        break;
      }
      case 8: {
        if (contact.phase !== 'begin') break;
        const targets = DAY_EIGHT_DETAILS.map(({ point }) => projectScenePoint(point));
        let closest = { index: -1, distance: Infinity };
        targets.forEach((target, index) => {
          const distance = Math.hypot(contact.x - target.x, contact.y - target.y);
          if (distance < closest.distance) closest = { index, distance };
        });
        if (closest.index >= 0 && closest.distance <= .075 && !state.dayEightReveals.has(closest.index)) {
          state.dayEightReveals.add(closest.index);
          state.material.bark = Math.max(state.material.bark, .22 + pressure * .12);
          state.progress = state.dayEightReveals.size / DAY_EIGHT_DETAILS.length;
          markTactile(`detail-found-${closest.index}`, .58, 'detail-found');
        }
        break;
      }
      case 9: { const out = Math.abs(dx) + Math.abs(dy) + speed * .03; state.progress = clamp(state.progress + out * .32); break; }
    }
    if (!state.firstTouchAcknowledged && (state.progress > before + .015 || contact.phase === 'begin')) {
      state.firstTouchAcknowledged = true;
      markTactile('first-touch', Math.max(move, speed, .18), 'first-touch');
    }
    if (state.progress >= completionThreshold()) queueCompletion();
  }

  function queueCompletion() {
    if (state.completed.has(state.day) || state.pendingCompletion) return;
    state.pendingCompletion = true;
    if (state.day === 1) { state.burialStartedAt = performance.now(); elements.scene.classList.add('day-one-buried'); }
    elements.scene.classList.add('settling-completion');
    if (!state.contacts.size) scheduleCompletion();
  }

  function scheduleCompletion() {
    if (!state.pendingCompletion || state.contacts.size) return;
    clearTimeout(state.completionTimer);
    state.completionTimer = setTimeout(() => {
      if (!state.pendingCompletion || state.contacts.size) return;
      state.pendingCompletion = false;
      elements.scene.classList.remove('settling-completion');
      completeDay();
    }, state.day === 1 ? (state.reducedMotion ? 700 : 1850) : (state.reducedMotion ? 220 : 620));
  }

  function assistedAdvance() {
    state.progress = clamp(state.progress + .16); state.material.soil = Math.max(state.material.soil, state.progress * .75); state.material.root = Math.max(state.material.root, state.progress * .75); state.material.bark = Math.max(state.material.bark, state.progress * .35); state.material.bough = Math.max(state.material.bough, state.progress * .3); state.material.needles = Math.max(state.material.needles, .16 + state.progress * .18);
    markTactile('guided-movement', .35, 'first-touch'); if (state.progress >= completionThreshold()) queueCompletion();
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
    elements.scene.classList.remove('settling-completion');
    showCompletionState();
    if (newlyCompleted) markTactile(`day-${state.day}-completion`, .9, 'completion');
  }

  function markTactile(mark, strength = .5, kind = mark) {
    if (state.tactileMarks.has(mark)) return;
    state.tactileMarks.add(mark);
    if (state.sound) playTone(kind, strength);
    if (state.haptics === 'off' || !navigator.vibrate) return;
    const now = performance.now();
    if (now - state.lastHaptic < 105 && kind !== 'completion') return;
    state.lastHaptic = now;
    const factor = state.haptics === 'on' ? 1 : .62;
    const pulse = Math.max(5, Math.round((9 + strength * 13) * factor));
    let pattern = [pulse];
    if (kind === 'detail-found') pattern = [pulse, 34, pulse];
    if (kind === 'wind-crest') pattern = [pulse + 4, 48, pulse];
    if (kind === 'completion') pattern = state.day === 9 ? [pulse + 9, 64, pulse + 3] : [pulse + 4];
    try { navigator.vibrate(pattern); } catch (_) { /* visual feedback remains */ }
  }

  function playTone(kind, strength) {
    try {
      const Context = window.AudioContext || window.webkitAudioContext; if (!Context) return;
      state.audio ||= new Context(); if (state.audio.state === 'suspended') state.audio.resume();
      const now = state.audio.currentTime;
      const profiles = {
        'first-touch': { base: 112, end: 92, type: 'sine', duration: .18 },
        'root-arrive': { base: 74, end: 54, type: 'sine', duration: .34 },
        'trunk-arrive': { base: 132, end: 104, type: 'triangle', duration: .28 },
        'coil-turn': { base: 168, end: 142, type: 'triangle', duration: .19 },
        branch: { base: 196, end: 240, type: 'sine', duration: .21 },
        'wind-crest': { base: 224, end: 176, type: 'triangle', duration: .32 },
        'detail-found': { base: 318, end: 372, type: 'sine', duration: .23 },
        completion: { base: state.day >= 7 ? 212 : state.day <= 2 ? 86 : 144, end: state.day >= 7 ? 318 : state.day <= 2 ? 66 : 196, type: 'sine', duration: state.day === 9 ? .62 : .38 },
      };
      const profile = profiles[kind] || profiles['first-touch'];
      const oscillator = state.audio.createOscillator();
      const gain = state.audio.createGain();
      oscillator.type = profile.type;
      oscillator.frequency.setValueAtTime(profile.base, now);
      oscillator.frequency.exponentialRampToValueAtTime(profile.end, now + profile.duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.0105 * strength, now + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + profile.duration);
      oscillator.connect(gain).connect(state.audio.destination);
      oscillator.start(now); oscillator.stop(now + profile.duration + .02);
      if (kind === 'completion' && state.day === 9) {
        const overtone = state.audio.createOscillator(); const overtoneGain = state.audio.createGain();
        overtone.type = 'sine'; overtone.frequency.setValueAtTime(profile.base * 1.5, now + .16);
        overtoneGain.gain.setValueAtTime(.0001, now); overtoneGain.gain.exponentialRampToValueAtTime(.0045, now + .2); overtoneGain.gain.exponentialRampToValueAtTime(.0001, now + .66);
        overtone.connect(overtoneGain).connect(state.audio.destination); overtone.start(now + .15); overtone.stop(now + .7);
      }
    } catch (_) { /* browser may block audio; stay silent */ }
  }

  function advanceStationarySeedHold(timestamp) {
    if (state.day !== 1 || state.completed.has(1) || state.contacts.size === 0) return;
    const contact = state.contacts.values().next().value;
    const elapsed = Math.max(contact.duration, contact.duration + Math.max(0, timestamp - contact.timestamp));
    const hold = clamp(elapsed / 3200);
    state.material.soil = Math.max(state.material.soil, hold * (.56 + (contact.pressure || .42) * .3));
    state.progress = Math.max(state.progress, hold);
    if (state.progress >= completionThreshold()) queueCompletion();
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
    if (state.day === 7 && !state.reducedMotion) {
      state.windLean *= Math.pow(.955, scale);
      applyWindTransform();
    } else if (state.day !== 7) {
      elements.windImage.style.transform = '';
    }
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
      const r = Math.max(35, w * (.055 + m.soil * .075)); const x = w * state.seedPoint.x; const y = h * state.seedPoint.y;
      if (!state.pendingCompletion && !state.completed.has(1)) { const g = ctx.createRadialGradient(x, y, 3, x, y, r); g.addColorStop(0, `rgba(214,183,118,${m.soil * .28})`); g.addColorStop(.7, `rgba(25,62,37,${m.soil * .19})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r, r * .58, 0, 0, Math.PI * 2); ctx.fill(); }

    } else if (state.day === 2 && !state.introVisible) {
      drawDayTwoFreehand(w, h);
    } else if (state.day === 3 && (!state.completed.has(3) || state.brushes.length)) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      const soilTexture = elements.dayThreeSoil;
      if (soilTexture && soilTexture.complete && soilTexture.naturalWidth) {
        ctx.drawImage(soilTexture, w * .17, h * .485, w * .66, h * .37);
      } else {
      ctx.fillStyle = 'rgba(42,29,17,.97)';
      ctx.beginPath();
      for (let i = 0; i <= 30; i += 1) {
        const angle = (i / 30) * Math.PI * 2;
        const wobble = .84 + (((i * 37) % 19) / 100);
        const px = w * .5 + Math.cos(angle) * w * .275 * wobble;
        const py = h * .67 + Math.sin(angle) * h * .165 * (1.02 + (((i * 17) % 13) / 100));
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      for (let i = 0; i < 188; i += 1) {
        const dx = (((i * 47) % 211) / 105) - 1;
        const dy = (((i * 83) % 211) / 105) - 1;
        if (dx * dx + dy * dy > 1) continue;
        const px = w * (.5 + dx * .255); const py = h * (.67 + dy * .14);
        const size = .72 + (i % 7) * .38;
        ctx.fillStyle = i % 5 === 0 ? 'rgba(116,83,46,.34)' : i % 5 === 1 ? 'rgba(76,52,28,.46)' : i % 5 === 2 ? 'rgba(48,34,20,.58)' : 'rgba(24,21,14,.7)';
        ctx.beginPath(); ctx.ellipse(px, py, size * (1.25 + (i % 3) * .28), size * (.78 + (i % 2) * .18), (i % 9) * .32, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 46; i += 1) {
        const dx = (((i * 29) % 113) / 56) - 1; const dy = (((i * 43) % 113) / 56) - 1;
        if (dx * dx + dy * dy > .93) continue;
        const px = w * (.5 + dx * .238); const py = h * (.67 + dy * .132); const size = 2.1 + (i % 6) * 1.18;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(20,16,11,.86)' : i % 3 === 1 ? 'rgba(76,50,27,.66)' : 'rgba(116,78,42,.44)';
        ctx.beginPath(); ctx.ellipse(px, py, size * (1.25 + (i % 3) * .25), size, (i % 6) * .46, 0, Math.PI * 2); ctx.fill();
      }
      }
      ctx.globalCompositeOperation = 'destination-out';
      state.brushes.forEach(({ x, y, radius }) => { const clear = ctx.createRadialGradient(w * x, h * y, 2, w * x, h * y, Math.min(w, h) * radius); clear.addColorStop(0, 'rgba(0,0,0,1)'); clear.addColorStop(.68, 'rgba(0,0,0,.92)'); clear.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = clear; ctx.beginPath(); ctx.arc(w * x, h * y, Math.min(w, h) * radius, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
    } else if (state.day === 4) {
      ctx.strokeStyle = `rgba(211,181,111,${.18 + state.progress * .5})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * .5, h * .77); ctx.quadraticCurveTo(w * .48, h * .58, w * .51, h * (.76 - state.progress * .45)); ctx.stroke();
    } else if (state.day === 5) {
      const loops = 4; const steps = 160; const thetaAt = (p) => p * Math.PI * 2 * loops; const radiusAt = (p) => w * (.112 - p * .027); const xAt = (p) => w * .5 + Math.cos(thetaAt(p)) * radiusAt(p); const yAt = (p) => h * (.78 - p * .43) + Math.sin(thetaAt(p)) * h * .034; const pulse = state.reducedMotion ? 0 : (Math.sin(t / 560) + 1) * .5; const progress = Math.max(state.material.bough, state.progress);
      const drawCoil = (limit, completed, front) => { for (let step = 0; step < Math.ceil(steps * limit); step += 1) { const p0 = step / steps; const p1 = Math.min(limit, (step + 1) / steps); const mid = (thetaAt(p0) + thetaAt(p1)) / 2; const isFront = Math.sin(mid) > 0; if (isFront !== front) continue; ctx.setLineDash(front ? [] : [2, 2]); ctx.lineWidth = front ? (completed ? 4.2 : 2.9) : (completed ? 3.2 : 2.45); ctx.strokeStyle = front ? `rgba(245,226,158,${completed ? .86 : .58 + pulse * .16})` : `rgba(231,208,138,${completed ? .79 : .7 + pulse * .08})`; ctx.beginPath(); ctx.moveTo(xAt(p0), yAt(p0)); ctx.lineTo(xAt(p1), yAt(p1)); ctx.stroke(); } };
      ctx.save(); ctx.lineCap = 'round'; drawCoil(1, false, false); drawCoil(1, false, true); if (progress > 0) { drawCoil(progress, true, false); drawCoil(progress, true, true); }
      const startGlow = ctx.createRadialGradient(xAt(0), yAt(0), 2, xAt(0), yAt(0), 17 + pulse * 5); startGlow.addColorStop(0, 'rgba(245,230,169,.98)'); startGlow.addColorStop(.22, 'rgba(219,193,112,.86)'); startGlow.addColorStop(1, 'rgba(219,193,112,0)'); ctx.fillStyle = startGlow; ctx.beginPath(); ctx.arc(xAt(0), yAt(0), 19 + pulse * 4, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else if (state.day === 6) {
      state.daySixStrokes.forEach((stroke, index) => {
        if (stroke.points.length < 2) return;
        const active = state.daySixActive.has(stroke.id);
        ctx.save();
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = active ? 'rgba(238,220,143,.72)' : 'rgba(216,196,110,.4)';
        ctx.shadowBlur = active ? 12 : 6;
        ctx.strokeStyle = active ? 'rgba(248,232,163,.92)' : `rgba(224,207,126,${.48 + Math.min(.3, stroke.length * .12)})`;
        ctx.lineWidth = active ? 4.3 : 3.15;
        ctx.beginPath();
        stroke.points.forEach((point, pointIndex) => { if (pointIndex === 0) ctx.moveTo(w * point.x, h * point.y); else ctx.lineTo(w * point.x, h * point.y); });
        ctx.stroke();
        const last = stroke.points[stroke.points.length - 1];
        ctx.fillStyle = 'rgba(247,230,158,.8)'; ctx.beginPath(); ctx.arc(w * last.x, h * last.y, active ? 3.6 : 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    } else if (state.day === 8) {
      const targets = DAY_EIGHT_DETAILS.map(({ point }) => projectScenePoint(point));
      const hintStartedAt = state.dayEightHintStartedAt || t;
      targets.forEach(({ x, y }, index) => {
        const revealed = state.dayEightReveals.has(index);
        const arrival = clamp((t - hintStartedAt - index * 180) / 620);
        const breath = state.reducedMotion ? .45 : (Math.sin((t - hintStartedAt) / 680 - index * .78) + 1) * .5;
        const hintStrength = revealed ? 0 : arrival * (.34 + breath * .38);
        const ringRadius = revealed ? 13.5 : 12 + arrival * (1.2 + breath * 1.2);
        ctx.strokeStyle = revealed ? 'rgba(240,214,134,.9)' : `rgba(222,196,110,${.28 + hintStrength})`;
        ctx.lineWidth = revealed ? 1.7 : 1 + arrival * .45;
        ctx.beginPath(); ctx.arc(w * x, h * y, ringRadius, 0, Math.PI * 2); ctx.stroke();
        const haloRadius = revealed ? 38 : 22 + arrival * (13 + breath * 8);
        const haloAlpha = revealed ? .82 : hintStrength * .58;
        if (haloAlpha > .01) {
          const glow = ctx.createRadialGradient(w * x, h * y, 0, w * x, h * y, haloRadius);
          glow.addColorStop(0, `rgba(247,221,144,${haloAlpha})`); glow.addColorStop(.32, `rgba(216,177,91,${haloAlpha * .46})`); glow.addColorStop(1, 'rgba(216,177,91,0)');
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(w * x, h * y, haloRadius, 0, Math.PI * 2); ctx.fill();
        }
      });
    } else if (state.day === 9) {
      const reveal = clamp(state.progress / DAY_NINE_COMPLETION_THRESHOLD);
      const centreX = w * .53;
      const centreY = h * .53;
      const sceneRadius = Math.hypot(w, h) * (.17 + reveal * .92);
      ctx.fillStyle = 'rgba(3, 21, 15, .84)';
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      const opening = ctx.createRadialGradient(centreX, centreY, sceneRadius * .54, centreX, centreY, sceneRadius);
      opening.addColorStop(0, 'rgba(0,0,0,.99)');
      opening.addColorStop(.72, 'rgba(0,0,0,.92)');
      opening.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = opening;
      ctx.beginPath();
      ctx.arc(centreX, centreY, sceneRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
    const preserveControls = (event) => Boolean(event.target.closest('button, input'));
    const blockNativeSceneGesture = (event) => { if (!preserveControls(event)) event.preventDefault(); };
    elements.scene.addEventListener('contextmenu', blockNativeSceneGesture);
    elements.scene.addEventListener('dragstart', blockNativeSceneGesture);
    elements.scene.addEventListener('selectstart', blockNativeSceneGesture);
    elements.scene.addEventListener('touchstart', blockNativeSceneGesture, { passive: false });
    elements.scene.addEventListener('touchmove', blockNativeSceneGesture, { passive: false });
    elements.scene.addEventListener('pointerdown', (event) => { if (state.panelOpen || preserveControls(event)) return; event.preventDefault(); if (state.day === 1 && state.introVisible && !state.veilLifted) return; unlockAmbience(); try { elements.scene.setPointerCapture?.(event.pointerId); } catch (_) { /* synthetic or unsupported capture: continue with the contact */ } const c = contactFrom(event, 'begin'); contactResponse(c); });
    elements.scene.addEventListener('pointermove', (event) => { if (!state.contacts.has(event.pointerId)) return; const c = contactFrom(event, 'move'); contactResponse(c); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => elements.scene.addEventListener(name, (event) => { if (!state.contacts.has(event.pointerId)) return; const c = contactFrom(event, name === 'pointercancel' ? 'cancel' : 'end'); contactResponse(c); if (!state.contacts.size && state.pendingCompletion) scheduleCompletion(); }));
    bindPrimaryControls();
    window.addEventListener('resize', resize);
  }
  function toggleSound() { state.sound = !state.sound; if (state.sound) unlockAmbience(); else silenceAmbience(); updateSettings(); persist(); }
  function updateSettings() {
    elements.sound.textContent = `SOUND ${state.sound ? 'ON' : 'OFF'}`; elements.sound.setAttribute('aria-pressed', String(state.sound));
    elements.panelSound.textContent = state.sound ? 'ON' : 'OFF'; elements.panelSound.setAttribute('aria-pressed', String(state.sound));
    elements.haptic.textContent = state.haptics.toUpperCase(); elements.haptic.classList.toggle('active', state.haptics !== 'off');
    elements.motion.textContent = state.reducedMotion ? 'ON' : 'OFF'; elements.motion.setAttribute('aria-pressed', String(state.reducedMotion));
  }

  window.PineReview = { setDay, assistedAdvance, dismissIntro, liftVeil, getState: () => ({ day: state.day, progress: state.progress, completed: [...state.completed], contacts: state.contacts.size, introVisible: state.introVisible, veilLifted: state.veilLifted }), reset: () => { state.completed.clear(); resetMaterial(); persist(); renderNavigation(); } };
  bind(); resize(); updateSettings(); setDay(1); requestAnimationFrame(draw);
})();
