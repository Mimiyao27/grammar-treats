// Arrange the Word - Game Logic

const questions = [
    {
        sentence: "Peter Piper picked a peck of pickled peppers.",
        explanation: "Subject-verb agreement: 'Peter Piper' is singular, so the past tense verb 'picked' correctly matches the subject. Word order: First we say who (Peter Piper), then what he did (picked), then what he picked (a peck of pickled peppers)."
    },
    {
        sentence: "She sells sea shells on the sea shore.",
        explanation: "Subject-verb agreement: 'She' is singular, so the present tense verb takes -s -> 'sells.' Word order: First we say who (She), then what she does (sells), then what she sells (sea shells), and finally where (on the sea shore)."
    },
    {
        sentence: "My best friend bought a new book yesterday.",
        explanation: "Subject-verb agreement: 'My best friend' is singular, so the past tense verb 'bought' correctly matches the subject. Word order: First we say who (My best friend), then what they did (bought), then what they bought (a new book), and finally when it happened (yesterday)."
    },
    {
        sentence: "The children played in the park after school.",
        explanation: "Subject-verb agreement: 'The children' is plural, so we use 'played' (past tense works for both singular and plural). Word order: First we say who (The children), then what they did (played), then where it happened (in the park), and finally when (after school)."
    },
    {
        sentence: "I enjoy reading books before going to bed.",
        explanation: "Subject-verb agreement: 'I' is singular, so the present tense verb does not take -s -> 'enjoy.' Word order: First we say who (I), then what they do (enjoy), then what they enjoy (reading books), and finally when (before going to bed)."
    },
    {
        sentence: "Every morning, she jogs around the lake before breakfast.",
        explanation: "Subject-verb agreement: 'She' is singular, so the present tense verb takes -s -> 'jogs.' Word order: First we say when (Every morning), then who (she), then what she does (jogs), then where (around the lake), and finally another time reference (before breakfast)."
    },
    {
        sentence: "My grandma bakes cookies every weekend.",
        explanation: "Subject-verb agreement: 'My grandma' is singular, so the present tense verb takes -s -> 'bakes.' Word order: First we say who (My grandma), then what she does (bakes), then what she bakes (cookies), and finally when (every weekend)."
    },
    {
        sentence: "The early bird catches the worm.",
        explanation: "Subject-verb agreement: 'The early bird' is singular, so the present tense verb takes -s -> 'catches.' Word order: First we say who (The early bird), then what it does (catches), and finally what it catches (the worm)."
    },
    {
        sentence: "The dog ran to the park yesterday.",
        explanation: "Subject-verb agreement: 'The dog' is singular, so the past tense verb 'ran' correctly matches the subject. Word order: First we say who (The dog), then what it did (ran), then where it ran (to the park), and finally when (yesterday)."
    },
    {
        sentence: "My little sister is learning how to ride a bike.",
        explanation: "Subject-verb agreement: 'My little sister' is singular, so the verb phrase 'is learning' correctly matches the subject. Word order: First we say who (My little sister), then what she is doing (is learning), and finally what she is learning (how to ride a bike)."
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

    // Word Pool events
    wordPool.addEventListener("dragover", handlePoolDragOver);
    wordPool.addEventListener("drop", handlePoolDrop);
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
        const targetChip = e.target.closest('.word-chip');
        addWordToDropZone(chip, targetChip);
    }
}

function handlePoolDragOver(e) {
    e.preventDefault();
}

function handlePoolDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const chip = document.getElementById(id);
    
    if (chip && chip.parentElement === dropZone) {
        removeWordFromDropZone(chip);
    }
}

function removeWordFromDropZone(chip) {
    if (chip.parentElement !== wordPool) {
        wordPool.appendChild(chip);
        // Remove only one instance to support duplicate words safely
        const idx = droppedWords.indexOf(chip.dataset.word);
        if (idx > -1) {
            droppedWords.splice(idx, 1);
        }
        
        if (dropZone.children.length === 0) {
            dropZone.innerHTML = '<div class="drop-placeholder">Drag words here...</div>';
        }
        updateSubmitButton();
        
        chip.onclick = () => {
            if (chip.parentElement === wordPool) {
                addWordToDropZone(chip);
            }
        };
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
        const wordPoolRect = wordPool.getBoundingClientRect();
        
        if (touch.clientX >= dropZoneRect.left && touch.clientX <= dropZoneRect.right &&
            touch.clientY >= dropZoneRect.top && touch.clientY <= dropZoneRect.bottom) {
            
            let targetChip = null;
            const chipsInZone = Array.from(dropZone.querySelectorAll('.word-chip'));
            for (let c of chipsInZone) {
                if (c === activeChip) continue;
                const rect = c.getBoundingClientRect();
                if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
                    touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    targetChip = c;
                    break;
                }
            }
            
            addWordToDropZone(activeChip, targetChip);
        } else if (touch.clientX >= wordPoolRect.left && touch.clientX <= wordPoolRect.right &&
                   touch.clientY >= wordPoolRect.top && touch.clientY <= wordPoolRect.bottom) {
            if (activeChip.parentElement === dropZone) {
                removeWordFromDropZone(activeChip);
            }
        }
        
        document.removeEventListener("touchmove", moveHandler);
        document.removeEventListener("touchend", endHandler);
    };
    
    document.addEventListener("touchmove", moveHandler, {passive: false});
    document.addEventListener("touchend", endHandler);
}

function addWordToDropZone(chip, targetChip = null) {
    // Remove placeholder
    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.remove();
    
    if (targetChip && targetChip !== chip && dropZone.contains(targetChip)) {
        if (dropZone.contains(chip)) {
            // Both in drop zone -> swap
            const targetNext = targetChip.nextSibling;
            const chunkNext = chip.nextSibling;
            
            if (targetNext === chip) {
                dropZone.insertBefore(chip, targetChip);
            } else if (chunkNext === targetChip) {
                dropZone.insertBefore(targetChip, chip);
            } else {
                dropZone.insertBefore(chip, targetChip);
                if (chunkNext) {
                    dropZone.insertBefore(targetChip, chunkNext);
                } else {
                    dropZone.appendChild(targetChip);
                }
            }
        } else {
            // From pool to specific target -> insert before target
            dropZone.insertBefore(chip, targetChip);
            droppedWords.push(chip.dataset.word);
        }
    } else {
        if (!dropZone.contains(chip)) {
            dropZone.appendChild(chip);
            droppedWords.push(chip.dataset.word);
        } else {
            // Dragged within dropzone onto empty space, just append to end
            dropZone.appendChild(chip);
        }
    }
    
    // Allow clicking to return to pool
    chip.onclick = () => removeWordFromDropZone(chip);
    
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
                colors: ['#7ac142', '#2f448c', '#FFD700'],
                zIndex: 2000
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
    // Ensure Level 5 is unlocked when returning to selection
    const currentUnlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
    if (currentUnlocked < 5) {
        localStorage.setItem("unlockedLevel", "5");
    }
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
        
        const accuracy = Math.round((score / 100 / questions.length) * 100);
        
        try {
            const { data: existing } = await supabaseClient
                .from('lvl4_scores')
                .select('*')
                .eq('user_email', email)
                .maybeSingle();

            if (existing) {
                const msg = `You already have a saved score for Level 4:\n` +
                    `Previous: Points: ${existing.points}, Treats: ${existing.treats}, Accuracy: ${existing.accuracy}%\n` +
                    `New: Points: ${score}, Treats: ${treats}, Accuracy: ${accuracy}%\n\nOverwrite?`;
                if (confirm(msg)) {
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
                alert("Level 4 score saved! 🏆");
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
