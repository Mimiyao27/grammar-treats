// Arrange the Word - Game Logic

const questions = [
    {
        sentence: "Peter Piper picked a peck of pickled peppers.",
        explanation: "This is a classic tongue twister. The words must be in the correct order to make sense."
    },
    {
        sentence: "The quick brown fox jumps over the lazy dog.",
        explanation: "This sentence contains every letter of the alphabet!"
    },
    {
        sentence: "Always wash your hands before you eat.",
        explanation: "A complete sentence starts with a capital letter and ends with a period."
    },
    {
        sentence: "She sells seashells by the seashore.",
        explanation: "The words form a rhythmic pattern known as alliteration."
    },
    {
        sentence: "Education is the most powerful weapon which you can use to change the world.",
        explanation: "This famous quote by Nelson Mandela highlights the importance of learning."
    },
    {
        sentence: "The sun rises in the east and sets in the west.",
        explanation: "A factual sentence describing the sun's daily path."
    },
    {
        sentence: "Practice makes perfect when learning a new language.",
        explanation: "Consistent effort is key to mastering grammar."
    },
    {
        sentence: "Reading books helps you travel to far away places without moving your feet.",
        explanation: "A beautiful metaphor about the power of reading."
    },
    {
        sentence: "Kindness is a language which the deaf can hear and the blind can see.",
        explanation: "A powerful quote about the universal nature of kindness."
    },
    {
        sentence: "The only way to do great work is to love what you do.",
        explanation: "Steve Jobs' advice on finding passion in your work."
    }
];

let currentQuestion = 0;
let score = 0;
let treats = 0;
let timerSeconds = 30;
let timerInterval;
let allResults = [];
let droppedWords = [];

// Elements
const questionTracker = document.getElementById("question-tracker");
const timerDisplay = document.getElementById("timer-display");
const wordPool = document.getElementById("word-pool");
const dropZone = document.getElementById("drop-zone");
const submitBtn = document.getElementById("submit-btn");

const feedbackOverlay = document.getElementById("feedback-overlay");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackSubtitle = document.getElementById("feedback-subtitle");
const feedbackImage = document.getElementById("feedback-image");
const feedbackScoreDisplay = document.getElementById("feedback-score-display");
const feedbackTreatsPill = document.getElementById("feedback-treats");
const feedbackSentence = document.getElementById("feedback-sentence");
const feedbackExplanation = document.getElementById("feedback-explanation");
const nextQuestionBtn = document.getElementById("btn-next-question");

const resultsOverlay = document.getElementById("results-overlay");
const finalCorrect = document.getElementById("final-correct");
const finalPoints = document.getElementById("final-points");
const finalTreats = document.getElementById("final-treats");
const resultsPieChart = document.getElementById("results-pie-chart");
const btnSaveScore = document.getElementById("btn-save-score");
const btnNextRound = document.getElementById("btn-next-round");
const btnBack = document.getElementById("btn-back");

// Initialize Game
function initGame() {
    loadQuestion();
    startTimer();
    initSettings();
}

function loadQuestion() {
    const q = questions[currentQuestion];
    questionTracker.innerText = `Question ${currentQuestion + 1} of ${questions.length}`;
    
    // Clear containers
    wordPool.innerHTML = "";
    dropZone.innerHTML = '<div class="drop-placeholder">Drag words here...</div>';
    droppedWords = [];
    submitBtn.disabled = false; // Always enabled per user request

    // Split sentence into words and shuffle
    let words = q.sentence.split(" ");
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);

    shuffledWords.forEach((word, index) => {
        const chip = document.createElement("div");
        chip.className = "word-chip";
        chip.innerText = word;
        chip.dataset.word = word; // Store actual word in data attribute
        chip.draggable = true;
        chip.id = `word-${index}`;
        
        chip.addEventListener("dragstart", handleDragStart);
        chip.addEventListener("dragend", handleDragEnd);
        
        // Touch support
        chip.addEventListener("touchstart", handleTouchStart, {passive: false});
        
        // Click support for better UX
        chip.onclick = () => {
            if (chip.parentElement === wordPool) {
                addWordToDropZone(chip);
            }
        };

        wordPool.appendChild(chip);
    });

    // Drop Zone events
    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);
}

// Drag & Drop Handlers
function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
    this.classList.add("dragging");
}

function handleDragEnd() {
    this.classList.remove("dragging");
}

function handleDragOver(e) {
    e.preventDefault();
    dropZone.classList.add("drag-over");
}

function handleDragLeave() {
    dropZone.classList.remove("drag-over");
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    const id = e.dataTransfer.getData("text/plain");
    const chip = document.getElementById(id);
    
    if (chip) {
        addWordToDropZone(chip);
    }
}

// Touch Handlers for Mobile
let activeChip = null;
function handleTouchStart(e) {
    e.preventDefault();
    activeChip = this;
    activeChip.classList.add("dragging");
    
    const moveHandler = (e) => {
        const touch = e.touches[0];
        activeChip.style.position = "fixed";
        activeChip.style.left = touch.clientX - activeChip.offsetWidth / 2 + "px";
        activeChip.style.top = touch.clientY - activeChip.offsetHeight / 2 + "px";
        activeChip.style.zIndex = "1000";
    };
    
    const endHandler = (e) => {
        const touch = e.changedTouches[0];
        activeChip.style.position = "";
        activeChip.style.left = "";
        activeChip.style.top = "";
        activeChip.style.zIndex = "";
        activeChip.classList.remove("dragging");
        
        const dropZoneRect = dropZone.getBoundingClientRect();
        if (touch.clientX >= dropZoneRect.left && touch.clientX <= dropZoneRect.right &&
            touch.clientY >= dropZoneRect.top && touch.clientY <= dropZoneRect.bottom) {
            addWordToDropZone(activeChip);
        }
        
        document.removeEventListener("touchmove", moveHandler);
        document.removeEventListener("touchend", endHandler);
    };
    
    document.addEventListener("touchmove", moveHandler, {passive: false});
    document.addEventListener("touchend", endHandler);
}

function addWordToDropZone(chip) {
    // Remove placeholder
    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.remove();
    
    // Check if chip is already in drop zone
    if (!dropZone.contains(chip)) {
        dropZone.appendChild(chip);
        droppedWords.push(chip.dataset.word);
    }
    
    // Allow clicking to return to pool
    chip.onclick = () => {
        wordPool.appendChild(chip);
        droppedWords = droppedWords.filter(w => w !== chip.dataset.word); // simplified, might need better logic for duplicate words
        if (dropZone.children.length === 0) {
            dropZone.innerHTML = '<div class="drop-placeholder">Drag words here...</div>';
        }
        updateSubmitButton();
        
        // Re-attach the pool-click behavior so it can be clicked to go back up again
        chip.onclick = () => {
            if (chip.parentElement === wordPool) {
                addWordToDropZone(chip);
            }
        };
    };
    
    updateSubmitButton();
}

function updateSubmitButton() {
    // const wordChips = dropZone.querySelectorAll(".word-chip");
    // submitBtn.disabled = false; // Intentionally leaving it active at all times
}

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds--;
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerSeconds = 0;
            checkAnswer(); // Auto-submit on timeout
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerDisplay.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
}

submitBtn.addEventListener("click", checkAnswer);

function checkAnswer() {
    clearInterval(timerInterval);
    
    const q = questions[currentQuestion];
    const currentOrder = Array.from(dropZone.querySelectorAll(".word-chip")).map(c => c.dataset.word).join(" ");
    const isCorrect = currentOrder === q.sentence;
    
    if (isCorrect) {
        score += 100;
        treats += 10;
        showFeedback(true);
    } else {
        showFeedback(false);
    }
}

function showFeedback(isCorrect) {
    const q = questions[currentQuestion];

    if (currentQuestion === questions.length - 1) {
        nextQuestionBtn.innerText = "Complete Level";
    } else {
        nextQuestionBtn.innerText = "Next Question";
    }

    feedbackTitle.innerText = isCorrect ? "Perfect!" : "Not quite!";
    feedbackTitle.style.color = isCorrect ? "#7ac142" : "#e74c3c";
    
    if (isCorrect) {
        feedbackSubtitle.innerText = "You've earned a slice of cake!";
        feedbackImage.innerText = "🍰";
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#7ac142', '#3B5998', '#FFD700']
            });
        }
        // Play sound if available (handled in initSettings)
        if (correctSound) correctSound.play().catch(() => {});
    } else {
        feedbackSubtitle.innerText = "Don't give up! Keep practicing.";
        feedbackImage.innerText = "🥣";
        if (incorrectSound) incorrectSound.play().catch(() => {});
    }
    
    feedbackScoreDisplay.innerText = `Score: ${isCorrect ? '+100' : '0'}`;
    feedbackTreatsPill.innerText = `Treats: ${isCorrect ? '10' : '0'}`;
    feedbackSentence.innerText = q.sentence;
    feedbackExplanation.innerText = q.explanation;
    
    allResults.push({
        sentence: q.sentence,
        isCorrect,
        userAnswer: Array.from(dropZone.querySelectorAll(".word-chip")).map(c => c.dataset.word).join(" ") || "[No answer]",
        explanation: q.explanation
    });
    
    feedbackOverlay.classList.add("active");
}

nextQuestionBtn.addEventListener("click", () => {
    feedbackOverlay.classList.remove("active");
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        timerSeconds = 30;
        updateTimerDisplay();
        loadQuestion();
        startTimer();
    } else {
        showResults();
    }
});

function showResults() {
    const correctCount = score / 100;
    const percentage = (correctCount / questions.length) * 100;
    
    const playerName = localStorage.getItem('username') || localStorage.getItem('fullName') || 'Player';
    document.getElementById('player-name').innerText = playerName;
    
    finalCorrect.innerText = `${correctCount}/${questions.length}`;
    finalPoints.innerText = score;
    finalTreats.innerText = treats;
    
    resultsPieChart.style.background = `conic-gradient(#7ac142 0% ${percentage}%, #e74c3c ${percentage}% 100%)`;
    resultsOverlay.classList.add("active");
    
    // Save progress locally
    const currentUnlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
    if (currentUnlocked < 5) {
        localStorage.setItem("unlockedLevel", "5");
    }
}

btnBack.addEventListener("click", () => {
    if (confirm("Quit game? Your progress will not be saved.")) {
        localStorage.setItem('showLevelScreen', 'true');
        window.location.href = "/dashboard/";
    }
});

btnNextRound.addEventListener("click", () => {
    localStorage.setItem('showLevelScreen', 'true');
    window.location.href = "/dashboard/";
});

// Review Logic
const reviewLink = document.querySelector('.review-link');
const reviewOverlay = document.getElementById('review-overlay');
const btnCloseReview = document.getElementById('btn-close-review');
const reviewContainer = document.getElementById('review-container');

if (reviewLink) {
    reviewLink.onclick = (e) => {
        e.preventDefault();
        reviewContainer.innerHTML = '';
        allResults.forEach((res, idx) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            item.style.borderLeftColor = res.isCorrect ? '#5fb871' : '#fca5a5';
            
            const playerAnswerClass = res.isCorrect ? 'correct' : 'wrong';
            item.innerHTML = `
                <div class="review-label">QUESTION ${idx + 1}</div>
                <div class="review-player-answer ${playerAnswerClass}">
                    Your Answer: <br> ${res.userAnswer}
                </div>
                ${!res.isCorrect ? `<div class="review-correct">Correct:<br>${res.sentence}</div>` : ''}
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${res.explanation}
                </div>
            `;
            reviewContainer.appendChild(item);
        });
        reviewOverlay.style.display = 'flex';
        reviewOverlay.classList.add('active');
    };
}

if (btnCloseReview) {
    btnCloseReview.onclick = () => {
        reviewOverlay.style.display = 'none';
        reviewOverlay.classList.remove('active');
    };
}

// Supabase Integration
const SUPABASE_URL = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

if (btnSaveScore) {
    btnSaveScore.onclick = async () => {
        const email = localStorage.getItem('loggedInEmail');
        if (!email) {
            alert("Please log in to save your score.");
            return;
        }
        
        const accuracy = (score / 100 / questions.length) * 100;
        
        try {
            const { data: existing } = await supabaseClient
                .from('lvl4_scores')
                .select('*')
                .eq('user_email', email)
                .maybeSingle();

            if (existing) {
                if (confirm(`Overwrite existing score? (Points: ${existing.points})`)) {
                    await supabaseClient
                        .from('lvl4_scores')
                        .update({ points: score, treats, accuracy })
                        .eq('user_email', email);
                    alert("Score updated! 🏆");
                }
            } else {
                await supabaseClient
                    .from('lvl4_scores')
                    .insert([{ user_email: email, points: score, treats, accuracy }]);
                alert("Score saved! 🏆");
            }
        } catch (err) {
            console.error(err);
            alert("Error saving score.");
        }
    };
}

// Settings & Audio
let bgMusic, correctSound, incorrectSound;
function initSettings() {
    const settingsBtn = document.getElementById("btn-settings");
    const settingsPopover = document.getElementById("settings-popover");
    const modeSwitch = document.getElementById("settings-mode-switch");
    const soundSlider = document.getElementById("settings-sound");
    const bgmSlider = document.getElementById("settings-bgm");

    if (settingsBtn && settingsPopover) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            settingsPopover.classList.toggle('active');
        });

        // Close popover when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPopover.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsPopover.classList.remove('active');
            }
        });

        // Prevent clicks inside popover from closing it
        settingsPopover.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    // Audio files
    bgMusic = new Audio('../../assets/audio/bgmusic.mp3');
    bgMusic.loop = true;
    correctSound = new Audio('../../assets/audio/correct.mp3');
    incorrectSound = new Audio('../../assets/audio/incorrect.wav');

    // Load saved settings
    const savedSound = localStorage.getItem("settings-sound") || 50;
    const savedBgm = localStorage.getItem("settings-bgm") || 50;
    const savedMode = localStorage.getItem("settings-mode") || "light";

    if (soundSlider) {
        soundSlider.value = savedSound;
        correctSound.volume = savedSound / 100;
        incorrectSound.volume = savedSound / 100;
        soundSlider.oninput = (e) => {
            const val = e.target.value;
            correctSound.volume = val / 100;
            incorrectSound.volume = val / 100;
            localStorage.setItem("settings-sound", val);
        };
    }

    if (bgmSlider) {
        bgmSlider.value = savedBgm;
        bgMusic.volume = savedBgm / 100;
        bgmSlider.oninput = (e) => {
            const val = e.target.value;
            bgMusic.volume = val / 100;
            localStorage.setItem("settings-bgm", val);
        };
    }

    if (modeSwitch) {
        modeSwitch.checked = savedMode === "dark";
        if (savedMode === "dark") document.body.classList.add("dark-mode");
        modeSwitch.onchange = (e) => {
            const mode = e.target.checked ? "dark" : "light";
            document.body.classList.toggle("dark-mode", e.target.checked);
            localStorage.setItem("settings-mode", mode);
        };
    }

    // Start BGM on first click
    document.addEventListener("click", () => {
        if (bgMusic.paused) bgMusic.play().catch(() => {});
    }, { once: true });
}

initGame();
