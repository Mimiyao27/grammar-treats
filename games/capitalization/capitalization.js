// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

// --- Authentication Check ---
if (!localStorage.getItem('loggedInEmail')) {
    window.location.href = '/';
}

/* --- Capitalization Game Logic --- */

const questions = [
    {
        sentence: ["on", "friday,", "the", "students", "presented", "their", "science", "projects."],
        correct: ["On", "Friday,", "the", "students", "presented", "their", "science", "projects."],
        explanation: "We need to capitalize \"On\" because it is the first word in the sentence and \"Friday\" because it is a day of the week."
    },
    {
        sentence: ["my", "little", "brother,", "sam,", "built", "a", "treehouse", "in", "our", "backyard."],
        correct: ["My", "little", "brother,", "Sam,", "built", "a", "treehouse", "in", "our", "backyard."],
        explanation: "The word \"My\" is capitalized because it begins the sentence, and \"Sam\" is capitalized as a proper noun. Commas are used to set off \"Sam\" as an appositive, which renames \"my little brother.\""
    },
    {
        sentence: ["mrs.", "garcia,", "our", "english", "teacher,", "explained", "the", "assignment", "clearly."],
        correct: ["Mrs.", "Garcia,", "our", "English", "teacher,", "explained", "the", "assignment", "clearly."],
        explanation: "We need to capitalize \"Mrs.\" because it is a title, \"Garcia\" because it is a proper name, and \"English\" because it is the name of a language."
    },
    {
        sentence: ["during", "art", "class,", "i", "painted", "a", "picture", "of", "mayon", "volcano."],
        correct: ["During", "Art", "class,", "I", "painted", "a", "picture", "of", "Mayon", "Volcano."],
        explanation: "The word \"During\" is capitalized because it begins the sentence. \"Art\" is capitalized because it is the name of a specific subject, and \"Mayon Volcano\" is capitalized as a proper noun referring to a specific geographic landmark."
    },
    {
        sentence: ["my", "friend,", "liza,", "bakes", "delicious", "banana", "cakes", "every", "weekend."],
        correct: ["My", "friend,", "Liza,", "bakes", "delicious", "banana", "cakes", "every", "weekend."],
        explanation: "We need to capitalize \"My\" because it is the first word in the sentence and \"Liza\" because it is a proper name."
    },
    {
        sentence: ["i", "helped", "my", "neighbor,", "mr.", "delos", "santos,", "water", "the", "plants."],
        correct: ["I", "helped", "my", "neighbor,", "Mr.", "Delos", "Santos,", "water", "the", "plants."],
        explanation: "We need to capitalize \"I\" because it is the first word in the sentence and \"Mr. Delos Santos\" because it is a title and full proper name."
    },
    {
        sentence: ["during", "computer", "class,", "we", "learned", "to", "create", "a", "presentation", "in", "powerpoint."],
        correct: ["During", "Computer", "class,", "we", "learned", "to", "create", "a", "presentation", "in", "PowerPoint."],
        explanation: "We need to capitalize \"During\" because it is the first word in the sentence, \"Computer\" because it is the name of a class, and \"PowerPoint\" because it is the name of a software."
    },
    {
        sentence: ["my", "cat,", "whiskers,", "likes", "to", "sleep", "on", "the", "sofa."],
        correct: ["My", "cat,", "Whiskers,", "likes", "to", "sleep", "on", "the", "sofa."],
        explanation: "We need to capitalize \"My\" because it is the first word in the sentence and \"Whiskers\" because it is a proper name."
    },
    {
        sentence: ["on", "wednesday,", "our", "class", "went", "to", "intramuros", "for", "history", "tour."],
        correct: ["On", "Wednesday,", "our", "class", "went", "to", "Intramuros", "for", "history", "tour."],
        explanation: "We need to capitalize \"On\" because it is the first word in the sentence, \"Wednesday\" because it is a day of the week, and \"Intramuros\" because it is a proper name."
    },
    {
        sentence: ["the", "earth", "revolves", "around", "the", "sun", "once", "every", "365", "days."],
        correct: ["The", "Earth", "revolves", "around", "the", "Sun", "once", "every", "365", "days."],
        explanation: "We need to capitalize \"The\" because it is the first word in the sentence, \"Earth\" and \"Sun\" also need to capitalize because it is a proper name."
    }
];

let currentQuestionIndex = 0;
let userAnswers = [];
let selectedWordIndex = -1;
let totalScore = 0;
let totalTreats = 0;
let questionsCorrectCount = 0;
let questionResults = []; // To track { isCorrect, playerSentence, correctSentence, explanation }
let timeLeft = 60;
let timerInterval;
let bgMusic;
let correctSound;
let incorrectSound;
let clickSound;

document.addEventListener('DOMContentLoaded', () => {
    // Supabase Init
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const capitalizeName = (name) => {
        if (!name) return "";
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Elements
    const wordGrid = document.getElementById('word-grid');
    const questionTracker = document.getElementById('question-tracker');
    const btnSubmit = document.getElementById('btn-submit');
    const btnBack = document.getElementById('btn-back');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalType = document.getElementById('modal-type');
    const wordToCorrect = document.getElementById('word-to-correct');
    const typeInput = document.getElementById('type-input');
    const btnCancel = document.getElementById('btn-cancel');
    const btnDone = document.getElementById('btn-done');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const btnNext = document.getElementById('btn-next');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackSubtitle = document.getElementById('feedback-subtitle');
    const feedbackImage = document.getElementById('feedback-image');
    const feedbackScore = document.getElementById('feedback-score');
    const feedbackTreats = document.getElementById('feedback-treats');
    const feedbackSentence = document.getElementById('feedback-sentence');
    const feedbackExplanation = document.getElementById('feedback-explanation');

    const resultsOverlay = document.getElementById('results-overlay');
    const finalTotalScore = document.getElementById('final-total-score');
    const finalPoints = document.getElementById('final-points');
    const finalTreats = document.getElementById('final-treats');
    const finalTotalTreats = document.getElementById('final-total-treats');
    const finalMotivation = document.getElementById('final-motivation');
    const pieChart = document.getElementById('pie-chart');
    const btnNextLevel = document.getElementById('btn-next-level');
    const btnSaveScore = document.getElementById('btn-save-score');

    const btnReview = document.getElementById('btn-review');
    const reviewOverlay = document.getElementById('review-overlay');
    const reviewList = document.getElementById('review-list');
    const btnCloseReview = document.getElementById('btn-close-review');

    const btnLeaderboardResults = document.getElementById('btn-leaderboard-results');
    const modalLeaderboardGame = document.getElementById('modal-leaderboard-game');
    const btnCloseLeaderboardGame = document.getElementById('btn-close-leaderboard-game');
    const leaderboardListGame = document.getElementById('leaderboard-list-game');
    // Timer Elements
    const timerDisplay = document.getElementById('timer-display');
    const hudBar = document.querySelector('.hud-bar');
    // Settings Elements
    const btnSettings = document.getElementById('btn-settings');
    const settingsPopover = document.getElementById('settings-popover');
    const soundSlider = document.getElementById('settings-sound');
    const bgmSlider = document.getElementById('settings-bgm');
    const modeSwitch = document.getElementById('settings-mode-switch');

    const candyColors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'];
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

        bgMusic = new Audio('/assets/audio/bgmusic.mp3');
        bgMusic.loop = true;
        bgMusic.volume = savedBgm / 100;

        correctSound = new Audio('/assets/audio/correct.mp3');
        correctSound.volume = savedSound / 100;

        incorrectSound = new Audio('/assets/audio/incorrect.wav');
        incorrectSound.volume = savedSound / 100;

        clickSound = new Audio('/assets/audio/click.wav');
        clickSound.volume = savedSound / 100;

        // Apply saved settings to UI
        if (soundSlider) soundSlider.value = savedSound;
        if (bgmSlider) bgmSlider.value = savedBgm;
        if (modeSwitch) {
            modeSwitch.checked = savedMode === 'dark';
        }
    }

    // Start playing on first interaction (click, mousemove, etc.)
    const startAudioInteraction = () => {
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Music play blocked", e));
        }
        // Remove listeners once they've triggered
        ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
            document.removeEventListener(evt, startAudioInteraction);
        });
    };

    ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, startAudioInteraction, { once: true });
    });

    // --- Settings Interaction Logic ---
    if (btnSettings && settingsPopover) {
        btnSettings.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            settingsPopover.classList.toggle('active');
        });

        // Close popover when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsPopover.contains(e.target) && !btnSettings.contains(e.target)) {
                settingsPopover.classList.remove('active');
            }
        });

        // Prevent clicks inside popover from closing it
        settingsPopover.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Slider Listeners
        if (soundSlider) {
            soundSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                localStorage.setItem('settings-sound', val);
                if (correctSound) correctSound.volume = val / 100;
                if (incorrectSound) incorrectSound.volume = val / 100;
                if (clickSound) clickSound.volume = val / 100;
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

    function loadQuestion(index) {
        currentQuestionIndex = index;
        if (questionTracker) {
            questionTracker.innerText = `Question ${index + 1} of ${questions.length}`;
        }
        const q = questions[index];
        userAnswers = [...q.sentence]; // Start with the lowercase version

        renderWords();
        feedbackOverlay.classList.add('hidden');
        startTimer();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 60;
        updateTimerDisplay();
        
        if (hudBar) hudBar.classList.remove('low-time'); // Removing this just in case it was stuck

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                btnSubmit.click(); // Auto-submit when time is up
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function renderWords() {
        wordGrid.innerHTML = '';
        userAnswers.forEach((word, idx) => {
            const btn = document.createElement('button');
            btn.className = 'word-btn';
            if (word !== questions[currentQuestionIndex].sentence[idx]) {
                btn.classList.add('corrected');
            }

            // Add Candy Decoration
            const candy = document.createElement('div');
            const color = candyColors[idx % candyColors.length];
            candy.className = `candy-icon candy-${color}`;
            candy.innerHTML = `
            <img src="/assets/images/candy-nobg.png" alt="Candy icon">
        `;

            btn.appendChild(candy);
            const textNode = document.createTextNode(word);
            btn.appendChild(textNode);

            btn.onclick = () => openModal(idx);
            wordGrid.appendChild(btn);
        });
    }

    function openModal(idx) {
        if (clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Click sound blocked", e));
        }
        selectedWordIndex = idx;
        wordToCorrect.innerText = questions[currentQuestionIndex].sentence[idx];
        typeInput.value = ''; // Always start with an empty input as requested

        modalOverlay.style.display = 'block';
        modalType.style.display = 'block';
        typeInput.focus();
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        modalType.style.display = 'none';
        typeInput.value = '';
    }

    btnCancel.onclick = closeModal;

    btnDone.onclick = () => {
        const val = typeInput.value.trim();
        if (val) {
            userAnswers[selectedWordIndex] = val;
            renderWords();
        }
        closeModal();
    };

    typeInput.onkeydown = (e) => {
        if (e.key === 'Enter') btnDone.click();
    };

    typeInput.oninput = () => {
        typeInput.value = typeInput.value.replace(/\s+/g, '');
    };

    btnSubmit.onclick = () => {
        stopTimer();
        const q = questions[currentQuestionIndex];
        let isCorrect = true;
        let earnedTreatsThisRound = 0;

        userAnswers.forEach((word, idx) => {
            const correctWord = q.correct[idx];
            const originalWord = q.sentence[idx];

            // Check if word matches correct capitalization
            if (word === correctWord) {
                // Give 1 point if it was a word the user HAD to capitalize (original != correct)
                if (originalWord !== correctWord) {
                    earnedTreatsThisRound++;
                }
            } else {
                isCorrect = false;
            }
        });

        totalTreats += earnedTreatsThisRound;

        if (isCorrect) {
            totalScore += 100;
            questionsCorrectCount++;

            // Play correct sound
            if (correctSound) {
                correctSound.currentTime = 0;
                correctSound.play().catch(e => console.log("Sound play blocked", e));
            }

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
        }

        questionResults.push({
            isCorrect: isCorrect,
            playerSentence: userAnswers.join(' '),
            correctSentence: q.correct.join(' '),
            explanation: q.explanation
        });

        showFeedback(isCorrect, isCorrect ? 100 : 0, earnedTreatsThisRound);
    };

    function showFeedback(correct, earnedScore, earnedTreats) {
        const q = questions[currentQuestionIndex];
        const fullCorrectSentence = q.correct.join(' ');

        if (correct) {
            const correctTitles = [
                "Correct! Great job!",
                "Well done! You got it right!",
                "Nice! Keep it up!",
                "Awesome! That’s correct!"
            ];
            const randomTitle = correctTitles[Math.floor(Math.random() * correctTitles.length)];
            feedbackTitle.innerText = randomTitle;
            feedbackTitle.classList.remove('title-wrong');

            const rewards = [
                { text: "You got it right! Enjoy this chocolate bar!", visual: "🍫" },
                { text: "Correct! Here’s a delicious cookie for you!", visual: "🍪" },
                { text: "You did it! Enjoy this yummy donut!", visual: "🍩" },
                { text: "You earned it! Have a juicy apple!", visual: "🍎" },
                { text: "Right answer! Treat yourself to a slice of pizza!", visual: "🍕" }
            ];
            const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
            feedbackSubtitle.innerText = randomReward.text;
            feedbackImage.innerText = randomReward.visual;
        } else {
            const incorrectTitles = [
                "Good effort!",
                "You’re getting better!",
                "Almost there!",
                "Keep going!"
            ];
            const randomTitle = incorrectTitles[Math.floor(Math.random() * incorrectTitles.length)];
            feedbackTitle.innerText = randomTitle;
            feedbackTitle.classList.add('title-wrong');

            if (earnedTreats > 0) {
                const partialRewards = [
                    { text: `Nice! You got ${earnedTreats} word${earnedTreats > 1 ? 's' : ''} right and earned treats!`, visual: "🍬" },
                    { text: `Good job! Here are ${earnedTreats} treat${earnedTreats > 1 ? 's' : ''} for the correct capitalization!`, visual: "🍭" },
                    { text: `You're learning! Enjoy these ${earnedTreats} tasty treat${earnedTreats > 1 ? 's' : ''}!`, visual: "🍪" }
                ];
                const randomPartial = partialRewards[Math.floor(Math.random() * partialRewards.length)];
                feedbackSubtitle.innerText = randomPartial.text;
                feedbackImage.innerText = randomPartial.visual;
            } else {
                const retryMessages = [
                    { text: "The cupcake melted — but snacks are waiting next round!", visual: "🧁" },
                    { text: "The gummy bears escaped — better luck next time!", visual: "🍬" },
                    { text: "The pizza was too hot — keep trying for a slice!", visual: "🍕" },
                    { text: "Your ice cream melted — don't give up!", visual: "🍦" }
                ];
                const randomRetry = retryMessages[Math.floor(Math.random() * retryMessages.length)];
                feedbackSubtitle.innerText = randomRetry.text;
                feedbackImage.innerText = randomRetry.visual;
            }
        }

        feedbackScore.textContent = `Points: ${earnedScore}`;
        feedbackTreats.innerText = earnedTreats;
        feedbackSentence.innerText = fullCorrectSentence;
        feedbackExplanation.innerText = q.explanation;

        btnNext.innerText = (currentQuestionIndex < questions.length - 1) ? "Next Question" : "Complete Level";
        feedbackOverlay.classList.remove('hidden');
    }

    btnNext.onclick = () => {
        feedbackOverlay.classList.add('hidden');

        if (currentQuestionIndex < questions.length - 1) {
            loadQuestion(currentQuestionIndex + 1);
        } else {
            showResults();
        }
    };

    function showResults() {
        // Fetch player name securely
        let playerName = 'Player';
        try {
            playerName = localStorage.getItem('firstname') || 'Player';
        } catch (e) { }

        const nameSpan = document.getElementById('player-name');
        if (nameSpan) nameSpan.textContent = playerName;

        const resultsTitle = document.querySelector('.results-title');
        const resultsSubtitle = document.querySelector('.results-subtitle');
        if (resultsTitle && resultsSubtitle) {
            if (questionsCorrectCount < 7) {
                resultsTitle.innerHTML = `Good Effort, <span id="player-name">${playerName}</span>!`;
                resultsTitle.style.color = "#eb1e1e";
                resultsSubtitle.textContent = "Let’s try again and beat this level.";
            } else {
                resultsTitle.innerHTML = `Great Job, <span id="player-name">${playerName}</span>!`;
            }
        }

        resultsOverlay.classList.remove('hidden');

        finalTotalScore.innerText = `${questionsCorrectCount}/${questions.length}`;
        finalPoints.innerText = totalScore;
        finalTreats.innerText = totalTreats;

        // Fetch Total Cumulative Treats
        (async () => {
            const loggedInEmail = localStorage.getItem('loggedInEmail');
            if (loggedInEmail && finalTotalTreats) {
                try {
                    const levels = ['lvl1_scores', 'lvl2_scores', 'lvl3_scores', 'lvl4_scores', 'lvl5_scores'];
                    const { data: scores1 } = await supabase.from('lvl1_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                    const { data: scores2 } = await supabase.from('lvl2_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                    const { data: scores3 } = await supabase.from('lvl3_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                    const { data: scores4 } = await supabase.from('lvl4_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                    const { data: scores5 } = await supabase.from('lvl5_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                    
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

        // Dynamic Motivational Message
        const motivationMessages = {
            0: "Keep trying! Everyone starts somewhere — you can do it!",
            1: "Hey, don’t give up! Everyone starts somewhere — try again, you can do it!",
            2: "Good start! Keep trying — you’re learning!",
            3: "Nice effort! You’re getting there!",
            4: "You’re improving! Keep pushing!",
            5: "Halfway there! Great job!",
            6: "Good job! You’re getting better!",
            7: "Great work! You’re improving fast!",
            8: "Awesome! You’re doing really well!",
            9: "Excellent! Almost perfect!",
            10: "PERFECT! You nailed it!"
        };
        finalMotivation.innerText = motivationMessages[questionsCorrectCount] || "Keep practicing — every great reader started just like you! 💪";

        // Calculate Pie Chart (Correct vs Incorrect)
        const correctPercent = Math.round((questionsCorrectCount / questions.length) * 100);
        if (pieChart) {
            pieChart.style.background = `conic-gradient(#4CAF50 0% ${correctPercent}%, #eb1e1e ${correctPercent}% 100%)`;
        }

        // Setup review section
        reviewList.innerHTML = '';
        questionResults.forEach((res, idx) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            if (!res.isCorrect) item.style.borderLeftColor = '#fca5a5';

            item.innerHTML = `
                <div class="review-label">QUESTION ${idx + 1}</div>
                <div class="review-player-answer ${res.isCorrect ? 'correct' : 'wrong'}">
                    <strong>Your Answer:</strong> ${res.playerSentence}
                </div>
                <div class="review-correct">
                    <strong>Correct Answer:</strong> ${res.correctSentence}
                </div>
                <p class="review-explanation">${res.explanation}</p>
            `;
            reviewList.appendChild(item);
        });

        // Final celebration for high scores
        if (questionsCorrectCount >= 7 && typeof confetti === 'function') {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            // Also keep the side bursts
            (function frame() {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#5fb871', '#619bdc', '#FFD700'],
                    zIndex: 2000
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#5fb871', '#619bdc', '#FFD700'],
                    zIndex: 2000
                });

                if (Date.now() < animationEnd) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    btnSaveScore.onclick = async () => {
        const loggedInEmail = localStorage.getItem('loggedInEmail');
        if (!loggedInEmail) {
            alert("Warning: No user found. Score cannot be saved unless you are logged in.");
            return;
        }

        const accuracy = Math.round((questionsCorrectCount / questions.length) * 100);

        // Loading state
        const originalText = btnSaveScore.innerText;
        btnSaveScore.innerText = "Saving...";
        btnSaveScore.disabled = true;

        try {
            // Check if user already has a score saved for Level 1
            const { data: existingData, error: fetchError } = await supabase
                .from('lvl1_scores')
                .select('*')
                .eq('user_email', loggedInEmail)
                .maybeSingle(); // Returns null if no record exists, instead of throwing error 406

            if (fetchError) throw fetchError;

            if (existingData) {
                // If record exists, ask for confirmation to overwrite
                const message = `You already have a saved score for Level 1:\n` +
                    `Previous: Points: ${existingData.points}, Treats: ${existingData.treats}, Accuracy: ${existingData.accuracy}%\n` +
                    `New: Points: ${totalScore}, Treats: ${totalTreats}, Accuracy: ${accuracy}%\n\n` +
                    `Do you want to overwrite your previous record with this new one?`;

                if (confirm(message)) {
                    const { error: updateError } = await supabase
                        .from('lvl1_scores')
                        .update({
                            points: totalScore,
                            treats: totalTreats,
                            accuracy: accuracy
                        })
                        .eq('user_email', loggedInEmail);

                    if (updateError) throw updateError;
                    alert("Success! Your score has been updated! 🏆");
                }
            } else {
                // No existing record, insert new one
                const { error: insertError } = await supabase
                    .from('lvl1_scores')
                    .insert([{
                        user_email: loggedInEmail,
                        points: totalScore,
                        treats: totalTreats,
                        accuracy: accuracy
                    }]);

                if (insertError) throw insertError;
                alert("Congrats! Your Level 1 results have been saved! 🏆");
            }
            console.log("Stats processed successfully for lvl1_scores!");
        } catch (err) {
            alert("Oops! There was a problem saving your score: " + (err.message || "Unknown Error"));
            console.error("Error saving stats:", err);
        } finally {
            btnSaveScore.innerText = originalText;
            btnSaveScore.disabled = false;
        }
    };

    btnNextLevel.onclick = async () => {
        // Fetch saved lvl1 treats to ensure they have enough TO UNLOCK
        const loggedInEmail = localStorage.getItem('loggedInEmail');
        let canUnlock = false;

        if (loggedInEmail) {
            try {
                const { data, error } = await supabase
                    .from('lvl1_scores')
                    .select('treats')
                    .eq('user_email', loggedInEmail)
                    .maybeSingle();
                
                if (data && data.treats >= 21) {
                    canUnlock = true;
                }
            } catch (e) {
                console.error("Error checking unlock condition:", e);
            }
        }

        if (canUnlock) {
            // Unlock Level 2 progress
            localStorage.setItem('unlockedLevel', '2');
            alert("Congratulations! Level 2 is now unlocked! 🍬");
        } else {
            alert("You need at least 21 treats saved from Level 1 to unlock Level 2. Keep practicing and don't forget to save your score!");
        }

        // Save latest stats to show on dashboard
        localStorage.setItem('latestScore', totalScore);
        localStorage.setItem('latestTreats', totalTreats);
        // Set flag to show level selection on dashboard
        localStorage.setItem('showLevelScreen', 'true');
        // Return to dashboard
        window.location.href = '/dashboard/';
    };

    btnReview.onclick = () => {
        reviewOverlay.classList.remove('hidden');
    };

    btnCloseReview.onclick = () => {
        reviewOverlay.classList.add('hidden');
    };

    // --- Leaderboard Results Logic ---
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

    async function fetchLevel1LeaderboardData() {
        if (!leaderboardListGame) return;
        leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: white;">Loading leaderboard data...</div>';

        try {
            // Fetch users and level 1 scores
            const [usersRes, lvl1Res] = await Promise.all([
                supabase.from('users').select('email, firstname, lastname'),
                supabase.from('lvl1_scores').select('user_email, points, treats, accuracy')
            ]);

            const users = usersRes.data || [];
            const lvl1Scores = lvl1Res.data || [];

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

            lvl1Scores.forEach(row => {
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
                        <img src="/assets/images/candy-nobg.png" style="width: 24px; height: 24px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">
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
            await fetchLevel1LeaderboardData();
        };
    }

    if (btnCloseLeaderboardGame && modalLeaderboardGame) {
        btnCloseLeaderboardGame.onclick = () => {
            modalLeaderboardGame.classList.remove('active');
            if (modalOverlay) modalOverlay.classList.remove('active-leaderboard');
        };
    }

    btnBack.onclick = () => {
        if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
            window.location.href = '/dashboard/';
        }
    };

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- Start ---
    function initGame() {
        initAudio();
        shuffleArray(questions);
        loadQuestion(0);
    }
    
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
});
