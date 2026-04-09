// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

// --- Authentication Check ---
if (!localStorage.getItem('loggedInEmail')) {
    window.location.href = '/';
}

// Arrange the Word - Game Logic

const questions = [
    {
        sentence: "Peter Piper picked a peck of pickled peppers.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'Peter Piper' is singular, so the past tense verb 'picked' correctly matches the subject.</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (Peter Piper), then what he did (picked), then what he picked (a peck of pickled peppers).</div>"
    },
    {
        sentence: "She sells seashells on the sea shore.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'She' is singular, so the present tense verb takes -s -> 'sells.'</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (She), then what she does (sells), then what she sells (seashells), and finally where (on the sea shore).</div>"
    },
    {
        sentence: "My best friend bought a new book yesterday.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'My best friend' is singular, so the past tense verb 'bought' correctly matches the subject.</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (My best friend), then what they did (bought), then what they bought (a new book), and finally when it happened (yesterday).</div>"
    },
    {
        sentence: "The children played in the park after school.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'The children' is plural, so we use 'played' (past tense works for both singular and plural).</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (The children), then what they did (played), then where it happened (in the park), and finally when (after school).</div>"
    },
    {
        sentence: "I enjoy reading books before going to bed.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'I' is singular, so the present tense verb does not take -s -> 'enjoy.'</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (I), then what they do (enjoy), then what they enjoy (reading books), and finally when (before going to bed).</div>"
    },
    {
        sentence: "Every morning, she jogs around the lake before breakfast.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'She' is singular, so the present tense verb takes -s -> 'jogs.'</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say when (Every morning), then who (she), then what she does (jogs), then where (around the lake), and finally another time reference (before breakfast).</div>"
    },
    {
        sentence: "My grandma bakes cookies every weekend.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'My grandma' is singular, so the present tense verb takes -s -> 'bakes.'</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (My grandma), then what she does (bakes), then what she bakes (cookies), and finally when (every weekend).</div>"
    },
    {
        sentence: "The early bird catches the worm.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'The early bird' is singular, so the present tense verb takes -s -> 'catches.'</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (The early bird), then what it does (catches), and finally what it catches (the worm).</div>"
    },
    {
        sentence: "The dog ran to the park yesterday.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'The dog' is singular, so the past tense verb 'ran' correctly matches the subject.</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (The dog), then what it did (ran), then where it ran (to the park), and finally when (yesterday).</div>"
    },
    {
        sentence: "My little sister is learning how to ride a bike.",
        explanation: "<div class='explanation-section subject-verb-agreement'><strong>Subject-verb agreement:</strong> 'My little sister' is singular, so the verb phrase 'is learning' correctly matches the subject.</div> <div class='explanation-section word-order'><strong>Word order:</strong> First we say who (My little sister), then what she is doing (is learning), and finally what she is learning (how to ride a bike).</div>"
    }
];

let currentQuestion = 0;
let score = 0;
let treats = 0;
let timerSeconds = 60;
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
const finalTotalTreats = document.getElementById("final-total-treats");
const btnBack = document.getElementById("btn-back");
const btnLeaderboardResults = document.getElementById('btn-leaderboard-results');
const modalLeaderboardGame = document.getElementById('modal-leaderboard-game');
const btnCloseLeaderboardGame = document.getElementById('btn-close-leaderboard-game');
const leaderboardListGame = document.getElementById('leaderboard-list-game');
const modalOverlay = document.getElementById('modal-overlay');

// Initialize Game
function initGame() {
    shuffleArray(questions);
    loadQuestion();
    startTimer();
    initSettings();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
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
    const shuffledWords = q.sentence.split(" ");
    shuffleArray(shuffledWords);

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
        chip.addEventListener("touchstart", handleTouchStart, { passive: false });

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

    document.addEventListener("touchmove", moveHandler, { passive: false });
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

    if (isCorrect) {
        const correctTitles = [
            "Perfect!",
            "Well done! You got it right!",
            "Nice! Keep it up!",
            "Awesome! That's correct!"
        ];
        const randomTitle = correctTitles[Math.floor(Math.random() * correctTitles.length)];
        feedbackTitle.innerText = randomTitle;
        feedbackTitle.classList.remove('title-wrong');
        feedbackTitle.style.color = '';

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

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#7ac142', '#2f448c', '#FFD700'],
                zIndex: 2000
            });
        }
        if (correctSound) correctSound.play().catch(() => { });
    } else {
        const incorrectTitles = [
            "Good effort!",
            "You're getting better!",
            "Almost there!",
            "Keep going!"
        ];
        const randomTitle = incorrectTitles[Math.floor(Math.random() * incorrectTitles.length)];
        feedbackTitle.innerText = randomTitle;
        feedbackTitle.classList.add('title-wrong');
        feedbackTitle.style.color = '';

        const retryMessages = [
            { text: "The cupcake melted — but snacks are waiting next round!", visual: "🧁" },
            { text: "The gummy bears escaped — better luck next time!", visual: "🍬" },
            { text: "The pizza was too hot — keep trying for a slice!", visual: "🍕" },
            { text: "Your ice cream melted — don't give up!", visual: "🍦" },
            { text: "Don't give up! Keep practicing.", visual: "🥣" }
        ];
        const randomRetry = retryMessages[Math.floor(Math.random() * retryMessages.length)];
        feedbackSubtitle.innerText = randomRetry.text;
        feedbackImage.innerText = randomRetry.visual;

        if (incorrectSound) incorrectSound.play().catch(() => { });
    }

    feedbackScoreDisplay.textContent = `Points: ${isCorrect ? '100' : '0'}`;
    feedbackTreatsPill.innerText = `Treats: ${isCorrect ? '10' : '0'}`;
    feedbackSentence.innerText = q.sentence;
    feedbackExplanation.innerHTML = q.explanation;

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
        timerSeconds = 60;
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

    const playerName = localStorage.getItem('firstname') || 'Player';
    document.getElementById('player-name').innerText = playerName;

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

btnNextRound.addEventListener("click", async () => {
    const loggedInEmail = localStorage.getItem('loggedInEmail');
    let canUnlock = false;

    if (loggedInEmail) {
        try {
            const { data: s1 } = await supabaseClient.from('lvl1_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
            const { data: s2 } = await supabaseClient.from('lvl2_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
            const { data: s3 } = await supabaseClient.from('lvl3_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
            const { data: s4 } = await supabaseClient.from('lvl4_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();

            const total = (s1 ? s1.treats : 0) + (s2 ? s2.treats : 0) + (s3 ? s3.treats : 0) + (s4 ? s4.treats : 0);
            if (total >= 186) {
                canUnlock = true;
            }
        } catch (e) {
            console.error("Error checking unlock condition:", e);
        }
    }

    if (canUnlock) {
        // Ensure Level 5 is unlocked when returning to selection
        const currentUnlocked = parseInt(localStorage.getItem("unlockedLevel") || "1");
        if (currentUnlocked < 5) {
            localStorage.setItem("unlockedLevel", "5");
            alert("Congratulations! Level 5 is now unlocked! 🍬");
        }
        localStorage.setItem('showLevelScreen', 'true');
        window.location.href = "/dashboard/";
    } else {
        alert("You need at least 186 total treats saved (Level 1 + 2 + 3 + 4) to unlock Level 5. Keep practicing and don't forget to save your score!");
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

const capitalizeName = (name) => {
    if (!name) return "";
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

if (btnSaveScore) {
    btnSaveScore.onclick = async () => {
        const email = localStorage.getItem('loggedInEmail');
        if (!email) {
            alert("Please log in to save your score.");
            return;
        }

        const accuracy = Math.round((score / 100 / questions.length) * 100);

        // Loading state
        const originalText = btnSaveScore.innerText;
        btnSaveScore.innerText = "Saving...";
        btnSaveScore.disabled = true;

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

async function fetchLevel4LeaderboardData() {
    if (!leaderboardListGame) return;
    leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: #2f448c;">Loading leaderboard data...</div>';

    try {
        const [usersRes, lvl4Res] = await Promise.all([
            supabaseClient.from('users').select('email, firstname, lastname'),
            supabaseClient.from('lvl4_scores').select('user_email, points, treats, accuracy')
        ]);

        const users = usersRes.data || [];
        const lvl4Scores = lvl4Res.data || [];

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

        lvl4Scores.forEach(row => {
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
        await fetchLevel4LeaderboardData();
    };
}

if (btnCloseLeaderboardGame && modalLeaderboardGame) {
    btnCloseLeaderboardGame.onclick = () => {
        modalLeaderboardGame.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.remove('active-leaderboard');
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
        if (bgMusic.paused) bgMusic.play().catch(() => { });
    }, { once: true });
}

const instructionsOverlay = document.getElementById('instructions-overlay');
const modalInstructions = document.getElementById('modal-instructions');
const btnStartInstructions = document.getElementById('btn-start-game-instructions');

if (instructionsOverlay && modalInstructions && btnStartInstructions) {
    btnStartInstructions.addEventListener('click', () => {
        instructionsOverlay.classList.remove('active');
        modalInstructions.classList.remove('active');
        initGame();
        
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Music play blocked", e));
        }
    });
} else {
    initGame();
}
