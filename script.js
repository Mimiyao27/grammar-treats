/* ==========================================
   Grammar Treats - Interactive Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Init ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon public key
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- Global UI Logic ---
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('active');
            hamburgerBtn.classList.toggle('is-active', isActive);
        });

        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                hamburgerBtn.classList.remove('is-active');
            });
        });
    }

    // --- Dashboard Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // If we are on the dashboard
        const loggedInEmail = localStorage.getItem('loggedInEmail');
        if (!loggedInEmail) {
            window.location.href = 'index.html';
        } else {
            supabase.from('users')
                .select('*')
                .eq('email', loggedInEmail)
                .single()
                .then(({ data: user, error }) => {
                    if (error || !user) {
                        console.error('Session user not found', error);
                        localStorage.removeItem('loggedInEmail');
                        window.location.href = 'index.html';
                        return;
                    }

                    const elFname = document.getElementById('dash-firstname');
                    const elLname = document.getElementById('dash-lastname');
                    const elUsername = document.getElementById('dash-username');
                    const elEmail = document.getElementById('dash-email');

                    if (elFname) elFname.textContent = user.firstname;
                    if (elLname) elLname.textContent = user.lastname;
                    if (elUsername) elUsername.textContent = user.username;
                    if (elEmail) elEmail.textContent = user.email;
                });
        }

        const overlay = document.getElementById('modal-overlay');
        const modalLogout = document.getElementById('modal-logout');
        const btnNo = document.getElementById('btn-logout-no');
        const btnYes = document.getElementById('btn-logout-yes');

        function openLogoutModal() {
            if (overlay && modalLogout) {
                overlay.classList.add('active');
                modalLogout.classList.add('active');
                document.body.style.overflow = 'hidden';
            } else {
                if (confirm('Are you sure you want to log out? yes or no')) {
                    executeLogout();
                }
            }
        }

        function closeLogoutModal() {
            if (overlay && modalLogout) {
                overlay.classList.remove('active');
                modalLogout.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        function executeLogout() {
            localStorage.removeItem('loggedInEmail');
            window.location.href = 'index.html';
        }

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openLogoutModal();
        });

        // Wire the hero settings button to open settings popover instead of logout
        const dashSettingsBtn = document.getElementById('dash-settings-btn');
        const settingsPopover = document.getElementById('settings-popover');
        if (dashSettingsBtn && settingsPopover) {
            dashSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                settingsPopover.classList.toggle('active');
            });

            // Close popover when clicking outside
            document.addEventListener('click', (e) => {
                if (!settingsPopover.contains(e.target) && !dashSettingsBtn.contains(e.target)) {
                    settingsPopover.classList.remove('active');
                }
            });

            // Prevent clicks inside popover from closing it
            settingsPopover.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        if (btnNo) btnNo.addEventListener('click', closeLogoutModal);
        if (btnYes) btnYes.addEventListener('click', executeLogout);

        // Close modal on overlay click
        if (overlay) {
            overlay.addEventListener('click', closeLogoutModal);
        }

        // --- Grammar Quiz Logic ---
        const dashBtnStart = document.getElementById('dash-btn-start');
        const modalGame = document.getElementById('modal-game');
        const modalResults = document.getElementById('modal-results');
        const gameQNum = document.getElementById('game-q-num');
        const gameTimerText = document.getElementById('game-timer-text');
        const gameQuestionText = document.getElementById('game-question-text');
        const gameOptions = document.getElementById('game-options');
        const resultsScoreValue = document.getElementById('results-score-value');
        const resultsList = document.getElementById('results-list');
        const btnBackDashboard = document.getElementById('btn-back-dashboard');
        const closeGameBtn = document.getElementById('close-game');

        const quizData = [
            {
                question: "Which sentence is grammatically correct?",
                options: ["He don't like apples.", "He doesn't likes apples.", "He doesn't like apples.", "He do not likes apples."],
                correct: 2,
                explanation: "When using 'doesn't' (does not) for third-person singular, it is followed by the base form of the verb ('like')."
            },
            {
                question: "Identify the correct plural form:",
                options: ["Childs", "Childrens", "Children", "Childes"],
                correct: 2,
                explanation: "'Children' is the irregular plural form of 'child'."
            },
            {
                question: "Choose the correct word: 'I have ___ friends than you.'",
                options: ["less", "fewer", "lesser", "few"],
                correct: 1,
                explanation: "Use 'fewer' with countable nouns (like 'friends'). Use 'less' with uncountable nouns (like 'water')."
            },
            {
                question: "Which of the following sentences uses the passive voice?",
                options: ["The dog chased the ball.", "The ball was chased by the dog.", "The dog is chasing the ball.", "The dog has chased the ball."],
                correct: 1,
                explanation: "In the passive voice, the subject ('the ball') receives the action ('was chased') performed by the object ('by the dog')."
            },
            {
                question: "Select the correctly punctuated sentence:",
                options: ["Let's eat Grandma!", "Lets eat, Grandma!", "Let's eat, Grandma!", "Lets, eat Grandma!"],
                correct: 2,
                explanation: "A comma is required before the name of the person being addressed directly ('Grandma') to avoid confusion. 'Let's' is a contraction for 'Let us'."
            }
        ];

        let currentQuestion = 0;
        let score = 0;
        let timerInterval;
        let timeLeft = 10;
        let userAnswers = []; // Store user's selected index, or -1 for timeout

        function openGameModal() {
            if (overlay && modalGame) {
                overlay.classList.add('active');
                modalGame.classList.add('active');
                document.body.style.overflow = 'hidden';
                startGame();
            }
        }

        function closeGameModals() {
            clearInterval(timerInterval);
            if (overlay) overlay.classList.remove('active');
            if (modalGame) modalGame.classList.remove('active');
            if (modalResults) modalResults.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (dashBtnStart) {
            dashBtnStart.addEventListener('click', (e) => {
                e.preventDefault();
                openGameModal();
            });
        }

        if (btnBackDashboard) {
            btnBackDashboard.addEventListener('click', (e) => {
                e.preventDefault();
                closeGameModals();
            });
        }

        if (closeGameBtn) {
            closeGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to exit?')) {
                    closeGameModals();
                }
            });
        }

        function startGame() {
            currentQuestion = 0;
            score = 0;
            userAnswers = [];
            renderQuestion();
        }

        function renderQuestion() {
            if (currentQuestion >= quizData.length) {
                showResults();
                return;
            }

            const q = quizData[currentQuestion];
            gameQNum.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
            gameQuestionText.textContent = q.question;
            gameOptions.innerHTML = '';
            
            q.options.forEach((opt, index) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.textContent = opt;
                btn.onclick = () => selectOption(index, btn);
                gameOptions.appendChild(btn);
            });

            startTimer();
        }

        function startTimer() {
            clearInterval(timerInterval);
            timeLeft = 10;
            gameTimerText.textContent = timeLeft + 's';
            gameTimerText.classList.remove('danger');

            timerInterval = setInterval(() => {
                timeLeft -= 1;
                gameTimerText.textContent = Math.max(timeLeft, 0) + 's';

                if (timeLeft <= 3 && !gameTimerText.classList.contains('danger')) {
                    gameTimerText.classList.add('danger');
                }

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeOut();
                }
            }, 1000);
        }

        function handleTimeOut() {
            const options = gameOptions.querySelectorAll('.quiz-option');
            options.forEach(opt => opt.disabled = true);
            userAnswers.push(-1); // -1 marks timeout

            // Highlight the correct answer anyway
            const correctIndex = quizData[currentQuestion].correct;
            options[correctIndex].classList.add('correct');

            setTimeout(() => {
                currentQuestion++;
                renderQuestion();
            }, 1500);
        }

        function selectOption(selectedIndex, btnElement) {
            clearInterval(timerInterval);
            const q = quizData[currentQuestion];
            const options = gameOptions.querySelectorAll('.quiz-option');
            
            options.forEach(opt => opt.disabled = true);
            userAnswers.push(selectedIndex);

            if (selectedIndex === q.correct) {
                btnElement.classList.add('correct');
                score++;
            } else {
                btnElement.classList.add('wrong');
                options[q.correct].classList.add('correct'); // Show correct answer
            }

            setTimeout(() => {
                currentQuestion++;
                renderQuestion();
            }, 1500);
        }

        function showResults() {
            if (modalGame) modalGame.classList.remove('active');
            if (modalResults) modalResults.classList.add('active');
            
            resultsScoreValue.textContent = score;
            resultsList.innerHTML = '';

            quizData.forEach((q, index) => {
                const userChoice = userAnswers[index];
                const isCorrect = userChoice === q.correct;
                const isTimeout = userChoice === -1;

                let answerStatusHtml = '';
                if (isCorrect) {
                    answerStatusHtml = `<div class="result-a correct">✅ Correct: ${q.options[q.correct]}</div>`;
                } else if (isTimeout) {
                    answerStatusHtml = `
                        <div class="result-a wrong">⏱️ Time out!</div>
                        <div class="result-a correct">✅ Correct Answer: ${q.options[q.correct]}</div>
                    `;
                } else {
                    answerStatusHtml = `
                        <div class="result-a wrong">❌ You answered: ${q.options[userChoice]}</div>
                        <div class="result-a correct">✅ Correct Answer: ${q.options[q.correct]}</div>
                    `;
                }

                resultsList.innerHTML += `
                    <div class="result-item">
                        <div class="result-q">${index + 1}. ${q.question}</div>
                        ${answerStatusHtml}
                        <div class="result-exp">💡 ${q.explanation}</div>
                    </div>
                `;
            });
        }

        // Exit early so the rest of the script (which expects index.html elements) doesn't crash!
        return;
    }

    // --- Index Protection ---
    // If a user is already logged in, redirect them directly to the dashboard
    if (localStorage.getItem('loggedInEmail')) {
        window.location.href = 'dashboard.html';
        return;
    }

    // --- Element References ---
    const overlay = document.getElementById('modal-overlay');
    const modalPlay = document.getElementById('modal-play');
    const modalLogin = document.getElementById('modal-login');
    const modalSignup = document.getElementById('modal-signup');
    const modalForgotPw = document.getElementById('modal-forgot-pw');

    // Buttons
    const btnStartGame = document.getElementById('btn-start-game');
    const btnNotYet = document.getElementById('btn-not-yet');
    const btnLetsGo = document.getElementById('btn-lets-go');
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');
    const closePlay = document.getElementById('close-play');
    const closeLogin = document.getElementById('close-login');
    const closeSignup = document.getElementById('close-signup');
    const closeForgotPw = document.getElementById('close-forgot-pw');
    const loginToSignup = document.getElementById('login-to-signup');
    const signupToLogin = document.getElementById('signup-to-login');
    const openForgotPw = document.getElementById('open-forgot-pw');
    const forgotToLogin = document.getElementById('forgot-to-login');

    // Forms
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');
    const formForgotPw = document.getElementById('form-forgot-pw');
    const formResetPw = document.getElementById('form-reset-pw');
    const modalResetPw = document.getElementById('modal-reset-pw');

    // Password toggles
    const toggleLoginPw = document.getElementById('toggle-login-pw');
    const toggleSignupPw = document.getElementById('toggle-signup-pw');
    const toggleSignupConfirmPw = document.getElementById('toggle-signup-confirm-pw');
    const toggleResetPw = document.getElementById('toggle-reset-pw');

    // Success states
    const loginSuccess = document.getElementById('login-success');
    const signupSuccess = document.getElementById('signup-success');
    const signupNameDisplay = document.getElementById('signup-name-display');

    // --- Modal Functions ---
    function openModal(modal) {
        overlay.classList.add('active');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeAllModals() {
        if (overlay) overlay.classList.remove('active');
        [modalPlay, modalLogin, modalSignup, modalForgotPw, modalResetPw].forEach(m => {
            if (m) m.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    function switchModal(from, to) {
        from.classList.remove('active');
        setTimeout(() => to.classList.add('active'), 150);
    }

    // --- Event Listeners ---

    // Start Game button -> Login modal
    btnStartGame.addEventListener('click', () => openModal(modalLogin));

    // Nav login -> Login modal
    navLogin.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalLogin);
    });

    // Nav signup -> Signup modal
    navSignup.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modalSignup);
    });

    // Close buttons
    if (closePlay) closePlay.addEventListener('click', closeAllModals);
    if (closeLogin) closeLogin.addEventListener('click', closeAllModals);
    if (closeSignup) closeSignup.addEventListener('click', closeAllModals);
    if (closeForgotPw) closeForgotPw.addEventListener('click', closeAllModals);

    // "Not yet" button closes play modal
    if (btnNotYet) btnNotYet.addEventListener('click', closeAllModals);

    // "Let's Go" button - show signup
    if (btnLetsGo) {
        btnLetsGo.addEventListener('click', () => {
            switchModal(modalPlay, modalSignup);
        });
    }

    // Switch between login and signup
    if (loginToSignup) {
        loginToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalLogin, modalSignup);
        });
    }

    if (signupToLogin) {
        signupToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalSignup, modalLogin);
        });
    }
    
    // Switch for forgot password
    if (openForgotPw) {
        openForgotPw.addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalLogin, modalForgotPw);
        });
    }
    
    if (forgotToLogin) {
        forgotToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchModal(modalForgotPw, modalLogin);
        });
    }

    // Overlay click closes all modals
    overlay.addEventListener('click', closeAllModals);

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // --- Password Toggle ---
    function setupPasswordToggle(toggleBtn, inputId) {
        const input = document.getElementById(inputId);
        toggleBtn.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            toggleBtn.querySelector('svg').style.opacity = isPassword ? '1' : '0.5';
        });
    }

    setupPasswordToggle(toggleLoginPw, 'login-password');
    setupPasswordToggle(toggleSignupPw, 'signup-password');
    setupPasswordToggle(toggleSignupConfirmPw, 'signup-confirm-password');
    if (toggleResetPw) setupPasswordToggle(toggleResetPw, 'reset-pw-new');

    // --- Login Form ---
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!email || !password) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        const submitBtn = formLogin.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (error) {
            alert('Login failed: ' + error.message);
            return;
        }

        // Save only the email locally, then fetch from Supabase on dashboard
        localStorage.setItem('loggedInEmail', email);

        // Success - redirect to dashboard
        window.location.href = 'dashboard.html';
    });

    // --- Signup Form ---
    formSignup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fname = document.getElementById('signup-fname').value.trim();
        const lname = document.getElementById('signup-lname').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (!fname || !lname || !username || !email || !password || !confirmPassword) return;

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        const submitBtn = formSignup.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        // 1. Create user in Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    firstname: fname,
                    lastname: lname,
                    username: username
                }
            }
        });

        if (signUpError) {
            alert('Error creating account: ' + signUpError.message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // 2. Insert all user data into the "users" table without storing passwords
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                firstname: fname,
                lastname: lname,
                username: username,
                email: email
            }]);

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (insertError) {
            // Note: In production you might want to handle this gracefully
            console.error('Error adding user to public table: ', insertError.message);
        }

        // Success: Alert the user, reset the form for the next person, and go to Login
        alert('Registration successful! Please log in.');
        formSignup.reset();
        switchModal(modalSignup, modalLogin);
    });

    // --- Auth State Change Listener (for password recovery) ---
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event == 'PASSWORD_RECOVERY') {
            closeAllModals();
            if (overlay && modalResetPw) {
                overlay.classList.add('active');
                modalResetPw.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    });

    if (formResetPw) {
        formResetPw.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('reset-pw-new').value;
            if (!newPassword || newPassword.length < 8) return;

            const submitBtn = formResetPw.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            if (error) {
                alert('Error updating password: ' + error.message);
                return;
            }

            alert('Password successfully updated! You can now log in.');
            formResetPw.reset();
            switchModal(modalResetPw, modalLogin);
        });
    }

    // --- Forgot Password Form ---
    if (formForgotPw) {
        formForgotPw.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-pw-email').value.trim();

            if (!email) return;

            const submitBtn = formForgotPw.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            if (error) {
                alert('Error sending reset link: ' + error.message);
                return;
            }

            alert('Password reset link sent! Please check your email inbox (and spam folder).');
            formForgotPw.reset();
            switchModal(modalForgotPw, modalLogin);
        });
    }

    // --- Preset Nav Links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.id.includes('login') && !link.id.includes('signup')) {
            link.addEventListener('click', (e) => e.preventDefault());
        }
    });

});
