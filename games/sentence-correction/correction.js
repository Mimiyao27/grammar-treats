// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

// --- Authentication Check ---
if (!localStorage.getItem('loggedInEmail')) {
    window.location.href = '/';
}

// Sentence Correction - Game Logic

const questions = [
    {
        incorrect: "john and me goes to the mall every weekend but he dont likes shopping",
        correct: "John and I go to the mall every weekend, but he doesn’t like shopping.",
        alternatives: [
            "John and I go to the mall every weekend, but he doesn't like shopping.",
            "John and I go to the mall every weekend, but he does not like shopping.",
            "John goes to the mall every weekend with me, but he doesn’t like shopping.",
            "John goes to the mall every weekend with me, but he does not like shopping."
        ],
        
        explanation: `[CORRECTED] John and I go to the mall every weekend, but he doesn't like shopping.\nCapitalization: "john" → John (names always start with a capital letter).\nPronoun usage: "me" → I (subject pronoun is needed because it's part of the compound subject: "John and I").\nVerb agreement: "goes" → go (plural subject "John and I" takes the base form).\nTime expression: "every weekends" → every weekend ("every" is followed by singular form of the time unit).\nContractions / verb form: “don’t likes” → doesn’t like (singular subject “he” uses “does,” and the main verb stays in base form: like).\nPunctuation: Added a comma before "but" to separate two independent clauses.`
    },
    {
        incorrect: "me and my friend was waiting for the bus when it start rain",
        correct: "My friend and I were waiting for the bus when it started raining.",
        alternatives: [
            "My friend and I were waiting for the bus when it started to rain.",
            "My friend and I were waiting for the bus when it started to rain.",
            "While my friend and I were waiting for the bus, it started raining.",
            "While my friend and I were waiting for the bus, it started to rain."
        ],
        explanation: `[CORRECTED] My friend and I were waiting for the bus when it started raining.\nPronoun usage: “me and my friend” → My friend and I (use subject pronoun form in formal writing).\nVerb agreement: “was waiting” → were waiting (plural subject requires plural verb).\nVerb tense: “start rain” → started raining (past actions must use correct past tense verbs).`
    },
    {
        incorrect: "the teacher dont explains the lesson clearly and the students confused",
        correct: "The teacher doesn’t explain the lesson clearly, and the students are confused.",
        alternatives: [
            "The teacher doesn't explain the lesson clearly, and the students are confused.",
            "The teacher does not explain the lesson clearly, and the students are confused.",
            "The teacher doesn’t explain the lesson clearly, so the students are confused.",
            "The teacher does not explain the lesson clearly, so the students are confused."
        ],
        explanation: `[CORRECTED] The teacher doesn’t explain the lesson clearly, and the students are confused.\nVerb agreement: “don’t explains” → doesn’t explain (singular subject “teacher” uses “does,” and verb stays base form).\nVerb form: “explains” → explain (after “doesn’t,” the verb should not have -s).\nSubject-verb agreement: “students confused” → students are confused (a complete sentence needs a linking verb).\nPunctuation: A comma is used before “and” to separate two related independent clauses.`
    },
    {
        incorrect: "yesterday we goes to the park and play football its fun",
        correct: "Yesterday, we went to the park and played football. It was fun.",
        alternatives: [
            "Yesterday we went to the park and played football. It was fun.",
            "Yesterday we went to the park and played football. It was fun.",
            "Yesterday, we went to the park and played football; it was fun.",
            "Yesterday we went to the park, played football, and had fun."
        ],
        explanation: `[CORRECTED] Yesterday, we went to the park and played football. It was fun.\nVerb tense: “goes” → went (past time marker “yesterday” requires past tense).\nVerb form consistency: “play” → played (verbs must stay in past tense).\nSentence structure: Ideas are separated for clarity or joined using proper punctuation.`
    },
    {
        incorrect: "Its time for lunch and the students are waiting in the cafeteria.",
        correct: "It’s time for lunch, and the students are waiting in the cafeteria.",
        alternatives: [
            "It's time for lunch, and the students are waiting in the cafeteria.",
            "It is time for lunch, and the students are waiting in the cafeteria."
        ],
        explanation: `[CORRECTED] It’s time for lunch, and the students are waiting in the cafeteria.\nContraction: “its” → It’s (“it is” requires an apostrophe).\nCapitalization: Sentence starts with a capital letter.\nPunctuation: A comma is used before “and” to connect two complete ideas.
`
    },
    {
        incorrect: "your going to love this movie, it’s really funny.",
        correct: "You're going to love this movie; it's really funny.",
        alternatives: [
            "You are going to love this movie; it is really funny.",
            "You're going to love this movie, it is really funny.",
            "You are going to love this movie, it's really funny.",
            "You're going to love this movie, it's really funny.",
            "You are going to love this movie, it is really funny."
        ],
        explanation: `[CORRECTED] You’re going to love this movie; it’s really funny.\nContraction: “your” → you’re (“you are”).\nContraction: “its” → it’s (“it is”).\nPunctuation: A semicolon is used to connect two closely related independent clauses.`
    },
    {
        incorrect: "the childrens was playing outside but then it start to rain suddenly",
        correct: "The children were playing outside, but then it started to rain suddenly.",
        alternatives: [
            "The children were playing outside but then it started to rain suddenly.",
            "The children were playing outside when it started raining.",
            "The children were playing outside when it started to rain suddenly."
        ],
        explanation: `[CORRECTED] The children were playing outside, but then it started to rain suddenly.\nSpelling/word form: “childrens” → children (already plural, no “s” needed).\nVerb agreement: “was playing” → were playing (plural subject requires plural verb).\nVerb tense: “start” → started (past tense action).`
    },
    {
        incorrect: "mr lopez the english teacher explain us the story but we didnt understand nothing",
        correct: "Mr. Lopez, the English teacher, explained the story to us, but we didn’t understand anything.",
        alternatives: [
            "Mr. Lopez, the English teacher, explained the story to us, but we didn't understand anything.",
            "Mr. Lopez, the English teacher, explained the story to us, but we did not understand anything.",
            "Mr. Lopez, the English teacher, explained the story to us, but we didn’t understand it at all.",
            "Mr. Lopez, the English teacher, explained the story to us, but we did not understand it at all."
        ],
        explanation: `[CORRECTED] Mr. Lopez, the English teacher, explained the story to us, but we didn’t understand anything.\nCapitalization: “mr lopez” → Mr. Lopez (proper noun capitalization).\nPunctuation: Commas are used to separate the appositive phrase (“the English teacher”).\nVerb form: “explain” → explained (correct past tense verb).\nSentence structure: “explain us” → explained the story to us (correct verb pattern).\nDouble negative: “didn’t understand nothing” → didn’t understand anything (English avoids double negatives).`
    },
    {
        incorrect: "There going to the zoo to see the lions and elephants.",
        correct: "They’re going to the zoo to see the lions and elephants.",
        alternatives: [
            "They're going to the zoo to see the lions and elephants.",
            "They are going to the zoo to see the lions and elephants.",
            "They’re going to the zoo to see lions and elephants.",
            "They are going to the zoo to see lions and elephants."
        ],
        explanation: `[CORRECTED] They’re going to the zoo to see the lions and elephants.\nWord form: “their” → they’re (“they are”).\nVerb form: “going” is correct for future intention (present continuous form).\nClarity: Articles are optional before plural nouns in general statements.`
    },
    {
        incorrect: "i and my classmates goes to library every morning, read books, learn grammar and practice writing but sometime we forget our books",
        correct: "My classmates and I go to the library every morning to read books, learn grammar, and practice writing, but sometimes we forget our books.",
        alternatives: [
            "My classmates and I go to the library every morning to read books, learn grammar and practice writing, but sometimes we forget our books.",
            "My classmates and I go to the library every morning. We read books, learn grammar, and practice writing, but sometimes we forget our books.",
            "My classmates and I go to the library every morning; we read books, learn grammar, and practice writing, but sometimes we forget our books."
        ],
        explanation: `[CORRECTED] My classmates and I go to the library every morning to read books, learn grammar, and practice writing, but sometimes we forget our books.\nPronoun usage: “I and my classmates” → My classmates and I (correct subject order; polite form places others first).\nVerb agreement: “goes” → go (plural subject requires base verb).\nSentence structure: Actions are arranged in parallel form (read, learn, practice).\nAdverb form: “sometime” → sometimes (correct adverb meaning occasionally).\nPunctuation: Commas separate listed actions and ideas for clarity.`
    }
];

function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}


const SV_AGREEMENT_PREFIX = `<div class="explanation-title-center">Subject-Verb Agreement</div>
This means that the verb (action word) must match the subject (who or what is doing the action).
If the subject is singular (one person/thing), the verb usually ends with -s in the present tense.
If the subject is plural (more than one person/thing), the verb does not end with -s.
In the past tense, verbs change to match the time of action, not the number of the subject.\n`;

function formatExplanation(text) {
    let formattedText = text;
    const toBold = [
        "Capitalization:",
        "Pronoun usage:",
        "Verb agreement:",
        "Time expression:",
        "Contractions / verb agreement:",
        "Contractions / verb form",
        "Punctuation:",
        "Verb agreement / negation:",
        "Verb form:",
        "Verb agreement / tense:",
        "Contractions:",
        "Homophones / contractions:",
        "Plural noun:",
        "Verb tense:",
        "subject is singular",
        "subject is plural",
        "Subject-verb agreement:",
        "Verb form consistency:",
        "Sentence structure:",
        "Contraction:",
        "Spelling/word form:",
        "Double negative:",
        "Clarity:",
        "Word form:",
        "Adverb form:"
    ];

    toBold.forEach(term => {
        formattedText = formattedText.split(term).join(`<strong>${term}</strong>`);
    });

    // Split by newlines and wrap each non-empty line in a div with margin
    return formattedText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            let displayLine = line;
            let isCorrected = false;
            if (line.startsWith('[CORRECTED]')) {
                displayLine = line.replace('[CORRECTED]', '').trim();
                isCorrected = true;
            }
            return `<div class="explanation-row${isCorrected ? ' corrected-line' : ''}">${displayLine}</div>`;
        })
        .join('');
}

let currentLevel = 5;
let currentQuestion = 0;
let score = 0;
let treats = 0;
let correctAnswersCount = 0;
let allResults = [];
let timerSeconds = 120;
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
const explanationLink = document.getElementById("explanation-link");
const feedbackImage = document.getElementById("feedback-image");
const nextQuestionBtn = document.getElementById("btn-next-question");

const explanationOverlay = document.getElementById("explanation-overlay");
const btnCloseExplanation = document.getElementById("btn-close-explanation");

if (explanationLink) {
    explanationLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (explanationOverlay) {
            explanationOverlay.classList.add("active");
        }
    });
}

if (btnCloseExplanation) {
    btnCloseExplanation.addEventListener("click", () => {
        if (explanationOverlay) {
            explanationOverlay.classList.remove("active");
        }
    });
}

const resultsOverlay = document.getElementById("results-overlay");
const finalCorrect = document.getElementById("final-correct");
const finalPoints = document.getElementById("final-points");
const finalTreats = document.getElementById("final-treats");
const finalTotalTreats = document.getElementById("final-total-treats");
const resultsPieChart = document.getElementById("results-pie-chart");
const btnSaveScore = document.getElementById("btn-save-score");
const btnNextRound = document.getElementById("btn-next-round");
const btnBack = document.getElementById("btn-back");
const btnLeaderboardResults = document.getElementById('btn-leaderboard-results');
const modalLeaderboardGame = document.getElementById('modal-leaderboard-game');
const btnCloseLeaderboardGame = document.getElementById('btn-close-leaderboard-game');
const leaderboardListGame = document.getElementById('leaderboard-list-game');
const modalOverlay = document.getElementById('modal-overlay');

// Initialize
function initGame() {
    shuffleQuestions();
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
    timerSeconds = 120;
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
        explanation: formatExplanation(SV_AGREEMENT_PREFIX + "\n" + q.explanation)
    });
}

function showFeedback(isCorrect, userAns) {
    const q = questions[currentQuestion];

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
                origin: { y: 0.6 }
            });
        }
    } else {
        const incorrectTitles = [
            "Good effort!",
            "You're getting better!",
            "Almost there!",
            "Keep going!"
        ];
        if (userAns === "[Time ran out!]") {
            feedbackTitle.innerText = "Time's Up!";
        } else {
            const randomTitle = incorrectTitles[Math.floor(Math.random() * incorrectTitles.length)];
            feedbackTitle.innerText = randomTitle;
        }
        feedbackTitle.classList.add('title-wrong');

        const retryMessages = [
            { text: "The cupcake melted — but snacks are waiting next round!", visual: "🧁" },
            { text: "The gummy bears escaped — better luck next time!", visual: "🍬" },
            { text: "The pizza was too hot — keep trying for a slice!", visual: "🍕" },
            { text: "Your ice cream melted — don't give up!", visual: "🍦" },
            { text: "You've run out of cake — keep trying!", visual: "🍽️" }
        ];
        const randomRetry = retryMessages[Math.floor(Math.random() * retryMessages.length)];
        feedbackSubtitle.innerText = randomRetry.text;
        feedbackImage.innerText = randomRetry.visual;
    }

    feedbackScore.textContent = `Points: ${isCorrect ? '100' : '0'}`;
    feedbackTreatsDisplay.innerText = `Treats: ${isCorrect ? '10' : '2'}`;
    feedbackSentence.innerText = q.correct;

    if (!isCorrect && userAns === "[Time ran out!]") {
        feedbackExplanation.innerHTML = `<div style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #e74c3c;">Time is up! You didn't submit an answer.</div>` + formatExplanation(SV_AGREEMENT_PREFIX + "\n" + q.explanation);
        if (explanationLink) explanationLink.style.display = "inline-block";
    } else {
        feedbackExplanation.innerHTML = formatExplanation(SV_AGREEMENT_PREFIX + "\n" + q.explanation);
        if (explanationLink) explanationLink.style.display = "inline-block";
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
        timerSeconds = 120;
        loadQuestion();
        startTimer();
    } else {
        showResults();
    }
});

function showResults() {
    const percentage = (correctAnswersCount / questions.length) * 100;

    const playerName = localStorage.getItem('firstname') || 'Player';
    document.getElementById('player-name').innerText = playerName;

    const resultsTitle = document.querySelector('.results-title');
    const resultsSubtitle = document.querySelector('.results-subtitle');
    if (resultsTitle && resultsSubtitle) {
        if (correctAnswersCount < 7) {
            resultsTitle.innerHTML = `Good Effort, <span id="player-name">${playerName}</span>!`;
            resultsTitle.style.color = "#eb1e1e";
            resultsSubtitle.textContent = "Let’s try again and beat this level.";
        } else {
            resultsTitle.innerHTML = `Great Job, <span id="player-name">${playerName}</span>!`;
        }
    }

    finalCorrect.innerText = `${correctAnswersCount}/${questions.length}`;
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
    localStorage.setItem('showCertificatePopup', 'true');
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
            // Enable certificate button after save attempt
            if (btnNextRound) btnNextRound.disabled = false;
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

async function fetchLevel5LeaderboardData() {
    if (!leaderboardListGame) return;
    leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: #2f448c;">Loading leaderboard data...</div>';

    try {
        const [usersRes, lvl5Res] = await Promise.all([
            supabaseClient.from('users').select('email, firstname, lastname'),
            supabaseClient.from('lvl5_scores').select('user_email, points, treats, accuracy')
        ]);

        const users = usersRes.data || [];
        const lvl5Scores = lvl5Res.data || [];

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

        lvl5Scores.forEach(row => {
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
        await fetchLevel5LeaderboardData();
    };
}

if (btnCloseLeaderboardGame && modalLeaderboardGame) {
    btnCloseLeaderboardGame.onclick = () => {
        modalLeaderboardGame.classList.remove('active');
        if (modalOverlay) modalOverlay.classList.remove('active-leaderboard');
    };
}

const instructionsOverlay = document.getElementById('instructions-overlay');
const modalInstructions = document.getElementById('modal-instructions');
const btnStartInstructions = document.getElementById('btn-start-game-instructions');

if (instructionsOverlay && modalInstructions && btnStartInstructions) {
    btnStartInstructions.addEventListener('click', () => {
        instructionsOverlay.classList.remove('active');
        modalInstructions.classList.remove('active');
        initGame();
        
        // Start audio on click
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Music play blocked", e));
        }
    });
} else {
    initGame();
}
