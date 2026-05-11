// ==================== STATE MANAGEMENT ====================
let currentMode = 'clock'; // 'clock', 'timer', or 'stopwatch'
let activeInterval = null; // Stores our active setInterval

// ==================== DOM ELEMENTS ====================
const mainDisplay = document.getElementById('main-display');
const modeLabel = document.getElementById('mode-label');
const controlsContainer = document.getElementById('controls-container');
const timerInputContainer = document.getElementById('timer-input-container');
const extraContent = document.getElementById('extra-content');

// ==================== TAB NAVIGATION ====================
function switchMode(newMode) {
    currentMode = newMode;
    
    // Stop any active clock, stopwatch, or timer countdown loops
    clearInterval(activeInterval);
    activeInterval = null;

    // Reset layout UI classes
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    timerInputContainer.classList.add('hidden');
    extraContent.innerHTML = '';

    // Route to correct setup
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

// Attach Event Listeners to Tabs
document.getElementById('tab-clock').addEventListener('click', () => switchMode('clock'));
document.getElementById('tab-timer').addEventListener('click', () => switchMode('timer'));
document.getElementById('tab-stopwatch').addEventListener('click', () => switchMode('stopwatch'));


// ==================== 1. CLOCK ENGINE ====================
function setupClock() {
    modeLabel.innerText = "Current Time";
    controlsContainer.innerHTML = ''; // Clocks don't need buttons
    
    // Create the time updater function
    const runClock = () => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        mainDisplay.innerText = `${hrs}:${mins}:${secs}`;
    };

    runClock(); // Run once immediately
    activeInterval = setInterval(runClock, 1000); // Repeat every second
}


// ==================== 2. CHRONO (STOPWATCH) ENGINE ====================
// TODO: Put global stopwatch variables here (startTime, elapsedMilliseconds, etc.)

function setupStopwatch() {
    modeLabel.innerText = "Elapsed Time";
    mainDisplay.innerText = "00:00:00.00"; // Includes milliseconds!
    
    // Inject custom Control buttons
    controlsContainer.innerHTML = `
        <button class="btn" id="btn-sw-start">Start</button>
        <button class="btn btn-sec" id="btn-sw-lap" disabled>Lap</button>
    `;

    // TODO: Write event listeners for these buttons & build the logic!
}


// ==================== 3. TIMER ENGINE ====================
// TODO: Put global timer variables here (timeLeftInSeconds, isRunning, etc.)

function setupTimer() {
    modeLabel.innerText = "Count Down";
    mainDisplay.innerText = "00:00";
    timerInputContainer.classList.remove('hidden'); // Show time inputs

    // Inject custom Control buttons
    controlsContainer.innerHTML = `
        <button class="btn" id="btn-timer-start">Start</button>
        <button class="btn btn-sec" id="btn-timer-reset">Reset</button>
    `;

    // TODO: Write event listeners for inputs and countdown logic!
}


// ==================== INITIAL START ====================
// Start on Clock mode when the page finishes loading
switchMode('clock');