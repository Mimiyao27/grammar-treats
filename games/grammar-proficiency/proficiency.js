// Grammar Proficiency Game Logic

const questions = [
    {
        question: "Which sentence is correct?",
        options: [
            "He go to school every day.",
            "He goes to school every day.",
            "He going to school every day.",
            "He gone to school every day."
        ],
        correct: 1,
        explanation: "This sentence is correct because the singular subject \"he\" requires the verb \"go\" to take -es in the simple present tense, forming \"goes.\""
    },
    {
        question: "Which sentence is correct?",
        options: [
            "There dog is very playful and likes to run.",
            "Their dog is very playful and likes to run.",
            "They're dog is very playful and likes to run.",
            "Theres dog is very playful and likes to run."
        ],
        correct: 1,
        explanation: "This sentence is correct because \"their\" shows possession, indicating that the dog belongs to them. \"Their\" (possessive) is different from \"there\" (location) and \"they're\" (they are)."
    },
    {
        question: "Which sentence is correct?",
        options: [
            "Its raining heavily, so take an umbrella.",
            "It's raining heavily, so take an umbrella.",
            "Its' raining heavily, so take an umbrella.",
            "Its is raining heavily, so take an umbrella."
        ],
        correct: 1,
        explanation: "This sentence is correct because \"It's\" is the contraction of \"it is,\" which is needed before the present continuous verb \"raining.\""
    },
    {
        question: "Which sentence is correct?",
        options: [
            "Yesterday, we goes to the park.",
            "Yesterday, we gone to the park.",
            "Yesterday, we went to the park.",
            "Yesterday, we going to the park."
        ],
        correct: 2,
        explanation: "This sentence is correct because \"went\" is the past tense of \"go,\" which correctly matches the past time reference \"yesterday.\""
    },
    {
        question: "Which sentence is correct?",
        options: [
            "She don't like chocolate.",
            "She doesn't likes chocolate.",
            "She doesn't like chocolate.",
            "She don't likes chocolate."
        ],
        correct: 2,
        explanation: "This sentence is correct because \"doesn't\" is the proper negative form for the third-person singular \"she,\" and the main verb remains in its base form \"like.\""
    },
    {
        question: "Which sentence is correct?",
        options: [
            "Your phone is on the table, not mine.",
            "You're phone is on the table, not mine.",
            "Youre phone is on the table, not mine.",
            "Your phone is on the table not mine."
        ],
        correct: 0,
        explanation: "This sentence is correct because \"your\" shows possession. \"Your\" (possessive) is different from \"you're\" (you are), which would not make sense in this sentence."
    },
    {
        question: "Which sentence is correct?",
        options: [
            "I think your going to enjoy this movie.",
            "You're going to enjoy this movie.",
            "Your going to enjoy this movie.",
            "Youre going to enjoy this movie."
        ],
        correct: 1,
        explanation: "This sentence is correct because \"You're\" is the contraction of \"you are,\" which correctly precedes the present participle \"going\" to indicate a future action. \"You're\" (you are) is different from \"your\" (possessive)."
    },
    {
        question: "Which sentence is correct?",
        options: [
            "If he study hard, he will passes the test.",
            "If he studies hard, he will pass the test.",
            "If he studied hard, he will passes the test.",
            "If he studies hard, he will passes the test."
        ],
        correct: 1,
        explanation: "This sentence is correct because the singular subject \"he\" requires \"studies\" with -s in the present tense, and \"will pass\" correctly forms the future tense."
    },
    {
        question: "Which sentence is correct?",
        options: [
            "She don't like to play tennis, but she enjoy swimming.",
            "She doesn't like to play tennis, but she enjoys swimming.",
            "She doesn't likes to play tennis, but she enjoy swimming.",
            "She don't likes to play tennis, but she enjoys swimming."
        ],
        correct: 1,
        explanation: "This sentence is correct because \"doesn't\" correctly negates \"like\" in the first clause, and the singular subject \"she\" correctly pairs with \"enjoys\" in the second clause."
    },
    {
        question: "Which sentence is correct?",
        options: [
            "Their going to the party tonight.",
            "There going to the party tonight.",
            "They're going to the party tonight.",
            "Theyre going to the party tonight."
        ],
        correct: 2,
        explanation: "This sentence is correct because \"They're\" is the contraction of \"they are,\" which correctly precedes \"going\" to indicate a future plan. \"They're\" (they are) is different from \"their\" (possessive) and \"there\" (location)."
    }
];

let currentQuestion = 0;
let score = 0;
let treats = 0;
let selectedOption = null;
let timerSeconds = 30;
let timerInterval;
let allResults = []; // track for review

// Elements
const questionTracker = document.getElementById("question-tracker");
const timerDisplay = document.getElementById("timer-display");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const submitBtn = document.getElementById("submit-btn");

const feedbackOverlay = document.getElementById("feedback-overlay");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackSubtitle = document.getElementById("feedback-subtitle");
const feedbackImage = document.getElementById("feedback-image");
const feedbackScorePill = document.getElementById("feedback-score");
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
}

function loadQuestion() {
    const q = questions[currentQuestion];
    questionTracker.innerText = `Question ${currentQuestion + 1} of ${questions.length}`;
    questionText.innerText = q.question;
    selectedOption = null;
    
    optionsContainer.innerHTML = "";
    q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.addEventListener("click", () => {
            selectOption(index, btn);
        });
        optionsContainer.appendChild(btn);
    });
}

function selectOption(index, btn) {
    const allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedOption = index;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds--;
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerSeconds = 0;
            // Time ran out - show incorrect feedback
            showFeedback(false);
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerDisplay.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
}

submitBtn.addEventListener("click", () => {
    if (selectedOption === null) return;
    
    // Stop timer when answer is submitted
    clearInterval(timerInterval);
    
    const q = questions[currentQuestion];
    const isCorrect = selectedOption === q.correct;
    
    // Disable all buttons so player can't change answer
    const allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach((btn, index) => {
        btn.disabled = true;
        btn.classList.remove("selected");
        
        if (index === q.correct) {
            // Highlight correct answer green + grow
            btn.classList.add("correct-answer");
        } else if (index === selectedOption && !isCorrect) {
            // Highlight the wrong chosen answer red
            btn.classList.add("wrong-answer");
        }
    });
    
    // Disable submit button too
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.5";
    
    if (isCorrect) {
        score += 100;
        treats += 10;
    }
    
    // After 2 seconds, show feedback
    setTimeout(() => {
        showFeedback(isCorrect);
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }, 1000);
});

function showFeedback(isCorrect) {
    const q = questions[currentQuestion];

    // Change button label on last question
    if (currentQuestion === questions.length - 1) {
        nextQuestionBtn.innerText = "Complete Level";
    } else {
        nextQuestionBtn.innerText = "Next Question";
    }

    feedbackTitle.innerText = isCorrect ? "Perfect!" : "Not quite!";
    if (isCorrect) {
        // Play correct sound
        if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log("Sound play blocked", e));
        }

        feedbackTitle.classList.remove('title-wrong');
        feedbackSubtitle.innerText = "You've won a slice of cake!";
        feedbackImage.innerText = "🍰";
        feedbackSentence.style.backgroundColor = "#4CAF50";

        // Trigger confetti for correct answer
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#5fb871', '#619bdc', '#FFD700', '#f87171'],
                zIndex: 2000
            });
        }
    } else {
        // Play incorrect sound
        if (incorrectSound) {
            incorrectSound.currentTime = 0;
            incorrectSound.play().catch(e => console.log("Sound play blocked", e));
        }

        feedbackTitle.classList.add('title-wrong');
        feedbackSubtitle.innerText = "You've run out of cake.";
        feedbackImage.innerText = "🍽️";
        feedbackSentence.style.backgroundColor = "#eb1e1e";
    }
    
    feedbackScorePill.innerText = `Score: ${isCorrect ? '+100' : '0'}`;
    feedbackTreatsPill.innerText = `Treats: ${isCorrect ? '10' : '0'}`;
    feedbackSentence.innerText = q.options[q.correct];
    feedbackExplanation.innerText = q.explanation;
    
    // Track result for review screen
    allResults.push({
        questionText: q.question,
        isCorrect,
        userAnswer: selectedOption !== null ? q.options[selectedOption] : '[No answer — timed out]',
        correctAnswer: q.options[q.correct],
        explanation: q.explanation
    });
    
    feedbackOverlay.classList.add("active");
}

nextQuestionBtn.addEventListener("click", () => {
    feedbackOverlay.classList.remove("active");
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        // Reset and restart timer for next question
        timerSeconds = 30;
        updateTimerDisplay();
        loadQuestion();
        startTimer();
    } else {
        showResults();
    }
});

function showResults() {
    clearInterval(timerInterval);
    const correctCount = score / 100;
    const percentage = (correctCount / questions.length) * 100;
    
    // Populate player name
    const playerName = localStorage.getItem('username') || localStorage.getItem('fullName') || 'Player';
    const nameSpan = document.getElementById('player-name');
    if (nameSpan) nameSpan.innerText = playerName;
    
    finalCorrect.innerText = `${correctCount}/${questions.length}`;
    finalPoints.innerText = score;
    finalTreats.innerText = treats;
    
    resultsPieChart.style.background = `conic-gradient(#4CAF50 0% ${percentage}%, #eb1e1e ${percentage}% 100%)`;
    
    // Show with active class (matching poptheballoon)
    resultsOverlay.classList.add("active");
    
    // Unlock Level 4 upon completion
    const currentUnlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
    if (currentUnlocked < 4) {
        localStorage.setItem("unlockedLevel", "4");
    }
    
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 }
        });
    }
}

btnBack.addEventListener("click", () => {
    if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
        localStorage.setItem('showLevelScreen', 'true');
        window.location.href = "/dashboard/";
    }
});

btnNextRound.addEventListener("click", () => {
    // Ensure Level 4 is unlocked when returning to selection
    const currentUnlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
    if (currentUnlocked < 4) {
        localStorage.setItem("unlockedLevel", "4");
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
    reviewLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (reviewContainer) {
            reviewContainer.innerHTML = '';
            allResults.forEach((ans, idx) => {
                const item = document.createElement('div');
                item.className = 'review-item';
                if (!ans.isCorrect) item.style.borderLeftColor = '#fca5a5';
                item.innerHTML = `
                    <div class="review-label">QUESTION ${idx + 1}</div>
                    <p style="font-weight:700; margin-bottom:6px;">${ans.questionText}</p>
                    <div class="review-player-answer ${ans.isCorrect ? 'correct' : 'wrong'}">
                        <strong>Your Answer:</strong> ${ans.userAnswer}
                    </div>
                    <div class="review-correct">
                        <strong>Correct Answer:</strong> ${ans.correctAnswer}
                    </div>
                    <p class="review-explanation">${ans.explanation}</p>
                `;
                reviewContainer.appendChild(item);
            });
        }
        if (reviewOverlay) reviewOverlay.classList.add('active');
    });
}

if (btnCloseReview) {
    btnCloseReview.addEventListener('click', () => {
        if (reviewOverlay) reviewOverlay.classList.remove('active');
    });
}

// Save Score (Supabase)
const SUPABASE_URL = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

if (btnSaveScore) {
    btnSaveScore.onclick = async () => {
        const loggedInEmail = localStorage.getItem('loggedInEmail');
        if (!loggedInEmail) {
            alert("Warning: No user found. Score cannot be saved unless you are logged in.");
            return;
        }
        const accuracy = Math.round((score / 100 / questions.length) * 100);
        try {
            const { data: existing, error: fetchErr } = await supabaseClient
                .from('lvl3_scores')
                .select('*')
                .eq('user_email', loggedInEmail)
                .maybeSingle();
            if (fetchErr) throw fetchErr;
            if (existing) {
                const msg = `You already have a saved score for Level 3:\n` +
                    `Previous: Points: ${existing.points}, Treats: ${existing.treats}, Accuracy: ${existing.accuracy}%\n` +
                    `New: Points: ${score}, Treats: ${treats}, Accuracy: ${accuracy}%\n\nOverwrite?`;
                if (confirm(msg)) {
                    const { error: updErr } = await supabaseClient
                        .from('lvl3_scores')
                        .update({ points: score, treats, accuracy })
                        .eq('user_email', loggedInEmail);
                    if (updErr) throw updErr;
                    alert("Score updated! 🏆");
                }
            } else {
                const { error: insErr } = await supabaseClient
                    .from('lvl3_scores')
                    .insert([{ user_email: loggedInEmail, points: score, treats, accuracy }]);
                if (insErr) throw insErr;
                alert("Level 3 score saved! 🏆");
            }
        } catch (err) {
            alert("Error saving score: " + (err.message || "Unknown Error"));
        }
    };
}

// Audio and Settings Elements
const settingsPopover = document.getElementById("settings-popover");
const settingsBtn = document.getElementById("btn-settings");
const soundSlider = document.getElementById('settings-sound');
const bgmSlider = document.getElementById('settings-bgm');
const modeSwitch = document.getElementById('settings-mode-switch');

let bgMusic, correctSound, incorrectSound;

// --- Global Mode Logic ---
const savedMode = localStorage.getItem('settings-mode') || 'light';
if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
} else {
    document.body.classList.remove('dark-mode');
}

// --- Audio Init ---
function initAudio() {
    const savedBgm = localStorage.getItem('settings-bgm') || 50;
    const savedSound = localStorage.getItem('settings-sound') || 50;

    bgMusic = new Audio('../../assets/audio/bgmusic.mp3');
    bgMusic.loop = true;
    bgMusic.volume = savedBgm / 100;

    correctSound = new Audio('../../assets/audio/correct.mp3');
    correctSound.volume = savedSound / 100;

    incorrectSound = new Audio('../../assets/audio/incorrect.wav');
    incorrectSound.volume = savedSound / 100;

    // Apply saved settings to UI
    if (soundSlider) soundSlider.value = savedSound;
    if (bgmSlider) bgmSlider.value = savedBgm;
    if (modeSwitch) {
        modeSwitch.checked = savedMode === 'dark';
    }
}

// Start playing on first interaction
const startAudioInteraction = () => {
    if (bgMusic && bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Music play blocked", e));
    }
    ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
        document.removeEventListener(evt, startAudioInteraction);
    });
};

['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, startAudioInteraction, { once: true });
});

// Settings Logic
if (settingsBtn && settingsPopover) {
    settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        settingsPopover.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
        if (!settingsPopover.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsPopover.classList.remove("active");
        }
    });

    settingsPopover.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    if (soundSlider) {
        soundSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            localStorage.setItem('settings-sound', val);
            if (correctSound) correctSound.volume = val / 100;
            if (incorrectSound) incorrectSound.volume = val / 100;
        });
    }

    if (bgmSlider) {
        bgmSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            localStorage.setItem('settings-bgm', val);
            if (bgMusic) bgMusic.volume = val / 100;
        });
    }

    if (modeSwitch) {
        modeSwitch.addEventListener('change', (e) => {
            const mode = e.target.checked ? 'dark' : 'light';
            localStorage.setItem('settings-mode', mode);
            document.body.classList.toggle('dark-mode', e.target.checked);
        });
    }
}

initAudio();
initGame();

