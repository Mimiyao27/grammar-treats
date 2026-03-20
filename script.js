/* ==========================================
   Grammar Treats - Interactive Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Init ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon public key
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // --- Element References ---
    const overlay = document.getElementById('modal-overlay');
    const modalPlay = document.getElementById('modal-play');
    const modalLogin = document.getElementById('modal-login');
    const modalSignup = document.getElementById('modal-signup');

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

    // --- Prevent default on placeholder nav links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.id.includes('login') && !link.id.includes('signup')) {
            link.addEventListener('click', (e) => e.preventDefault());
        }
    });
});
