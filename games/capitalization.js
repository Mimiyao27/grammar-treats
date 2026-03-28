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
        explanation: "We need to capitalize \"My\" because it is the first word in the sentence and \"Sam\" because it is a proper name."
    },
    {
        sentence: ["mrs.", "garcia,", "our", "english", "teacher,", "explained", "the", "assignment", "clearly."],
        correct: ["Mrs.", "Garcia,", "our", "English", "teacher,", "explained", "the", "assignment", "clearly."],
        explanation: "We need to capitalize \"Mrs.\" because it is a title, \"Garcia\" because it is a proper name, and \"English\" because it is the name of a language."
    },
    {
        sentence: ["during", "art", "class,", "i", "painted", "a", "picture", "of", "mayon", "volcano."],
        correct: ["During", "Art", "class,", "I", "painted", "a", "picture", "of", "Mayon", "Volcano."],
        explanation: "We need to capitalize \"During\" because it is the first word in the sentence, \"Art\" because it is the name of a class, and \"Mayon Volcano\" because it is a proper name."
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
let bgMusic;
let correctSound;
let incorrectSound;
let clickSound;

document.addEventListener('DOMContentLoaded', () => {
    // Supabase Init
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Elements
    const wordGrid = document.getElementById('word-grid');
    const currentQSpan = document.getElementById('current-q');
    const totalQSpan = document.getElementById('total-q');
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
    const feedbackVisual = document.getElementById('feedback-visual');
    const feedbackScore = document.getElementById('feedback-score');
    const feedbackTreats = document.getElementById('feedback-treats');
    const feedbackCorrectSentence = document.getElementById('feedback-correct-sentence');
    const feedbackExplanation = document.getElementById('feedback-explanation');

    const resultsOverlay = document.getElementById('results-overlay');
    const finalTotalScore = document.getElementById('final-total-score');
    const finalPoints = document.getElementById('final-points');
    const finalTreats = document.getElementById('final-treats');
    const finalMotivation = document.getElementById('final-motivation');
    const pieChart = document.getElementById('pie-chart');
    const btnNextLevel = document.getElementById('btn-next-level');
    const btnSaveScore = document.getElementById('btn-save-score');

    const btnReview = document.getElementById('btn-review');
    const reviewOverlay = document.getElementById('review-overlay');
    const reviewList = document.getElementById('review-list');
    const btnCloseReview = document.getElementById('btn-close-review');
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
        currentQSpan.innerText = index + 1;
        const q = questions[index];
        userAnswers = [...q.sentence]; // Start with the lowercase version

        renderWords();
        feedbackOverlay.classList.add('hidden');
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

        totalTreats += earnedTreatsThisRound;

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
            feedbackTitle.className = "feedback-main-title title-correct";

            const rewards = [
                { text: "You got it right! Enjoy this chocolate bar!", visual: "🍫" },
                { text: "Correct! Here’s a delicious cookie for you!", visual: "🍪" },
                { text: "You did it! Enjoy this yummy donut!", visual: "🍩" },
                { text: "You earned it! Have a juicy apple!", visual: "🍎" },
                { text: "Right answer! Treat yourself to a slice of pizza!", visual: "🍕" }
            ];
            const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
            feedbackSubtitle.innerText = randomReward.text;
            feedbackVisual.innerText = randomReward.visual;
        } else {
            const incorrectTitles = [
                "Good effort! Try again",
                "You’re getting better, don’t give up!",
                "Almost there! One more try",
                "Mistakes help you learn — keep going!"
            ];
            const randomTitle = incorrectTitles[Math.floor(Math.random() * incorrectTitles.length)];
            feedbackTitle.innerText = randomTitle;
            feedbackTitle.className = "feedback-main-title title-wrong";

            const retryMessages = [
                { text: "The cupcake melted, so here’s a cupcake plush instead—snacks are waiting next round!", visual: "🧁" },
                { text: "The gummy bears escaped — better luck next time!", visual: "🍬" },
                { text: "The pizza was too hot — better luck next time for a slice!", visual: "🍕" },
                { text: "Your ice cream melted — no treat this time, but don’t give up!", visual: "🍦" },
                { text: "The watermelon got eaten — here’s the plush watermelon to cheer you on!", visual: "🍉" }
            ];
            const randomRetry = retryMessages[Math.floor(Math.random() * retryMessages.length)];
            feedbackSubtitle.innerText = randomRetry.text;
            feedbackVisual.innerText = randomRetry.visual;
        }

        feedbackScore.innerText = (earnedScore > 0 ? "+ " : "") + earnedScore;
        feedbackTreats.innerText = earnedTreats;
        feedbackCorrectSentence.innerText = fullCorrectSentence;
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
        resultsOverlay.classList.remove('hidden');

        finalTotalScore.innerText = `${questionsCorrectCount}/${questions.length}`;
        finalPoints.innerText = totalScore;
        finalTreats.innerText = `${totalTreats} 🍬`;

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
        const correctPercent = (questionsCorrectCount / questions.length) * 100;
        pieChart.style.background = `conic-gradient(#5fb871 0% ${correctPercent}%, #f87171 ${correctPercent}% 100%)`;

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
        }
    };

    btnNextLevel.onclick = () => {
        // Return to dashboard
        window.location.href = '/dashboard/';
    };

    btnReview.onclick = () => {
        reviewList.innerHTML = '';
        questionResults.forEach((res, idx) => {
            const item = document.createElement('div');
            item.className = 'review-item';
            if (!res.isCorrect) item.style.borderLeftColor = '#f87171'; // Red for incorrect

            item.innerHTML = `
            <div class="review-label">Question ${idx + 1}</div>
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

        reviewOverlay.classList.remove('hidden');
    };

    btnCloseReview.onclick = () => {
        reviewOverlay.classList.add('hidden');
    };

    btnBack.onclick = () => {
        if (confirm("Are you sure you want to quit? Your progress will not be saved.")) {
            window.location.href = '/dashboard/';
        }
    };

    // --- Start ---
    function initGame() {
        initAudio();
        if (totalQSpan) totalQSpan.innerText = questions.length;
        loadQuestion(0);
    }
    initGame();
});
