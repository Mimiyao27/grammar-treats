/* ==========================================
   Grammar Treats - Interactive Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
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

    // --- Login Form ---
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) return;

        // Show success state
        formLogin.style.display = 'none';
        modalLogin.querySelector('.modal-subtitle').style.display = 'none';
        modalLogin.querySelector('.modal-footer-text').style.display = 'none';
        loginSuccess.classList.remove('hidden');
    });

    // --- Signup Form ---
    formSignup.addEventListener('submit', (e) => {
        e.preventDefault();
        const fname = document.getElementById('signup-fname').value.trim();
        const lname = document.getElementById('signup-lname').value.trim();
        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const grade = document.getElementById('signup-grade').value;
        const role = document.getElementById('signup-role').value;
        const password = document.getElementById('signup-password').value;

        if (!fname || !lname || !username || !email || !grade || !role || !password) return;
        if (password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        // Show success state
        signupNameDisplay.textContent = fname;
        formSignup.style.display = 'none';
        modalSignup.querySelector('.modal-subtitle').style.display = 'none';
        modalSignup.querySelector('.modal-footer-text').style.display = 'none';
        modalSignup.querySelector('.terms-row')?.remove();
        signupSuccess.classList.remove('hidden');
    });

    // --- Prevent default on placeholder nav links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.id.includes('login') && !link.id.includes('signup')) {
            link.addEventListener('click', (e) => e.preventDefault());
        }
    });
});
