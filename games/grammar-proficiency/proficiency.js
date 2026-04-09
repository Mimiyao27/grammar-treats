// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

// --- Authentication Check ---
if (!localStorage.getItem('loggedInEmail')) {
    window.location.href = '/';
}

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
const finalTotalTreats = document.getElementById("final-total-treats");
const btnBack = document.getElementById("btn-back");
const btnLeaderboardResults = document.getElementById('btn-leaderboard-results');
const modalLeaderboardGame = document.getElementById('modal-leaderboard-game');
const btnCloseLeaderboardGame = document.getElementById('btn-close-leaderboard-game');
const leaderboardListGame = document.getElementById('leaderboard-list-game');
const modalOverlay = document.getElementById('modal-overlay');

// Shuffle Array Utility (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Initialize Game
function initGame() {
    // Shuffle questions
    shuffleArray(questions);
    
    // Shuffle options for each question and update correct index
    questions.forEach(q => {
        const correctAnswerText = q.options[q.correct];
        shuffleArray(q.options);
        q.correct = q.options.indexOf(correctAnswerText);
    });

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

    if (isCorrect) {
        // Play correct sound
        if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log("Sound play blocked", e));
        }

        const correctTitles = [
            "Perfect! Great job!",
            "Well done! You got it right!",
            "Nice! Keep it up!",
            "Awesome! That's correct!"
        ];
        const randomTitle = correctTitles[Math.floor(Math.random() * correctTitles.length)];
        feedbackTitle.innerText = randomTitle;
        feedbackTitle.classList.remove('title-wrong');

        const rewards = [
            { text: "You got it right! Enjoy this chocolate bar!", visual: "🍫" },
            { text: "Correct! Here's a delicious cookie for you!", visual: "🍪" },
            { text: "You did it! Enjoy this yummy donut!", visual: "🍩" },
            { text: "You earned it! Have a juicy apple!", visual: "🍎" },
            { text: "Right answer! Treat yourself to a slice of cake!", visual: "🍰" }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        feedbackSubtitle.innerText = randomReward.text;
        feedbackImage.innerText = randomReward.visual;
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

        const incorrectTitles = [
            "Good effort!",
            "You're getting better!",
            "Almost there!",
            "Keep going!"
        ];
        const randomTitle = incorrectTitles[Math.floor(Math.random() * incorrectTitles.length)];
        feedbackTitle.innerText = randomTitle;
        feedbackTitle.classList.add('title-wrong');

        const retryMessages = [
            { text: "The cupcake melted — but snacks are waiting next round!", visual: "🧁" },
            { text: "The gummy bears escaped — better luck next time!", visual: "🍬" },
            { text: "The pizza was too hot — keep trying for a slice!", visual: "🍕" },
            { text: "Your ice cream melted — don't give up!", visual: "🍦" }
        ];
        const randomRetry = retryMessages[Math.floor(Math.random() * retryMessages.length)];
        feedbackSubtitle.innerText = randomRetry.text;
        feedbackImage.innerText = randomRetry.visual;
        feedbackSentence.style.backgroundColor = "#eb1e1e";
    }
    
    feedbackScorePill.textContent = `Points: ${isCorrect ? '100' : '0'}`;
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
    const playerName = localStorage.getItem('firstname') || 'Player';
    const nameSpan = document.getElementById('player-name');
    if (nameSpan) nameSpan.innerText = playerName;
    
    const resultsTitle = document.querySelector('.results-title');
    const resultsSubtitle = document.querySelector('.results-subtitle');
    if (resultsTitle && resultsSubtitle) {
        if (correctCount < 7) {
            resultsTitle.innerHTML = `Good Effort, <span id="player-name">${playerName}</span>!`;
            resultsTitle.style.color = "#eb1e1e";
            resultsSubtitle.textContent = "Let’s try again and beat this level.";
        } else {
            resultsTitle.innerHTML = `Great Job, <span id="player-name">${playerName}</span>!`;
        }
    }

    finalCorrect.innerText = `${correctCount}/${questions.length}`;
    finalPoints.innerText = score;
    finalTreats.innerText = treats;

    // Fetch Total Cumulative Treats
    (async () => {
        const loggedInEmail = localStorage.getItem('loggedInEmail');
        if (loggedInEmail && finalTotalTreats) {
            try {
                const { data: scores1 } = await supabaseClient.from('lvl1_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                const { data: scores2 } = await supabaseClient.from('lvl2_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                const { data: scores3 } = await supabaseClient.from('lvl3_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                const { data: scores4 } = await supabaseClient.from('lvl4_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                const { data: scores5 } = await supabaseClient.from('lvl5_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                
                let totalSaved = 0;
                if (scores1) totalSaved += scores1.treats;
                if (scores2) totalSaved += scores2.treats;
                if (scores3) totalSaved += scores3.treats;
                if (scores4) totalSaved += scores4.treats;
                if (scores5) totalSaved += scores5.treats;
                
                finalTotalTreats.innerText = totalSaved;
            } catch (e) {
                console.error("Error fetching total treats:", e);
            }
        }
    })();
    
    resultsPieChart.style.background = `conic-gradient(#4CAF50 0% ${percentage}%, #eb1e1e ${percentage}% 100%)`;
    
    // Show with active class (matching Punctuation)
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

btnNextRound.addEventListener("click", async () => {
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    let canUnlock = false;

    if (loggedInEmail) {
        try {
            const { data: s1 } = await supabaseClient.from('lvl1_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
            const { data: s2 } = await supabaseClient.from('lvl2_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
            const { data: s3 } = await supabaseClient.from('lvl3_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
            
            const total = (s1 ? s1.treats : 0) + (s2 ? s2.treats : 0) + (s3 ? s3.treats : 0);
            if (total >= 111) {
                canUnlock = true;
            }
        } catch (e) {
            console.error("Error checking unlock condition:", e);
        }
    }

    if (canUnlock) {
        // Ensure Level 4 is unlocked when returning to selection
        const currentUnlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
        if (currentUnlocked < 4) {
            localStorage.setItem("unlockedLevel", "4");
            alert("Congratulations! Level 4 is now unlocked! 🍬");
        }
        localStorage.setItem('showLevelScreen', 'true');
        window.location.href = "/dashboard/";
    } else {
        alert("You need at least 111 total treats saved (Level 1 + 2 + 3) to unlock Level 4. Keep practicing and don't forget to save your score!");
        localStorage.setItem('showLevelScreen', 'true');
        window.location.href = "/dashboard/";
    }
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

const capitalizeName = (name) => {
    if (!name) return "";
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

if (btnSaveScore) {
    btnSaveScore.onclick = async () => {
        const loggedInEmail = localStorage.getItem('loggedInEmail');
        if (!loggedInEmail) {
            alert("Warning: No user found. Score cannot be saved unless you are logged in.");
            return;
        }
        const accuracy = Math.round((score / 100 / questions.length) * 100);

        // Loading state
        const originalText = btnSaveScore.innerText;
        btnSaveScore.innerText = "Saving...";
        btnSaveScore.disabled = true;

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
        } finally {
            btnSaveScore.innerText = originalText;
            btnSaveScore.disabled = false;
        }
    };
}

// --- Leaderboard Logic ---
function generateMedal(rank) {
    let colors = {};
    if (rank === 1) {
        colors = { bg: '#FFCA28', border: '#FFB300' }; // Gold
    } else if (rank === 2) {
        colors = { bg: '#E0E0E0', border: '#BDBDBD' }; // Silver
    } else if (rank === 3) {
        colors = { bg: '#cd7f32', border: '#b87333' }; // Bronze
    } else {
        return `<div style="font-size: 1.2rem; font-weight: 900; color: #3b5998;">${rank}</div>`;
    }

    return `
        <div style="display: flex; justify-content: center;">
            <div style="position: relative; display: inline-block; width: 44px; height: 50px;">
                <svg width="34" height="20" viewBox="0 0 30 20" style="position: absolute; top: -5px; left: 5px; z-index: 1;">
                    <path d="M0 0 L10 20 L15 15 L20 20 L30 0 Z" fill="#e74c3c" stroke="white" stroke-width="1.5" />
                    <line x1="5" y1="0" x2="10" y2="10" stroke="white" stroke-width="1.5" />
                    <line x1="25" y1="0" x2="20" y2="10" stroke="white" stroke-width="1.5" />
                </svg>
                <div style="position: absolute; bottom: 0; left: 2px; width: 40px; height: 40px; border-radius: 50%; background: ${colors.bg}; border: 3px solid ${colors.border}; display: flex; justify-content: center; align-items: center; color: white; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 2; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); font-size: 1.2rem;">${rank}</div>
            </div>
        </div>
    `;
}

async function fetchLevel3LeaderboardData() {
    if (!leaderboardListGame) return;
    leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: white;">Loading leaderboard data...</div>';

    try {
        const [usersRes, lvl3Res] = await Promise.all([
            supabaseClient.from('users').select('email, firstname, lastname'),
            supabaseClient.from('lvl3_scores').select('user_email, points, treats, accuracy')
        ]);

        const users = usersRes.data || [];
        const lvl3Scores = lvl3Res.data || [];

        const playerStats = {};
        users.forEach(u => {
            playerStats[u.email] = {
                name: `${capitalizeName(u.firstname)} ${capitalizeName(u.lastname)}`,
                points: 0,
                treats: 0,
                accuracy: 0,
                hasScore: false
            };
        });

        lvl3Scores.forEach(row => {
            const email = row.user_email;
            if (playerStats[email]) {
                playerStats[email].points = row.points || 0;
                playerStats[email].treats = row.treats || 0;
                playerStats[email].accuracy = row.accuracy || 0;
                playerStats[email].hasScore = true;
            }
        });

        const leaderboard = Object.values(playerStats)
            .filter(p => p.hasScore)
            .sort((a, b) => b.points - a.points);

        leaderboardListGame.innerHTML = '';

        if (leaderboard.length === 0) {
            leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: white;">No players on the leaderboard yet!</div>';
            return;
        }

        leaderboard.forEach((player, index) => {
            const row = document.createElement('div');
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '80px 2fr 1.5fr 1.5fr 1fr';
            row.style.gap = '10px';
            row.style.alignItems = 'center';
            row.style.textAlign = 'center';
            row.style.padding = '15px 0';
            row.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
            row.style.fontWeight = '800';
            row.style.color = 'white';

            row.innerHTML = `
                ${generateMedal(index + 1)}
                <div style="text-align: left; padding-left: 10px;">${player.name}</div>
                <div>${player.points.toLocaleString()}</div>
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <img src="../../assets/images/candy-nobg.png" style="width: 24px; height: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">
                    ${player.treats}
                </div>
                <div>${player.accuracy}%</div>
            `;
            leaderboardListGame.appendChild(row);
        });

    } catch (error) {
        console.error('Error fetching leaderboard', error);
        leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: white;">Error loading leaderboard data.</div>';
    }
}

if (btnLeaderboardResults && modalLeaderboardGame) {
    btnLeaderboardResults.onclick = async () => {
        modalLeaderboardGame.classList.add('active');
        if (modalOverlay) modalOverlay.classList.add('active-leaderboard');
        await fetchLevel3LeaderboardData();
    };
}

if (btnCloseLeaderboardGame && modalLeaderboardGame) {
    btnCloseLeaderboardGame.onclick = () => {
        modalLeaderboardGame.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.remove('active-leaderboard');
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

const instructionsOverlay = document.getElementById('instructions-overlay');
const modalInstructions = document.getElementById('modal-instructions');
const btnStartInstructions = document.getElementById('btn-start-game-instructions');

if (instructionsOverlay && modalInstructions && btnStartInstructions) {
    btnStartInstructions.addEventListener('click', () => {
        instructionsOverlay.classList.remove('active');
        modalInstructions.classList.remove('active');
        initGame();
        
        // Audio requires interaction, so we start it here
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Music play blocked", e));
        }
    });
} else {
    initGame();
}
