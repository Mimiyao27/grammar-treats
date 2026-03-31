// Sentence Correction - Game Logic

const questions = [
    {
        incorrect: "john and me goes to the mall every weekends but he dont likes shopping",
        correct: "John and I go to the mall every weekend, but he doesn't like shopping.",
        alternatives: [
            "John and I go to the mall every weekend but he doesn't like shopping."
        ],
        explanation: "Capitalize 'John' and 'I'. Use 'I' instead of 'me' as the subject. 'Go' matches 'John and I'. 'Weekend' should be singular after 'every'. Add a comma before 'but'. Use 'doesn't' (contraction of does not) and 'like' (base form)."
    },
    {
        incorrect: "her dont have no homework for tomorrow school",
        correct: "She doesn't have any homework for school tomorrow.",
        alternatives: [
            "She doesn't have homework for school tomorrow."
        ],
        explanation: "Use the subject pronoun 'She' instead of 'her'. 'Doesn't' is the correct negative for 'She'. Avoid double negatives ('dont have no') by using 'any' or removing 'no'. 'School' should come before 'tomorrow' in this context."
    },
    {
        incorrect: "them was playing football when it start to raining",
        correct: "They were playing football when it started to rain.",
        alternatives: [
            "They were playing football when it started raining."
        ],
        explanation: "Use 'They' as the subject. 'Were' matches the plural 'They'. Use the past tense 'started'. Use 'to rain' or 'raining' after started."
    },
    {
        incorrect: "him and his brother is going to visit they grandmothers house",
        correct: "He and his brother are going to visit their grandmother's house.",
        alternatives: [
            "He and his brother are going to visit their grandmothers' house."
        ],
        explanation: "Use 'He' as part of the subject. 'Are' matches the plural subject 'He and his brother'. Use 'their' for possession. Add an apostrophe for 'grandmother's'."
    },
    {
        incorrect: "we was so happy because the teacher give us a surprise prizes",
        correct: "We were so happy because the teacher gave us surprise prizes.",
        alternatives: [
            "We were so happy because the teacher gave us a surprise prize."
        ],
        explanation: "Use 'were' for 'We'. Use past tense 'gave'. 'A surprise prizes' is incorrect; use 'surprise prizes' or 'a surprise prize'."
    },
    {
        incorrect: "my sister dont like to eating vegetables but she love fruits",
        correct: "My sister doesn't like eating vegetables, but she loves fruits.",
        alternatives: [
            "My sister doesn't like to eat vegetables but she loves fruits."
        ],
        explanation: "Use 'doesn't' for 'sister'. Use 'eating' or 'to eat'. Add a comma before 'but'. Use 'loves' for singular 'she'."
    },
    {
        incorrect: "yesterday i see a big dogs running on the streets",
        correct: "Yesterday, I saw a big dog running on the street.",
        alternatives: [
            "Yesterday I saw a big dog running on the street.",
            "Yesterday, I saw big dogs running on the street."
        ],
        explanation: "Capitalize 'I'. Use past tense 'saw'. 'A big dogs' is mismatched; use 'a big dog' or 'big dogs'."
    },
    {
        incorrect: "can you told me where is the nearest libraries",
        correct: "Can you tell me where the nearest library is?",
        alternatives: [
            "Can you tell me where the nearest library is."
        ],
        explanation: "Use 'tell' after 'can'. In indirect questions, the subject comes before the verb: 'where the nearest library is'. Use singular 'library' with 'the nearest'."
    },
    {
        incorrect: "i has been waiting for the bus since two hours",
        correct: "I have been waiting for the bus for two hours.",
        alternatives: [
            "I have been waiting for the bus for 2 hours."
        ],
        explanation: "Use 'have' for 'I'. Use 'for' when referring to a duration like 'two hours' (use 'since' for a point in time)."
    },
    {
        incorrect: "the students was very excited for they field trip next friday",
        correct: "The students were very excited for their field trip next Friday.",
        alternatives: [
            "The students are very excited for their field trip next Friday."
        ],
        explanation: "Use 'were' (or 'are') for plural 'students'. Use 'their' for possession. Capitalize 'Friday'."
    }
];

let currentLevel = 5;
let currentQuestion = 0;
let score = 0;
let treats = 0;
let correctAnswersCount = 0;
let allResults = [];
let timerSeconds = 60;
let timerInterval;

// Elements
const questionTracker = document.getElementById("question-tracker");
const timerDisplay = document.getElementById("timer-display");
const incorrectDisplay = document.getElementById("incorrect-sentence");
const userAnswerInput = document.getElementById("user-answer");
const submitBtn = document.getElementById("btn-submit");

const feedbackOverlay = document.getElementById("feedback-overlay");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackSubtitle = document.getElementById("feedback-subtitle");
const feedbackScore = document.getElementById("feedback-score");
const feedbackTreatsDisplay = document.getElementById("feedback-treats");
const feedbackSentence = document.getElementById("feedback-sentence");
const feedbackExplanation = document.getElementById("feedback-explanation");
const feedbackImage = document.getElementById("feedback-image");
const nextQuestionBtn = document.getElementById("btn-next-question");

const resultsOverlay = document.getElementById("results-overlay");
const finalCorrect = document.getElementById("final-correct");
const finalPoints = document.getElementById("final-points");
const finalTreats = document.getElementById("final-treats");
const resultsPieChart = document.getElementById("results-pie-chart");
const btnSaveScore = document.getElementById("btn-save-score");
const btnNextRound = document.getElementById("btn-next-round");
const btnBack = document.getElementById("btn-back");

// Initialize
function initGame() {
    loadQuestion();
    startTimer();
    initSettings();
}

function loadQuestion() {
    const q = questions[currentQuestion];
    questionTracker.innerText = `Question ${currentQuestion + 1} of ${questions.length}`;
    incorrectDisplay.innerText = q.incorrect;
    userAnswerInput.value = "";
    userAnswerInput.focus();
    submitBtn.disabled = false;
}

function startTimer() {
    clearInterval(timerInterval);
    timerSeconds = 60;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timerSeconds--;
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerSeconds = 0;
            checkAnswer(true); // Timeout
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerDisplay.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
}

submitBtn.addEventListener("click", () => checkAnswer(false));

// Allow Enter key to submit
userAnswerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        checkAnswer(false);
    }
});

function checkAnswer(isTimeout = false) {
    clearInterval(timerInterval);
    const q = questions[currentQuestion];
    const userAns = isTimeout ? "[Time ran out!]" : userAnswerInput.value.trim();
    
    // Strictness: We normalize spaces but check capitalization/punctuation as per instructions
    const normalize = (str) => str.replace(/\s+/g, ' ').trim();
    const normalizedUser = normalize(userAns);
    const normalizedCorrect = normalize(q.correct);
    
    let isCorrect = !isTimeout && (normalizedUser === normalizedCorrect);
    
    // Check alternatives if not direct match
    if (!isCorrect && !isTimeout && q.alternatives) {
        isCorrect = q.alternatives.some(alt => normalize(alt) === normalizedUser);
    }

    if (isCorrect) {
        score += 100;
        treats += 10;
        correctAnswersCount++;
        if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log("Sound play blocked", e));
        }
        showFeedback(true, userAns);
    } else {
        treats += 2; // Award partial treats for effort
        if (incorrectSound) {
            incorrectSound.currentTime = 0;
            incorrectSound.play().catch(e => console.log("Sound play blocked", e));
        }
        showFeedback(false, userAns);
    }

    // Record for review
    allResults.push({
        isCorrect: isCorrect,
        userSentence: userAns,
        correctSentence: q.correct,
        explanation: q.explanation
    });
}

function showFeedback(isCorrect, userAns) {
    const q = questions[currentQuestion];
    
    feedbackTitle.innerText = isCorrect ? "Perfect!" : "Not quite!";
    if (isCorrect) {
        feedbackTitle.classList.remove('title-wrong');
        feedbackSubtitle.innerText = "You've won a slice of cake!";
        feedbackImage.innerText = "🍰";
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    } else {
        feedbackTitle.classList.add('title-wrong');
        feedbackSubtitle.innerText = "You've run out of cake.";
        feedbackImage.innerText = "🍽️";
    }

    feedbackScore.innerText = `Score: ${isCorrect ? '+100' : '0'}`;
    feedbackTreatsDisplay.innerText = `Treats: ${isCorrect ? '10' : '2'}`;
    feedbackSentence.innerText = q.correct;
    
    if (!isCorrect && userAns === "[Time ran out!]") {
        feedbackExplanation.innerText = `Time is up! You didn't submit an answer. The correct version was: "${q.correct}"`;
    } else {
        feedbackExplanation.innerText = q.explanation;
    }
    
    if (currentQuestion === questions.length - 1) {
        nextQuestionBtn.innerText = "Complete Level";
    } else {
        nextQuestionBtn.innerText = "Next Question";
    }

    feedbackOverlay.classList.add("active");
}

nextQuestionBtn.addEventListener("click", () => {
    feedbackOverlay.classList.remove("active");
    currentQuestion++;
    
    if (currentQuestion < questions.length) {
        timerSeconds = 60;
        loadQuestion();
        startTimer();
    } else {
        showResults();
    }
});

function showResults() {
    const percentage = (correctAnswersCount / questions.length) * 100;
    
    const playerName = localStorage.getItem('username') || localStorage.getItem('fullName') || 'Player';
    document.getElementById('player-name').innerText = playerName;
    
    finalCorrect.innerText = `${correctAnswersCount}/${questions.length}`;
    finalPoints.innerText = score;
    finalTreats.innerText = treats;
    
    resultsPieChart.style.background = `conic-gradient(#4CAF50 0% ${percentage}%, #eb1e1e ${percentage}% 100%)`;
    
    // Setup review section
    const reviewContainer = document.getElementById('review-container');
    const reviewLink = document.querySelector('.review-link');
    
    if (reviewContainer) {
        reviewContainer.innerHTML = ''; 
        allResults.forEach((ans, idx) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            if (!ans.isCorrect) item.style.borderLeftColor = '#fca5a5';
            
            item.innerHTML = `
                <div class="review-label">QUESTION ${idx + 1}</div>
                <div class="review-player-answer ${ans.isCorrect ? 'correct' : 'wrong'}">
                    <strong>Your Answer:</strong> ${ans.userSentence}
                </div>
                <div class="review-correct">
                    <strong>Correct Answer:</strong> ${ans.correctSentence}
                </div>
                <p class="review-explanation">${ans.explanation}</p>
            `;
            reviewContainer.appendChild(item);
        });
    }
    
    if (allResults.length === 0) {
        if (reviewLink) reviewLink.style.display = 'none';
    } else {
        if (reviewLink) reviewLink.style.display = 'inline-block';
    }

    resultsOverlay.classList.add("active");
}

btnBack.addEventListener("click", () => {
    if (confirm("Quit game? Progress won't be saved.")) {
        localStorage.setItem('showLevelScreen', 'true');
        window.location.href = "/dashboard/";
    }
});

btnNextRound.addEventListener("click", () => {
    localStorage.setItem('showLevelScreen', 'true');
    // Unlock level 6 when next round is clicked
    const currentUnlocked = parseInt(localStorage.getItem('unlockedLevel') || '1');
    if (currentUnlocked < 6) {
        localStorage.setItem('unlockedLevel', '6');
    }
    window.location.href = "/dashboard/";
});

// Review Overlay Logic
const reviewLink = document.querySelector('.review-link');
const reviewOverlay = document.getElementById('review-overlay');
const btnCloseReview = document.getElementById('btn-close-review');

if (reviewLink) {
    reviewLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (reviewOverlay) reviewOverlay.classList.add('active');
    });
}

if (btnCloseReview) {
    btnCloseReview.addEventListener('click', () => {
        if (reviewOverlay) reviewOverlay.classList.remove('active');
    });
}

// Settings & Audio
let bgMusic, correctSound, incorrectSound;

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

function initSettings() {
    initAudio();
    const settingsBtn = document.getElementById("btn-settings");
    const settingsPopover = document.getElementById("settings-popover");
    const modeSwitch = document.getElementById("settings-mode-switch");
    const soundSlider = document.getElementById("settings-sound");
    const bgmSlider = document.getElementById("settings-bgm");

    if (settingsBtn && settingsPopover) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsPopover.classList.toggle("active");
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPopover.contains(e.target) && !settingsBtn.contains(e.target)) {
                settingsPopover.classList.remove("active");
            }
        });

        // Prevent closing when clicking inside
        settingsPopover.addEventListener('click', (e) => e.stopPropagation());
    }

    // Load saved settings
    const savedSound = localStorage.getItem("settings-sound") || 50;
    const savedBgm = localStorage.getItem("settings-bgm") || 50;
    const savedMode = localStorage.getItem("settings-mode") || "light";

    if (soundSlider) {
        soundSlider.value = savedSound;
        soundSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            localStorage.setItem("settings-sound", val);
            if (correctSound) correctSound.volume = val / 100;
            if (incorrectSound) incorrectSound.volume = val / 100;
        });
    }

    if (bgmSlider) {
        bgmSlider.value = savedBgm;
        bgmSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            localStorage.setItem("settings-bgm", val);
            if (bgMusic) bgMusic.volume = val / 100;
        });
    }

    if (modeSwitch) {
        modeSwitch.checked = savedMode === "dark";
        // Apply initial mode
        if (savedMode === "dark") {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

        modeSwitch.addEventListener('change', (e) => {
            const mode = e.target.checked ? "dark" : "light";
            document.body.classList.toggle("dark-mode", e.target.checked);
            localStorage.setItem("settings-mode", mode);
        });
    }
}

// Supabase Score Saving
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
        
        // Use correctAnswersCount for accurate percentage
        const accuracy = Math.round((correctAnswersCount / questions.length) * 100);
        
        // Loading state
        const originalText = btnSaveScore.innerText;
        btnSaveScore.innerText = "Saving...";
        btnSaveScore.disabled = true;

        try {
            const { data: existing, error: fetchError } = await supabaseClient
                .from('lvl5_scores')
                .select('*')
                .eq('user_email', loggedInEmail)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing) {
                const msg = `You already have a saved score for Level 5:\n` +
                    `Previous: Points: ${existing.points}, Treats: ${existing.treats}, Accuracy: ${existing.accuracy}%\n` +
                    `New: Points: ${score}, Treats: ${treats}, Accuracy: ${accuracy}%\n\nOverwrite?`;
                
                if (confirm(msg)) {
                    const { error: updateError } = await supabaseClient
                        .from('lvl5_scores')
                        .update({ points: score, treats, accuracy })
                        .eq('user_email', loggedInEmail);
                    
                    if (updateError) throw updateError;
                    alert("Score updated! 🏆");
                }
            } else {
                const { error: insertError } = await supabaseClient
                    .from('lvl5_scores')
                    .insert([{ user_email: loggedInEmail, points: score, treats, accuracy }]);
                
                if (insertError) throw insertError;
                alert("Level 5 score saved! 🏆");
            }
        } catch (err) {
            console.error('Supabase Error:', err);
            alert("Error saving score: " + (err.message || "Unknown error"));
        } finally {
            btnSaveScore.innerText = originalText;
            btnSaveScore.disabled = false;
        }
    };
}

initGame();
