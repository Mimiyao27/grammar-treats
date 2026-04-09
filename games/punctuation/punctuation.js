// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

// --- Authentication Check ---
if (!localStorage.getItem('loggedInEmail')) {
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
    // Supabase Init
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const capitalizeName = (name) => {
        if (!name) return "";
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    // Shuffle Array Utility (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Elements
    const balloons = document.querySelectorAll('.balloon');
    const timerDisplay = document.querySelector('.timer-display');
    const sentenceBox = document.querySelector('.sentence-box');
    const questionTracker = document.querySelector('.question-tracker');
    const btnBack = document.getElementById('btn-back');
    const btnSaveScore = document.getElementById('btn-save-score');
    const finalTotalTreats = document.getElementById('final-total-treats');

    const btnLeaderboardResults = document.getElementById('btn-leaderboard-results');
    const modalLeaderboardGame = document.getElementById('modal-leaderboard-game');
    const btnCloseLeaderboardGame = document.getElementById('btn-close-leaderboard-game');
    const leaderboardListGame = document.getElementById('leaderboard-list-game');
    const modalOverlay = document.getElementById('modal-overlay');

    // Audio and Settings Elements
    const btnSettings = document.getElementById('btn-settings');
    const settingsPopover = document.getElementById('settings-popover');
    const soundSlider = document.getElementById('settings-sound');
    const bgmSlider = document.getElementById('settings-bgm');
    const modeSwitch = document.getElementById('settings-mode-switch');

    let bgMusic, correctSound, incorrectSound, popSound;

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

        popSound = new Audio('../../assets/audio/balloon pop.mp3');
        popSound.volume = savedSound / 100;

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

    // --- Settings Interaction Logic ---
    if (btnSettings && settingsPopover) {
        btnSettings.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            settingsPopover.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!settingsPopover.contains(e.target) && !btnSettings.contains(e.target)) {
                settingsPopover.classList.remove('active');
            }
        });

        settingsPopover.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        if (soundSlider) {
            soundSlider.addEventListener('input', (e) => {
                const val = e.target.value;
                localStorage.setItem('settings-sound', val);
                if (correctSound) correctSound.volume = val / 100;
                if (incorrectSound) incorrectSound.volume = val / 100;
                if (popSound) popSound.volume = val / 100;
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

    if (btnBack) {
        btnBack.addEventListener('click', () => {
            if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
                localStorage.setItem('showLevelScreen', 'true');
                window.location.href = '/dashboard/';
            }
        });
    }

    // Initialize audio immediately
    initAudio();

    // Feedback overlay elements
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const btnNextQuestion = document.getElementById('btn-next-question');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackSubtitle = document.getElementById('feedback-subtitle');
    const feedbackImage = document.getElementById('feedback-image');
    const feedbackScore = document.getElementById('feedback-score');
    const feedbackTreats = document.getElementById('feedback-treats');
    const feedbackSentence = document.getElementById('feedback-sentence');
    const feedbackExplanation = document.getElementById('feedback-explanation');

    // Game Data (10 Questions matching user prompt)
    const questions = [
        {
            html: 'She went to the market <span class="blank">___</span>and bought some fruits.',
            correct: ',',
            choices: ['.', '?', ',', '!', ':'],
            completedSentence: 'She went to the market, and bought some fruits.',
            explanation: 'A <strong>comma</strong> is used to join two actions, but this sentence has nothing between "market" and "bought", so we need a comma.'
        },
        {
            html: 'What time is it <span class="blank">___</span> I need to leave soon.',
            correct: '?',
            choices: ['.', '?', ',', '!', ';'],
            completedSentence: 'What time is it? I need to leave soon.',
            explanation: 'A question mark is used for asking questions. Since "What time is it" is a question, we need a question mark.'
        },
        {
            html: 'I like apples, oranges, and bananas <span class="blank">___</span> they are all healthy.',
            correct: ';',
            choices: ['.', '?', ',', ';', ':'],
            completedSentence: 'I like apples, oranges, and bananas; they are all healthy.',
            explanation: 'A semicolon is used to connect two closely related independent clauses. In this sentence, both clauses are complete sentences, so a semicolon is used to link them instead of a comma.'
        },
        {
            html: 'My best friend, Anna, loves reading novels <span class="blank">___</span>',
            correct: '.',
            choices: ['.', '?', ',', '!', ';'],
            completedSentence: 'My best friend, Anna, loves reading novels.',
            explanation: 'A period is used to end a regular sentence, but it is missing at the end of this sentence.'
        },
        {
            html: 'I am going to the library <span class="blank">___</span> do you want to come with me <span class="blank">___</span>',
            correct: ', ?',
            choices: ['. .', ', ?', ', !', '; ?', ': .'],
            completedSentence: 'I am going to the library, do you want to come with me?',
            explanation: 'A comma separates clauses, and a question mark shows a question. This sentence needs both because the second part is a question.'
        },
        {
            html: 'My favorite subjects are Math <span class="blank">___</span> Science <span class="blank">___</span> and English.',
            correct: ', ,',
            choices: ['. .', '? ?', ', ,', '! !', '; ;'],
            completedSentence: 'My favorite subjects are Math, Science, and English.',
            explanation: 'Commas separate items in a list, but this sentence is missing commas between subjects, so we need them.'
        },
        {
            html: 'He said <span class="blank">___</span> "I will help you with your homework."',
            correct: ',',
            choices: ['.', '?', ',', '!', ':'],
            completedSentence: 'He said, "I will help you with your homework."',
            explanation: 'The correct sentence uses a comma before the direct quotation and quotation marks to indicate what was said.'
        },
        {
            html: 'I can’t believe it <span class="blank">___</span> She actually won the race.',
            correct: '!',
            choices: ['.', '?', ',', '!', ';'],
            completedSentence: 'I can’t believe it! She actually won the race.',
            explanation: 'An <strong>exclamation point</strong> should be used in the sentence because it expresses strong emotion—specifically surprise or disbelief—and clearly separates the first thought from the next sentence.'
        },
        {
            html: 'After school <span class="blank">___</span> we went to the park and played soccer for two hours.',
            correct: ',',
            choices: ['.', ',', '?', '!', ';'],
            completedSentence: 'After school, we went to the park and played soccer for two hours.',
            explanation: 'The phrase "After school" comes at the beginning of the sentence, so it needs a comma after it. The word "and" connects the two actions, "went to the park" and "played soccer for two hours," making the sentence smooth and correct.'
        },
        {
            html: 'Did you see that shooting star <span class="blank">___</span> it was amazing!',
            correct: '?',
            choices: ['.', '?', ',', '!', ':'],
            completedSentence: 'Did you see that shooting star? It was amazing!',
            explanation: 'A <strong>question mark</strong> is used for asking questions, but this sentence is missing it after "Did you see that shooting star", so we need a question mark there.'
        }
    ];

    let currentQuestionIndex = 0;
    let totalScore = 0;
    let totalTreats = 0;
    let correctAnswersCount = 0;
    let allResults = [];
    let timeLeft = 30; // 30 seconds
    let timerInterval;

    // Format timer
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 30;
        if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);

        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timeLeft = 0;
                // Automatically show incorrect feedback
                showFeedback(false, "Timeout");
            }
            if (timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
        }, 1000);
    }

    // Load question into UI
    function loadQuestion(index) {
        if (index >= questions.length) {
            // End of game scenario
            sentenceBox.innerHTML = '<h2>Great job!</h2><p>You completed all available questions.</p>';
            document.querySelector('.balloons-container').style.display = 'none';
            return;
        }

        const q = questions[index];
        if (questionTracker) questionTracker.textContent = `Question ${index + 1} of 10`;
        if (sentenceBox) sentenceBox.innerHTML = q.html;

        // Reset all balloons to original state and load dynamic choices
        balloons.forEach((b, i) => {
            b.style.transform = '';
            b.style.opacity = '1';
            b.style.pointerEvents = 'auto';

            const punctuationSpan = b.querySelector('.punctuation');
            if (q.choices && q.choices[i]) {
                const choice = q.choices[i];
                b.setAttribute('data-value', choice);
                if (punctuationSpan) punctuationSpan.textContent = choice;
                if (choice.length > 2) {
                    b.style.fontSize = '1.8rem'; // Shrink text if like ", ?"
                } else {
                    b.style.fontSize = '3rem';
                }
            }
        });

        // Hide feedback if visible
        if (feedbackOverlay) feedbackOverlay.classList.remove('active');

        // Start fresh timer
        startTimer();
    }

    // Show Results Screen
    function showResultsScreen() {
        const resultsOverlay = document.getElementById('results-overlay');
        if (!resultsOverlay) return;

        // Populate stats dynamically
        document.getElementById('final-correct').textContent = `${correctAnswersCount}/10`;
        document.getElementById('final-points').textContent = totalScore;
        document.getElementById('final-treats').textContent = totalTreats;

        // Fetch Total Cumulative Treats
        (async () => {
            const loggedInEmail = localStorage.getItem('loggedInEmail');
            if (loggedInEmail && finalTotalTreats) {
                try {
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

        // Render dynamic pie chart based on correct percentage
        const correctPercent = Math.round((correctAnswersCount / 10) * 100);
        const pieChart = document.getElementById('results-pie-chart');
        if (pieChart) {
            pieChart.style.background = `conic-gradient(#4CAF50 0% ${correctPercent}%, #eb1e1e ${correctPercent}% 100%)`;
        }

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
            if (correctAnswersCount < 7) {
                resultsTitle.innerHTML = `Good Effort, <span id="player-name">${playerName}</span>!`;
                resultsTitle.style.color = "#eb1e1e";
                resultsSubtitle.textContent = "Let’s try again and beat this level.";
            } else {
                resultsTitle.innerHTML = `Great Job, <span id="player-name">${playerName}</span>!`;
            }
        }

        // Setup review section
        const reviewContainer = document.getElementById('review-container');
        const reviewLink = document.querySelector('.review-link');

        if (reviewContainer) {
            reviewContainer.innerHTML = ''; // clear previous
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

        // Reveal safely
        resultsOverlay.classList.add('active');

        // Final celebration for high scores
        if (correctAnswersCount >= 7 && typeof confetti === 'function') {
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

    // Show feedback popup
    function showFeedback(isCorrect, clickedPunctuation) {
        if (!feedbackOverlay) return;

        const q = questions[currentQuestionIndex];

        // Update button text if on the final question
        if (btnNextQuestion) {
            if (currentQuestionIndex === questions.length - 1) {
                btnNextQuestion.textContent = "Complete Level";
            } else {
                btnNextQuestion.textContent = "Next Question";
            }
        }

        if (isCorrect) {
            correctAnswersCount++; // track correct responses securely
            totalScore += 100; // Award points for correct
            totalTreats += 2; // Award treats for correct

            // Play sound
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

            // Random correct titles
            const correctTitles = [
                "Perfect!",
                "Excellent!",
                "Amazing!",
                "Great job!",
                "You nailed it!"
            ];
            const randomCorrectTitle = correctTitles[Math.floor(Math.random() * correctTitles.length)];
            feedbackTitle.textContent = randomCorrectTitle;
            feedbackTitle.classList.remove('title-wrong');

            // Random correct rewards (subtitle + emoji)
            const correctRewards = [
                { text: "You've won a slice of cake!", visual: "🍰" },
                { text: "Correct! Enjoy this chocolate bar!", visual: "🍫" },
                { text: "Awesome! Here's a delicious cookie!", visual: "🍪" },
                { text: "You did it! Enjoy this yummy donut!", visual: "🍩" },
                { text: "Right answer! Treat yourself to a lollipop!", visual: "🍭" }
            ];
            const randomCorrectReward = correctRewards[Math.floor(Math.random() * correctRewards.length)];
            feedbackSubtitle.textContent = randomCorrectReward.text;
            feedbackImage.textContent = randomCorrectReward.visual;

            feedbackScore.textContent = `Points: 100`;
            if (feedbackTreats) feedbackTreats.textContent = `Treats: 2`;

            if (feedbackSentence) feedbackSentence.textContent = q.completedSentence;
            if (feedbackExplanation) feedbackExplanation.innerHTML = q.explanation;

            // Record for review
            allResults.push({
                isCorrect: true,
                userSentence: q.completedSentence,
                correctSentence: q.completedSentence,
                explanation: q.explanation
            });

        } else {
            totalTreats += 1; // Award 1 treat for incorrect

            // Play sound
            if (incorrectSound) {
                incorrectSound.currentTime = 0;
                incorrectSound.play().catch(e => console.log("Sound play blocked", e));
            }

            // Record incorrect answer for review
            let userString = '';
            if (clickedPunctuation === 'Timeout') {
                userString = '[Time ran out! No answer selected]';
            } else {
                const currentAnswers = clickedPunctuation.split(' ');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = q.html;
                let bIdx = 0;
                tempDiv.querySelectorAll('.blank').forEach(b => {
                    b.textContent = ` ${currentAnswers[bIdx++] || ''} `;
                });
                userString = tempDiv.textContent.replace(/\s+/g, ' ').trim();
            }

            allResults.push({
                isCorrect: false,
                userSentence: userString,
                correctSentence: q.completedSentence,
                explanation: q.explanation
            });

            // Random incorrect titles
            const incorrectTitles = [
                "Not quite!",
                "Good effort!",
                "Almost there!",
                "Keep going!"
            ];
            const randomIncorrectTitle = incorrectTitles[Math.floor(Math.random() * incorrectTitles.length)];
            feedbackTitle.textContent = randomIncorrectTitle;
            feedbackTitle.classList.add('title-wrong');

            // Random incorrect messages (subtitle + emoji)
            const incorrectRewards = [
                { text: "The cupcake melted — but snacks are waiting next round!", visual: "🧁" },
                { text: "The gummy bears escaped — better luck next time!", visual: "🍬" },
                { text: "You've run out of cake — keep trying!", visual: "🍽️" },
                { text: "Your ice cream melted — don't give up!", visual: "🍦" },
                { text: "The pizza was too hot — keep trying for a slice!", visual: "🍕" }
            ];
            const randomIncorrectReward = incorrectRewards[Math.floor(Math.random() * incorrectRewards.length)];
            feedbackSubtitle.textContent = randomIncorrectReward.text;
            feedbackImage.textContent = randomIncorrectReward.visual;

            feedbackScore.textContent = `Points: 0`;
            if (feedbackTreats) feedbackTreats.textContent = `Treats: 1`;

            if (feedbackSentence) feedbackSentence.textContent = q.completedSentence;

            if (feedbackExplanation) {
                if (clickedPunctuation === "Timeout") {
                    feedbackExplanation.innerHTML = `Time is up! You did not select an answer in time. The correct answer was "${q.correct}".`;
                } else {
                    feedbackExplanation.innerHTML = q.explanation;
                }
            }
        }

        // Show the modal
        feedbackOverlay.classList.add('active');
    }

    // Click handler for balloons
    balloons.forEach(balloon => {
        balloon.addEventListener('click', (e) => {
            const punctuation = balloon.getAttribute('data-value');
            const blanks = document.querySelectorAll('.blank');
            const q = questions[currentQuestionIndex];

            // Temporary interaction: fill the blank(s)
            const answers = punctuation.split(' '); // e.g. [",", "?"]
            blanks.forEach((blank, idx) => {
                if (answers[idx]) {
                    blank.textContent = ` ${answers[idx]} `;
                    blank.style.borderBottom = 'none';
                }
            });

            // Play pop sound
            if (popSound) {
                popSound.currentTime = 0;
                popSound.play().catch(e => console.log("Sound play blocked", e));
            }

            // Simple pop effect
            balloon.style.transform = 'scale(1.5)';
            balloon.style.opacity = '0';
            balloon.style.pointerEvents = 'none';

            // Check correctness 
            const isCorrect = (punctuation === q.correct);

            // Stop timer!
            clearInterval(timerInterval);

            // Show feedback after a small delay to let "pop" animation finish
            setTimeout(() => {
                showFeedback(isCorrect, punctuation);
            }, 500);
        });
    });

    // Next Question Button Handler
    if (btnNextQuestion) {
        btnNextQuestion.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion(currentQuestionIndex);
            } else {
                // Game effectively finished
                feedbackOverlay.classList.remove('active');
                showResultsScreen();
            }
        });
    }

    // Review Event Listeners
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

    const btnNextRound = document.querySelector('.btn-next-round');
    if (btnNextRound) {
        btnNextRound.addEventListener('click', async () => {
            const loggedInEmail = localStorage.getItem('loggedInEmail');
            let canUnlock = false;

            if (loggedInEmail) {
                try {
                    const { data: s1 } = await supabase.from('lvl1_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();
                    const { data: s2 } = await supabase.from('lvl2_scores').select('treats').eq('user_email', loggedInEmail).maybeSingle();

                    const total = (s1 ? s1.treats : 0) + (s2 ? s2.treats : 0);
                    if (total >= 36) {
                        canUnlock = true;
                    }
                } catch (e) {
                    console.error("Error checking unlock condition:", e);
                }
            }

            if (canUnlock) {
                localStorage.setItem('showLevelScreen', 'true');
                // Unlock level 3 when next round is clicked
                const currentUnlocked = parseInt(localStorage.getItem('unlockedLevel') || '1');
                if (currentUnlocked < 3) {
                    localStorage.setItem('unlockedLevel', '3');
                    alert("Congratulations! Level 3 is now unlocked! 🍬");
                }
                window.location.href = '/dashboard/';
            } else {
                alert("You need at least 36 total treats saved (Level 1 + Level 2) to unlock Level 3. Keep practicing and don't forget to save your score!");
                localStorage.setItem('showLevelScreen', 'true');
                window.location.href = '/dashboard/';
            }
        });
    }

    if (btnSaveScore) {
        btnSaveScore.onclick = async () => {
            const loggedInEmail = localStorage.getItem('loggedInEmail');
            if (!loggedInEmail) {
                alert("Warning: No user found. Score cannot be saved unless you are logged in.");
                return;
            }

            const accuracy = Math.round((correctAnswersCount / 10) * 100);

            // Loading state
            const originalText = btnSaveScore.innerText;
            btnSaveScore.innerText = "Saving...";
            btnSaveScore.disabled = true;

            try {
                // Check if user already has a score saved for Level 2
                const { data: existingData, error: fetchError } = await supabase
                    .from('lvl2_scores')
                    .select('*')
                    .eq('user_email', loggedInEmail)
                    .maybeSingle();

                if (fetchError) throw fetchError;

                if (existingData) {
                    const message = `You already have a saved score for Level 2:\n` +
                        `Previous: Points: ${existingData.points}, Treats: ${existingData.treats}, Accuracy: ${existingData.accuracy}%\n` +
                        `New: Points: ${totalScore}, Treats: ${totalTreats}, Accuracy: ${accuracy}%\n\n` +
                        `Do you want to overwrite your previous record with this new one?`;

                    if (confirm(message)) {
                        const { error: updateError } = await supabase
                            .from('lvl2_scores')
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
                    const { error: insertError } = await supabase
                        .from('lvl2_scores')
                        .insert([{
                            user_email: loggedInEmail,
                            points: totalScore,
                            treats: totalTreats,
                            accuracy: accuracy
                        }]);

                    if (insertError) throw insertError;
                    alert("Congrats! Your Level 2 results have been saved! 🏆");
                }
                console.log("Stats processed successfully for lvl2_scores!");
            } catch (err) {
                alert("Oops! There was a problem saving your score: " + (err.message || "Unknown Error"));
                console.error("Error saving stats:", err);
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

    async function fetchLevel2LeaderboardData() {
        if (!leaderboardListGame) return;
        leaderboardListGame.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem; color: white;">Loading leaderboard data...</div>';

        try {
            // Fetch users and level 2 scores
            const [usersRes, lvl2Res] = await Promise.all([
                supabase.from('users').select('email, firstname, lastname'),
                supabase.from('lvl2_scores').select('user_email, points, treats, accuracy')
            ]);

            const users = usersRes.data || [];
            const lvl2Scores = lvl2Res.data || [];

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

            lvl2Scores.forEach(row => {
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
            await fetchLevel2LeaderboardData();
        };
    }

    if (btnCloseLeaderboardGame && modalLeaderboardGame) {
        btnCloseLeaderboardGame.onclick = () => {
            modalLeaderboardGame.classList.remove('active');
            if (modalOverlay) modalOverlay.classList.remove('active-leaderboard');
        };
    }

    // Shuffle questions and their choices
    shuffleArray(questions);
    questions.forEach(q => {
        if (q.choices) shuffleArray(q.choices);
    });

    const instructionsOverlay = document.getElementById('instructions-overlay');
    const modalInstructions = document.getElementById('modal-instructions');
    const btnStartInstructions = document.getElementById('btn-start-game-instructions');

    if (instructionsOverlay && modalInstructions && btnStartInstructions) {
        btnStartInstructions.addEventListener('click', () => {
            instructionsOverlay.classList.remove('active');
            modalInstructions.classList.remove('active');
            loadQuestion(0);
            
            // Audio requires interaction, so we start it here
            if (bgMusic && bgMusic.paused) {
                bgMusic.play().catch(e => console.log("Music play blocked", e));
            }
        });
    } else {
        // Initialize first question
        loadQuestion(0);
    }
    console.log("Punctuation logic initialized.");
});
