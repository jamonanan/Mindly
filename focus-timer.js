document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const timeDisplay = document.getElementById('time-display');
    const progressBar = document.getElementById('progress-bar');
    const sessionBadge = document.getElementById('session-badge');
    const sessionLabel = document.getElementById('session-label');
    
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    const optionBtns = document.querySelectorAll('.option-btn[data-time]');
    
    const customBtn = document.getElementById('custom-btn');
    const customInputs = document.getElementById('custom-inputs');
    const customMin = document.getElementById('custom-min');
    const applyCustomBtn = document.getElementById('apply-custom');
    
    const totalFocusTimeEl = document.getElementById('total-focus-time');

    // --- State ---
    let timerInterval = null;
    let initialSeconds = 25 * 60; // 25 minutes default
    let remainingSeconds = initialSeconds;
    let isRunning = false;
    let currentType = 'focus'; // 'focus' or 'break'
    
    // Total focus time state
    let totalFocusSeconds = 0;
    
    // Load existing focus time from local storage if any
    const today = new Date().toDateString();
    const storedData = JSON.parse(localStorage.getItem('mindlyFocusTracker') || '{}');
    if (storedData.date === today) {
        totalFocusSeconds = storedData.seconds || 0;
    }
    updateTotalFocusDisplay();

    // --- Core Timer Logic ---
    function formatTime(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        timeDisplay.textContent = formatTime(remainingSeconds);
        // Calculate progress percentage (0 to 100)
        // At start (remaining == initial), width = 0%. At end (remaining == 0), width = 100%
        const progress = 100 - ((remainingSeconds / initialSeconds) * 100);
        progressBar.style.width = `${progress}%`;
    }

    function setDuration(minutes, type) {
        stopTimer();
        
        initialSeconds = minutes * 60;
        remainingSeconds = initialSeconds;
        currentType = type;
        
        if (type === 'focus') {
            sessionLabel.textContent = 'Focus Session';
            sessionBadge.style.background = 'var(--primary-purple-light)';
        } else {
            sessionLabel.textContent = 'Break Session';
            sessionBadge.style.background = 'var(--pastel-blue)';
            sessionBadge.style.color = 'var(--gray-darker)';
        }
        
        updateDisplay();
    }

    function startTimer() {
        if (isRunning || remainingSeconds <= 0) return;
        
        isRunning = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'default';
        
        timerInterval = setInterval(() => {
            remainingSeconds--;
            
            // Accumulate focus time if it's a focus session
            if (currentType === 'focus') {
                totalFocusSeconds++;
                saveTotalFocusTime();
                updateTotalFocusDisplay();
            }
            
            updateDisplay();
            
            if (remainingSeconds <= 0) {
                completeTimer();
            }
        }, 1000);
    }

    function stopTimer() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(timerInterval);
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
    }

    function resetTimer() {
        stopTimer();
        remainingSeconds = initialSeconds;
        updateDisplay();
    }

    function completeTimer() {
        stopTimer();
        alert(`Time's up! Great job finishing your ${currentType} session.`);
        // Note: Could add a nice notification sound here if desired
    }

    // --- Tracking Logic ---
    function saveTotalFocusTime() {
        localStorage.setItem('mindlyFocusTracker', JSON.stringify({
            date: today,
            seconds: totalFocusSeconds
        }));
    }

    function updateTotalFocusDisplay() {
        const totalMinutes = Math.floor(totalFocusSeconds / 60);
        totalFocusTimeEl.textContent = totalMinutes;
    }

    // --- Event Listeners ---
    
    // Controls
    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // Preset Options
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all focus options
            document.querySelectorAll('.options-row .option-btn').forEach(b => b.classList.remove('active'));
            
            if (btn.classList.contains('break-btn')) {
                // It's a break button
                btn.classList.add('active');
            } else {
                btn.classList.add('active');
                // Hide custom input if open
                customBtn.style.display = 'inline-flex';
                customInputs.style.display = 'none';
            }
            
            const minutes = parseInt(btn.getAttribute('data-time'), 10);
            const type = btn.getAttribute('data-type');
            setDuration(minutes, type);
        });
    });

    // Custom Button Logic
    customBtn.addEventListener('click', () => {
        customBtn.style.display = 'none';
        customInputs.style.display = 'flex';
        customMin.focus();
    });

    applyCustomBtn.addEventListener('click', () => {
        const minVal = parseInt(customMin.value, 10);
        if (minVal && minVal > 0) {
            document.querySelectorAll('.options-row .option-btn').forEach(b => b.classList.remove('active'));
            customBtn.classList.add('active');
            setDuration(minVal, 'focus');
            
            // Swap back to button view showing the custom time text
            customBtn.textContent = `${minVal}m`;
            customInputs.style.display = 'none';
            customBtn.style.display = 'inline-flex';
        } else {
            alert('Please enter a valid number of minutes.');
        }
    });

    // Initialize display
    updateDisplay();
});
