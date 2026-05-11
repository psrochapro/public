// ==================== GLOBAL STATE ====================
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

    // UI Reset
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

// ==================== 1. CLOCK LOGIC ====================
function setupClock() {
    modeLabel.innerText = "Current Time";
    const runClock = () => {
        const now = new Date();
        mainDisplay.innerText = now.toLocaleTimeString('en-GB');
    };
    runClock();
    activeInterval = setInterval(runClock, 1000);
}

// ==================== 2. TIMER LOGIC ====================
function setupTimer() {
    modeLabel.innerText = "Count Down";
    mainDisplay.innerText = "00:00";
    timerInputContainer.classList.remove('hidden');
    renderTimerControls();
}

function renderTimerControls() {
    controlsContainer.innerHTML = `
        <button class="btn" id="btn-timer-start">${isTimerRunning ? 'Pause' : 'Start'}</button>
        <button class="btn btn-sec" onclick="resetTimer()">Reset</button>
    `;
    document.getElementById('btn-timer-start').onclick = toggleTimer;
}

function toggleTimer() {
    if (!isTimerRunning) {
        if (timerSeconds === 0) {
            const m = parseInt(document.getElementById('input-minutes').value) || 0;
            const s = parseInt(document.getElementById('input-seconds').value) || 0;
            timerSeconds = (m * 60) + s;
        }
        if (timerSeconds <= 0) return;
        
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
    timerInputContainer.classList.remove('hidden');
    mainDisplay.innerText = "00:00";
    renderTimerControls();
}

function updateTimerUI() {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    mainDisplay.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// ==================== 3. CHRONO LOGIC ====================
function setupStopwatch() {
    modeLabel.innerText = "Elapsed Time";
    updateChronoUI();
    renderChronoControls();
    renderLaps();
}

function renderChronoControls() {
    controlsContainer.innerHTML = `
        <button class="btn" onclick="toggleChrono()">${isChronoRunning ? 'Stop' : 'Start'}</button>
        <button class="btn btn-sec" onclick="recordLap()" ${!isChronoRunning ? 'disabled' : ''}>Lap</button>
        <button class="btn btn-sec" onclick="resetChrono()">Reset</button>
    `;
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
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function renderLaps() {
    extraContent.innerHTML = laps.map((time, i) => `
        <div class="lap-item">
            <span>Lap ${laps.length - i}</span>
            <span>${time}</span>
        </div>
    `).join('');
}

// Init
document.getElementById('tab-clock').onclick = () => switchMode('clock');
document.getElementById('tab-timer').onclick = () => switchMode('timer');
document.getElementById('tab-stopwatch').onclick = () => switchMode('stopwatch');
switchMode('clock');