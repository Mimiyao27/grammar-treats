/* ==========================================
   Grammar Treats - Interactive Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Init ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon public key
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('main-nav');

    // --- Global Mode Logic ---
    const savedMode = localStorage.getItem('settings-mode') || 'light';
    if (savedMode === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

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
            window.location.href = '/';
        } else {
            supabase.from('users')
                .select('*')
                .eq('email', loggedInEmail)
                .single()
                .then(({ data: user, error }) => {
                    if (error || !user) {
                        console.error('Session user not found', error);
                        localStorage.removeItem('loggedInEmail');
                        window.location.href = '/';
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
            localStorage.setItem('settings-mode', 'light');
            document.body.classList.remove('dark-mode');
            window.location.href = '/';
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

            // --- Functional Settings Logic ---
            const soundSlider = document.getElementById('settings-sound');
            const bgmSlider = document.getElementById('settings-bgm');
            const modeSwitch = document.getElementById('settings-mode-switch');
            const levelSettingsBtn = document.getElementById('btn-level-settings');

            // Load and apply settings
            const savedSound = localStorage.getItem('settings-sound') || 50;
            const savedBgm = localStorage.getItem('settings-bgm') || 50;

            // Dashboard BGM
            window.dbMusic = new Audio('/assets/audio/dbbgm.mp3');
            window.dbMusic.loop = true;
            window.dbMusic.volume = savedBgm / 100;

            // Start playing on first interaction (click, mousemove, etc.)
            const startDashboardMusic = () => {
                if (window.dbMusic && window.dbMusic.paused) {
                    window.dbMusic.play().catch(e => console.log("Dashboard music blocked", e));
                }
                ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
                    document.removeEventListener(evt, startDashboardMusic);
                });
            };

            ['click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
                document.addEventListener(evt, startDashboardMusic, { once: true });
            });

            if (soundSlider) soundSlider.value = savedSound;
            if (bgmSlider) bgmSlider.value = savedBgm;
            if (modeSwitch) {
                modeSwitch.checked = savedMode === 'dark';
            }

            // Event Listeners
            if (soundSlider) {
                soundSlider.addEventListener('input', (e) => {
                    localStorage.setItem('settings-sound', e.target.value);
                    console.log(`Sound Volume: ${e.target.value}%`);
                });
            }

            if (bgmSlider) {
                bgmSlider.addEventListener('input', (e) => {
                    localStorage.setItem('settings-bgm', e.target.value);
                    console.log(`BGM Volume: ${e.target.value}%`);
                    if (window.dbMusic) window.dbMusic.volume = e.target.value / 100;
                });
            }

            if (modeSwitch) {
                modeSwitch.addEventListener('change', (e) => {
                    const mode = e.target.checked ? 'dark' : 'light';
                    localStorage.setItem('settings-mode', mode);
                    document.body.classList.toggle('dark-mode', e.target.checked);
                });
            }

            if (levelSettingsBtn) {
                levelSettingsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    settingsPopover.classList.toggle('active');
                });
            }
        }

        if (btnNo) btnNo.addEventListener('click', closeLogoutModal);
        if (btnYes) btnYes.addEventListener('click', executeLogout);

        // Close modal on overlay click
        if (overlay) {
            overlay.addEventListener('click', closeLogoutModal);
        }

        // Exit early so the rest of the script (which expects index.html elements) doesn't crash!
        return;
    }

    // --- Index Protection ---
    // If a user is already logged in, redirect them directly to the dashboard
    if (localStorage.getItem('loggedInEmail')) {
        window.location.href = '/dashboard/';
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
            if (error.message === 'Invalid login credentials') {
                alert('Oops! Incorrect email or password. Please try again.');
            } else {
                alert('Login failed: ' + error.message);
            }
            return;
        }

        // Save only the email locally, then fetch from Supabase on dashboard
        localStorage.setItem('loggedInEmail', email);

        // Success - redirect to dashboard
        window.location.href = '/dashboard/';
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

        // Success: If email confirmation is disabled in Supabase, data.session will exist
        if (data.session) {
            localStorage.setItem('loggedInEmail', email);
            alert('Registration successful! Welcome to Grammar Treats.');
            window.location.href = '/dashboard/';
        } else {
            // This fallback handles cases where email confirmation is still enabled
            alert('Registration successful! Please log in.');
            formSignup.reset();
            switchModal(modalSignup, modalLogin);
        }
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
