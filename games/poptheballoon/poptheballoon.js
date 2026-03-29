document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const balloons = document.querySelectorAll('.balloon');
    const timerDisplay = document.querySelector('.timer-display');
    const sentenceBox = document.querySelector('.sentence-box');
    const questionTracker = document.querySelector('.question-tracker');
    const btnBack = document.getElementById('btn-back');
    
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

        popSound = new Audio('../../assets/audio/click.wav');
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
            html: 'She went to the market <span class="blank">___</span> bought some fruits.',
            correct: ',',
            choices: ['.', '?', ',', '!', ':'],
            completedSentence: 'She went to the market, bought some fruits.',
            explanation: 'A comma is used to join two actions, but this sentence has nothing between "market" and "bought", so we need a comma.'
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
            explanation: 'A semicolon is used to connect two complete sentences related to each other, so we need a semicolon between the clauses.'
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
            html: 'He said <span class="blank">___</span> I will help you with your homework.',
            correct: ':',
            choices: ['.', '?', ',', '!', ':'],
            completedSentence: 'He said: I will help you with your homework.',
            explanation: 'A colon introduces a statement or a quote, but this sentence uses nothing, so we need a colon before "I will help you."'
        },
        {
            html: 'I can’t believe it <span class="blank">___</span> she actually won the race.',
            correct: '!',
            choices: ['.', '?', ',', '!', ';'],
            completedSentence: 'I can’t believe it! She actually won the race.',
            explanation: 'An exclamation mark shows strong feeling, but this sentence only has a comma, so we need an exclamation mark after "I can’t believe it."'
        },
        {
            html: 'After school <span class="blank">___</span> we went to the park <span class="blank">___</span> played soccer for two hours.',
            correct: ', ,',
            choices: ['. .', ', ,', '? ?', '! !', '; ;'],
            completedSentence: 'After school, we went to the park, played soccer for two hours.',
            explanation: 'Commas separate actions, but this sentence runs together without them, so we need commas after "After school" and "park."'
        },
        {
            html: 'Did you see that shooting star <span class="blank">___</span> it was amazing!',
            correct: '?',
            choices: ['.', '?', ',', '!', ':'],
            completedSentence: 'Did you see that shooting star? It was amazing!',
            explanation: 'A question mark is used for asking questions, but this sentence is missing it after "Did you see that shooting star", so we need a question mark there.'
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
        if(timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
        
        timerInterval = setInterval(() => {
            timeLeft--;
            if(timeLeft <= 0) {
                clearInterval(timerInterval);
                timeLeft = 0;
                // Automatically show incorrect feedback
                showFeedback(false, "Timeout");
            }
            if(timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
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
        if(!resultsOverlay) return;
        
        // Populate stats dynamically
        document.getElementById('final-correct').textContent = `${correctAnswersCount}/10`;
        document.getElementById('final-points').textContent = totalScore;
        document.getElementById('final-treats').textContent = totalTreats;
        
        // Render dynamic pie chart based on correct percentage
        const correctPercent = Math.round((correctAnswersCount / 10) * 100);
        const pieChart = document.getElementById('results-pie-chart');
        if (pieChart) {
            pieChart.style.background = `conic-gradient(#4CAF50 0% ${correctPercent}%, #eb1e1e ${correctPercent}% 100%)`;
        }
        
        // Fetch player name securely
        let playerName = 'Player';
        try {
            playerName = localStorage.getItem('username') || localStorage.getItem('fullName') || 'Player';
        } catch(e) {}
        
        const nameSpan = document.getElementById('player-name');
        if (nameSpan) nameSpan.textContent = playerName;
        
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
    }

    // Show feedback popup
    function showFeedback(isCorrect, clickedPunctuation) {
        if(!feedbackOverlay) return;
        
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

             feedbackTitle.textContent = "Perfect!";
             feedbackTitle.classList.remove('title-wrong');
             feedbackSubtitle.textContent = "You've won a slice of cake!";
             feedbackImage.textContent = "🍰"; 
             feedbackScore.textContent = `Score: +100`;
             if(feedbackTreats) feedbackTreats.textContent = `Treats: 2`;
             
             if(feedbackSentence) feedbackSentence.textContent = q.completedSentence;
             if(feedbackExplanation) feedbackExplanation.textContent = q.explanation;
 
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
 
             feedbackTitle.textContent = "Not quite!";
             feedbackTitle.classList.add('title-wrong');
             feedbackSubtitle.textContent = "You've run out of cake.";
             feedbackImage.textContent = "🍽️"; // Empty plate
             feedbackScore.textContent = `Score: 0`;
             if(feedbackTreats) feedbackTreats.textContent = `Treats: 1`;
             
             if(feedbackSentence) feedbackSentence.textContent = q.completedSentence;
             
             if(feedbackExplanation) {
                 if (clickedPunctuation === "Timeout") {
                     feedbackExplanation.textContent = `Time is up! You did not select an answer in time. The correct answer was "${q.correct}".`;
                 } else {
                     feedbackExplanation.textContent = q.explanation;
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
        btnNextRound.addEventListener('click', () => {
            localStorage.setItem('showLevelScreen', 'true');
            window.location.href = '/dashboard/';
        });
    }

    // Initialize first question
    loadQuestion(0);
    console.log("Pop the Balloon logic initialized.");
});
