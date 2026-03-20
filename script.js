/* ==========================================
   Grammar Treats - Interactive Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Init ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon public key
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

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

        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInEmail');
            window.location.href = 'index.html';
        });

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

    // Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mainNav = document.getElementById('main-nav');
    
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
        
        mainNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }

    // Buttons
    const btnStartGame = document.getElementById('btn-start-game');
    const btnNotYet = document.getElementById('btn-not-yet');
    const btnLetsGo = document.getElementById('btn-lets-go');
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');
    const closePlay = document.getElementById('close-play');
    const closeLogin = document.getElementById('close-login');
    const closeSignup = document.getElementById('close-signup');
    const loginToSignup = document.getElementById('login-to-signup');
    const signupToLogin = document.getElementById('signup-to-login');

    // Forms
    const formLogin = document.getElementById('form-login');
    const formSignup = document.getElementById('form-signup');

    // Password toggles
    const toggleLoginPw = document.getElementById('toggle-login-pw');
    const toggleSignupPw = document.getElementById('toggle-signup-pw');
    const toggleSignupConfirmPw = document.getElementById('toggle-signup-confirm-pw');

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
        overlay.classList.remove('active');
        [modalPlay, modalLogin, modalSignup].forEach(m => m.classList.remove('active'));
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
    closePlay.addEventListener('click', closeAllModals);
    closeLogin.addEventListener('click', closeAllModals);
    closeSignup.addEventListener('click', closeAllModals);

    // "Not yet" button closes play modal
    btnNotYet.addEventListener('click', closeAllModals);

    // "Let's Go" button - show signup
    btnLetsGo.addEventListener('click', () => {
        switchModal(modalPlay, modalSignup);
    });

    // Switch between login and signup
    loginToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchModal(modalLogin, modalSignup);
    });

    signupToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchModal(modalSignup, modalLogin);
    });

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

        const { data: userArray, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (error) {
            alert('Error checking credentials: ' + error.message);
            return;
        }

        if (!userArray || userArray.length === 0) {
            alert('email not exist');
            return;
        }

        const user = userArray[0];

        if (user.password !== password) {
            alert('Incorrect password');
            return;
        }

        // Save only the email locally, then fetch from Supabase on dashboard
        localStorage.setItem('loggedInEmail', user.email);

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

        // 1. Validate if email already exists in the "users" table
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (checkError) {
            alert('Error checking email: ' + checkError.message);
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        if (existingUsers && existingUsers.length > 0) {
            alert('This email is already registered. Try another email.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // 2. Insert all user data into the "users" table
        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                firstname: fname,
                lastname: lname,
                username: username,
                email: email,
                password: password
            }]);

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        if (insertError) {
            alert('Error creating account: ' + insertError.message);
            return;
        }

        // Success: Alert the user, reset the form for the next person, and go to Login
        alert('Registration successful! Please log in.');
        formSignup.reset();
        switchModal(modalSignup, modalLogin);
    });

    // --- Preset Nav Links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.id.includes('login') && !link.id.includes('signup')) {
            link.addEventListener('click', (e) => e.preventDefault());
        }
    });

});
