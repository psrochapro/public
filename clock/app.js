// ==================== STATE ====================
let currentMode = 'clock';
let activeInterval = null;

// Timer State
let timerSeconds = 0;
let isTimerRunning = false;

// Chrono State
let chronoStartTime = 0;
let chronoElapsedTime = 0;
let isChronoRunning = false;
let laps = [];

// DOM Elements
const mainDisplay = document.getElementById('main-display');
const modeLabel = document.getElementById('mode-label');
const controlsContainer = document.getElementById('controls-container');
const timerInputContainer = document.getElementById('timer-input-container');
const extraContent = document.getElementById('extra-content');

// ==================== NAVIGATION ====================
function switchMode(newMode) {
    currentMode = newMode;
    clearInterval(activeInterval);
    activeInterval = null;

    // Reset UI
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    timerInputContainer.classList.add('hidden');
    extraContent.innerHTML = '';
    controlsContainer.innerHTML = '';

    if (newMode === 'clock') {
        document.getElementById('tab-clock').classList.add('active');
        setupClock();
    } else if (newMode === 'timer') {
        document.getElementById('tab-timer').classList.add('active');
        setupTimer();
    } else if (newMode === 'stopwatch') {
        document.getElementById('tab-stopwatch').classList.add('active');
        setupStopwatch();
    }
}

// ==================== 1. CLOCK ====================
function setupClock() {
    modeLabel.innerText = "Current Time";
    const runClock = () => {
        const now = new Date();
        mainDisplay.innerText = now.toLocaleTimeString('en-GB');
    };
    runClock();
    activeInterval = setInterval(runClock, 1000);
}

// ==================== 2. TIMER ====================
function setupTimer() {
    modeLabel.innerText = "Count Down";
    isTimerRunning = false;
    timerSeconds = 0;
    mainDisplay.innerText = "00:00";
    timerInputContainer.classList.remove('hidden');
    renderTimerControls();
}

function renderTimerControls() {
    controlsContainer.innerHTML = `
        <button class="btn" id="start-timer-btn">${isTimerRunning ? 'Pause' : 'Start'}</button>
        <button class="btn btn-sec" id="reset-timer-btn">Reset</button>
    `;
    document.getElementById('start-timer-btn').onclick = toggleTimer;
    document.getElementById('reset-timer-btn').onclick = resetTimer;
}

function toggleTimer() {
    if (!isTimerRunning) {
        // Only pull from inputs if we are at zero
        if (timerSeconds === 0) {
            const m = parseInt(document.getElementById('input-minutes').value) || 0;
            const s = parseInt(document.getElementById('input-seconds').value) || 0;
            timerSeconds = (m * 60) + s;
        }

        if (timerSeconds <= 0) return alert("Enter a valid time!");

        isTimerRunning = true;
        timerInputContainer.classList.add('hidden');
        activeInterval = setInterval(() => {
            timerSeconds--;
            updateTimerUI();
            if (timerSeconds <= 0) {
                clearInterval(activeInterval);
                alert("Time is up!");
                resetTimer();
            }
        }, 1000);
    } else {
        isTimerRunning = false;
        clearInterval(activeInterval);
    }
    renderTimerControls();
}

function resetTimer() {
    isTimerRunning = false;
    clearInterval(activeInterval);
    timerSeconds = 0;
    mainDisplay.innerText = "00:00";
    timerInputContainer.classList.remove('hidden');
    renderTimerControls();
}

function updateTimerUI() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    mainDisplay.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ==================== 3. CHRONO ====================
function setupStopwatch() {
    modeLabel.innerText = "Elapsed Time";
    updateChronoUI();
    renderChronoControls();
    renderLaps();
}

function renderChronoControls() {
    controlsContainer.innerHTML = `
        <button class="btn" id="start-chrono-btn">${isChronoRunning ? 'Stop' : 'Start'}</button>
        <button class="btn btn-sec" id="lap-chrono-btn" ${!isChronoRunning ? 'disabled' : ''}>Lap</button>
        <button class="btn btn-sec" id="reset-chrono-btn">Reset</button>
    `;
    document.getElementById('start-chrono-btn').onclick = toggleChrono;
    document.getElementById('lap-chrono-btn').onclick = recordLap;
    document.getElementById('reset-chrono-btn').onclick = resetChrono;
}

function toggleChrono() {
    if (!isChronoRunning) {
        isChronoRunning = true;
        chronoStartTime = Date.now() - chronoElapsedTime;
        activeInterval = setInterval(() => {
            chronoElapsedTime = Date.now() - chronoStartTime;
            updateChronoUI();
        }, 10);
    } else {
        isChronoRunning = false;
        clearInterval(activeInterval);
    }
    renderChronoControls();
}

function resetChrono() {
    isChronoRunning = false;
    clearInterval(activeInterval);
    chronoElapsedTime = 0;
    laps = [];
    updateChronoUI();
    renderChronoControls();
    renderLaps();
}

function recordLap() {
    laps.unshift(formatChronoTime(chronoElapsedTime));
    renderLaps();
}

function updateChronoUI() {
    mainDisplay.innerText = formatChronoTime(chronoElapsedTime);
}

function formatChronoTime(ms) {
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10); // Centiseconds
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function renderLaps() {
    extraContent.innerHTML = laps.map((time, i) => `
        <div class="lap-item">
            <span>Lap ${laps.length - i}</span>
            <span>${time}</span>
        </div>
    `).join('');
}

// Initial Events
document.getElementById('tab-clock').onclick = () => switchMode('clock');
document.getElementById('tab-timer').onclick = () => switchMode('timer');
document.getElementById('tab-stopwatch').onclick = () => switchMode('stopwatch');

switchMode('clock');