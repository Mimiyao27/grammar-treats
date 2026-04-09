// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

/* ==========================================
   Grammar Treats - Interactive Logic
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- Supabase Init ---
    // IMPORTANT: Replace with your actual Supabase project URL and anon public key
    const supabaseUrl = 'https://eqylmnprsvewdxdsmfbl.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeWxtbnByc3Zld2R4ZHNtZmJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTYxMDIsImV4cCI6MjA4ODk5MjEwMn0.SROuvHM08UcxJIhIO-UZMve7ShXoWhcUFoohSl_6MB4';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const capitalizeName = (name) => {
        if (!name) return "";
        return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

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

                    if (elFname) elFname.textContent = capitalizeName(user.firstname);
                    if (elLname) elLname.textContent = capitalizeName(user.lastname);
                    if (elUsername) elUsername.textContent = user.username;
                    if (elEmail) elEmail.textContent = user.email;
                    
                    // Store capitalized firstname for game results
                    localStorage.setItem('firstname', capitalizeName(user.firstname));

                    // --- Restore Progression ---
                    (async () => {
                        try {
                            const tables = ['lvl1_scores', 'lvl2_scores', 'lvl3_scores', 'lvl4_scores', 'lvl5_scores'];
                            const scorePromises = tables.map(tbl => 
                                supabase.from(tbl).select('treats').eq('user_email', loggedInEmail)
                            );
                            
                            const results = await Promise.all(scorePromises);
                            let totalTreats = 0;
                            results.forEach(res => {
                                if (res.data) {
                                    res.data.forEach(row => totalTreats += (row.treats || 0));
                                }
                            });

                            let unlockedLevel = 1;
                            if (totalTreats >= 230) unlockedLevel = 6; // All levels finished
                            else if (totalTreats >= 186) unlockedLevel = 5; 
                            else if (totalTreats >= 111) unlockedLevel = 4;
                            else if (totalTreats >= 36) unlockedLevel = 3;
                            else if (totalTreats >= 21) unlockedLevel = 2;
                            else unlockedLevel = 1;

                            localStorage.setItem('unlockedLevel', unlockedLevel);
                            
                            // Re-trigger level UI update in gamescript.js
                            document.dispatchEvent(new CustomEvent('progressRestored', { detail: { unlockedLevel } }));
                            
                            console.log(`Restored progression: ${totalTreats} treats, Level ${unlockedLevel} unlocked.`);

                        } catch (err) {
                            console.error("Error restoring progression:", err);
                        }
                    })();

                    // --- Certificate Popup Logic ---
                    const showCert = localStorage.getItem('showCertificatePopup');
                    if (showCert === 'true') {
                        (async () => {
                            try {
                                const tables = ['lvl1_scores', 'lvl2_scores', 'lvl3_scores', 'lvl4_scores', 'lvl5_scores'];
                                const scorePromises = tables.map(tbl => 
                                    supabase.from(tbl).select('points, accuracy').eq('user_email', loggedInEmail)
                                );
                                
                                const results = await Promise.all(scorePromises);
                                let bestAccuracies = [];

                                results.forEach(res => {
                                    if (res.data && res.data.length > 0) {
                                        // Find best performance (max points) in this level
                                        let bestRef = res.data.reduce((prev, current) => 
                                            (prev.points > current.points) ? prev : current
                                        );
                                        if (bestRef.accuracy != null) {
                                            bestAccuracies.push(bestRef.accuracy);
                                        }
                                    }
                                });

                                let avgAccu = 0;
                                if (bestAccuracies.length > 0) {
                                    avgAccu = Math.round(bestAccuracies.reduce((a, b) => a + b, 0) / bestAccuracies.length);
                                }

                                // Update UI
                                const elFullName = document.getElementById('cert-full-name');
                                const elAvgAccu = document.getElementById('cert-avgaccu');
                                const elDay = document.getElementById('cert-day');
                                const elMonthYear = document.getElementById('cert-month-year');

                                if (elFullName) elFullName.textContent = `${capitalizeName(user.firstname)} ${capitalizeName(user.lastname)}`;
                                if (elAvgAccu) elAvgAccu.textContent = avgAccu;

                                // Format Date
                                const now = new Date();
                                const day = now.getDate();
                                const monthNames = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"];
                                const month = monthNames[now.getMonth()];
                                const year = now.getFullYear();

                                // Day suffix
                                const getDaySuffix = (d) => {
                                    if (d > 3 && d < 21) return 'th';
                                    switch (d % 10) {
                                        case 1:  return "st";
                                        case 2:  return "nd";
                                        case 3:  return "rd";
                                        default: return "th";
                                    }
                                };

                                if (elDay) elDay.textContent = `${day}${getDaySuffix(day)}`;
                                if (elMonthYear) elMonthYear.textContent = `${month}, ${year}`;

                                const modalCert = document.getElementById('modal-certificate');
                                const overlay = document.getElementById('modal-overlay');
                                if (modalCert && overlay) {
                                    overlay.classList.add('active');
                                    modalCert.classList.add('active');
                                    document.body.style.overflow = 'hidden';

                                    // Clear the flag
                                    localStorage.removeItem('showCertificatePopup');

                                    // Confetti!
                                    if (typeof confetti === 'function') {
                                        setTimeout(() => {
                                            confetti({
                                                particleCount: 200,
                                                spread: 100,
                                                origin: { y: 0.6 }
                                            });
                                        }, 500);
                                    }
                                }
                            } catch (err) {
                                console.error("Error generating certificate data:", err);
                            }
                        })();
                    }
                });
        }

        const overlay = document.getElementById('modal-overlay');
        const modalLogout = document.getElementById('modal-logout');
        const btnNo = document.getElementById('btn-logout-no');
        const btnYes = document.getElementById('btn-logout-yes');
        const modalGoals = document.getElementById('modal-goals');
        const navServices = document.getElementById('nav-services');
        const closeGoals = document.getElementById('close-goals');

        const modalAbout = document.getElementById('modal-about');
        const navAbout = document.getElementById('nav-about');
        const closeAbout = document.getElementById('close-about');

        const modalHowtoplay = document.getElementById('modal-howtoplay');
        const btnHowtoplay = document.getElementById('dash-btn-howtoplay');
        const closeHowtoplay = document.getElementById('close-howtoplay');

        // --- Certificate Modal Controls ---
        const modalCert = document.getElementById('modal-certificate');
        const btnCloseCert = document.getElementById('btn-close-certificate');
        const btnPrintCert = document.getElementById('btn-print-certificate');

        if (btnCloseCert && modalCert && overlay) {
            btnCloseCert.addEventListener('click', () => {
                modalCert.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (btnPrintCert) {
            btnPrintCert.addEventListener('click', async () => {
                const captureArea = document.getElementById('cert-capture-area');
                if (captureArea) {
                    const originalText = btnPrintCert.textContent;
                    btnPrintCert.textContent = "Generating...";
                    btnPrintCert.disabled = true;

                    try {
                        const canvas = await html2canvas(captureArea, {
                            scale: 2, // Higher quality
                            useCORS: true,
                            backgroundColor: null
                        });
                        
                        const link = document.createElement('a');
                        link.href = canvas.toDataURL('image/png');
                        link.download = 'My_Grammar_Treats_Achievement.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        // --- Mark Level 5 as Completed on Certificate Get ---
                        localStorage.setItem('unlockedLevel', 6);
                        document.dispatchEvent(new CustomEvent('progressRestored', { detail: { unlockedLevel: 6 } }));
                        
                    } catch (err) {
                        console.error("Error generating certificate image:", err);
                        alert("Oops! Could not generate the certificate image. Please try again.");
                    } finally {
                        btnPrintCert.textContent = originalText;
                        btnPrintCert.disabled = false;
                    }
                }
            });
        }

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
            ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
            sessionStorage.clear();
            window.location.href = '/';
        }

        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openLogoutModal();
        });

        if (navServices && modalGoals && overlay) {
            navServices.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.classList.add('active');
                modalGoals.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeGoals && modalGoals && overlay) {
            closeGoals.addEventListener('click', () => {
                modalGoals.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (navAbout && modalAbout && overlay) {
            navAbout.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.classList.add('active');
                modalAbout.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeAbout && modalAbout && overlay) {
            closeAbout.addEventListener('click', () => {
                modalAbout.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        if (btnHowtoplay && modalHowtoplay && overlay) {
            btnHowtoplay.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.classList.add('active');
                modalHowtoplay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeHowtoplay && modalHowtoplay && overlay) {
            closeHowtoplay.addEventListener('click', () => {
                modalHowtoplay.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // --- Profile Modal Logic ---
        const navProfile = document.getElementById('nav-profile');
        const modalProfile = document.getElementById('modal-profile');
        const closeProfile = document.getElementById('close-profile');
        const formProfile = document.getElementById('form-profile');
        const inputFirstname = document.getElementById('profile-firstname');
        const inputLastname = document.getElementById('profile-lastname');
        const inputUsername = document.getElementById('profile-username');
        const errFirstname = document.getElementById('err-firstname');
        const errLastname = document.getElementById('err-lastname');
        const errUsername = document.getElementById('err-username');
        const usernameCheckIcon = document.getElementById('username-check-icon');
        const btnProfileSave = document.getElementById('btn-profile-save');
        const profileSuccessMsg = document.getElementById('profile-success-msg');

        // Keep a reference to the currently logged-in user object
        let currentUserData = null;

        // Re-fetch user when modal opens so data is always fresh
        function openProfileModal() {
            if (!overlay || !modalProfile) return;
            // Hide success msg if re-open
            if (profileSuccessMsg) profileSuccessMsg.style.display = 'none';
            clearProfileErrors();

            const loggedEmail = localStorage.getItem('loggedInEmail');
            if (!loggedEmail) return;

            supabase.from('users').select('*').eq('email', loggedEmail).single().then(({ data: u, error }) => {
                if (error || !u) return;
                currentUserData = u;
                if (inputFirstname) inputFirstname.value = u.firstname || '';
                if (inputLastname) inputLastname.value = u.lastname || '';
                if (inputUsername) {
                    inputUsername.value = u.username || '';
                    // Reset check icon
                    usernameCheckIcon.textContent = '';
                    inputUsername.classList.remove('input-valid', 'input-error');
                }
            });

            overlay.classList.add('active');
            modalProfile.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeProfileModal() {
            if (!overlay || !modalProfile) return;
            modalProfile.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        function clearProfileErrors() {
            if (errFirstname) errFirstname.textContent = '';
            if (errLastname) errLastname.textContent = '';
            if (errUsername) errUsername.textContent = '';
            if (inputFirstname) inputFirstname.classList.remove('input-error', 'input-valid');
            if (inputLastname) inputLastname.classList.remove('input-error', 'input-valid');
            if (inputUsername) inputUsername.classList.remove('input-error', 'input-valid');
            if (usernameCheckIcon) usernameCheckIcon.textContent = '';
        }

        if (navProfile && modalProfile) {
            navProfile.addEventListener('click', (e) => {
                e.preventDefault();
                openProfileModal();
            });
        }

        if (closeProfile && modalProfile) {
            closeProfile.addEventListener('click', closeProfileModal);
        }

        // --- Real-time username availability check ---
        let usernameCheckTimer = null;
        if (inputUsername) {
            inputUsername.addEventListener('input', () => {
                clearTimeout(usernameCheckTimer);
                const val = inputUsername.value.trim();
                errUsername.textContent = '';
                usernameCheckIcon.textContent = '';
                inputUsername.classList.remove('input-valid', 'input-error');

                if (!val) return;

                // Skip check if unchanged
                if (currentUserData && val.toLowerCase() === (currentUserData.username || '').toLowerCase()) {
                    usernameCheckIcon.textContent = '✅';
                    inputUsername.classList.add('input-valid');
                    return;
                }

                usernameCheckIcon.textContent = '⏳';
                usernameCheckTimer = setTimeout(async () => {
                    const { data, error } = await supabase
                        .from('users')
                        .select('username')
                        .ilike('username', val)
                        .limit(1);

                    if (error) {
                        usernameCheckIcon.textContent = '';
                        return;
                    }

                    if (data && data.length > 0) {
                        usernameCheckIcon.textContent = '❌';
                        inputUsername.classList.add('input-error');
                        inputUsername.classList.remove('input-valid');
                        errUsername.textContent = 'Username is already taken.';
                    } else {
                        usernameCheckIcon.textContent = '✅';
                        inputUsername.classList.add('input-valid');
                        inputUsername.classList.remove('input-error');
                        errUsername.textContent = '';
                    }
                }, 500);
            });
        }

        // --- Profile Form Submit ---
        if (formProfile) {
            formProfile.addEventListener('submit', async (e) => {
                e.preventDefault();
                clearProfileErrors();
                if (profileSuccessMsg) profileSuccessMsg.style.display = 'none';

                const newFirstname = inputFirstname ? inputFirstname.value.trim() : '';
                const newLastname = inputLastname ? inputLastname.value.trim() : '';
                const newUsername = inputUsername ? inputUsername.value.trim() : '';

                let hasError = false;

                if (!newFirstname) {
                    if (errFirstname) errFirstname.textContent = 'First name is required.';
                    if (inputFirstname) inputFirstname.classList.add('input-error');
                    hasError = true;
                }
                if (!newLastname) {
                    if (errLastname) errLastname.textContent = 'Last name is required.';
                    if (inputLastname) inputLastname.classList.add('input-error');
                    hasError = true;
                }
                if (!newUsername) {
                    if (errUsername) errUsername.textContent = 'Username is required.';
                    if (inputUsername) inputUsername.classList.add('input-error');
                    hasError = true;
                }

                // Block submit if username is already flagged as taken
                if (inputUsername && inputUsername.classList.contains('input-error')) {
                    if (!errUsername.textContent) errUsername.textContent = 'Username is already taken.';
                    hasError = true;
                }

                if (hasError) return;

                // Check username taken (final double-check before saving)
                const loggedEmail = localStorage.getItem('loggedInEmail');
                if (!loggedEmail) return;

                // Only check uniqueness if username changed
                const usernameChanged = currentUserData && newUsername.toLowerCase() !== (currentUserData.username || '').toLowerCase();
                if (usernameChanged) {
                    const { data: existing } = await supabase
                        .from('users')
                        .select('username')
                        .ilike('username', newUsername)
                        .limit(1);

                    if (existing && existing.length > 0) {
                        if (errUsername) errUsername.textContent = 'Username is already taken.';
                        if (inputUsername) { inputUsername.classList.add('input-error'); inputUsername.classList.remove('input-valid'); }
                        if (usernameCheckIcon) usernameCheckIcon.textContent = '❌';
                        return;
                    }
                }

                // Save to Supabase
                if (btnProfileSave) { btnProfileSave.disabled = true; btnProfileSave.textContent = 'Saving...'; }

                const { error: updateError } = await supabase
                    .from('users')
                    .update({ firstname: newFirstname, lastname: newLastname, username: newUsername })
                    .eq('email', loggedEmail);

                if (btnProfileSave) { btnProfileSave.disabled = false; btnProfileSave.textContent = 'Save Changes'; }

                if (updateError) {
                    if (errUsername) errUsername.textContent = 'Failed to save. Please try again.';
                    return;
                }

                // Update in-memory and UI
                currentUserData = { ...currentUserData, firstname: newFirstname, lastname: newLastname, username: newUsername };
                localStorage.setItem('firstname', capitalizeName(newFirstname));

                // Update dash-username badge
                const elUsername = document.getElementById('dash-username');
                if (elUsername) elUsername.textContent = newUsername;

                // Show success
                if (profileSuccessMsg) profileSuccessMsg.style.display = 'block';
                setTimeout(() => {
                    if (profileSuccessMsg) profileSuccessMsg.style.display = 'none';
                }, 3000);
            });
        }

        // Close profile modal on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                if (modalProfile && modalProfile.classList.contains('active')) {
                    closeProfileModal();
                }
            });
        }

        // --- Leaderboard Logic ---
        const btnLeaderboard = document.querySelector('.btn-leaderboard');
        const modalLeaderboard = document.getElementById('modal-leaderboard');
        const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard');
        const leaderboardList = document.getElementById('leaderboard-list');

        function generateMedal(rank) {
            let colors = {};
            if (rank === 1) {
                colors = { bg: '#FFCA28', border: '#FFB300' }; // Gold
            } else if (rank === 2) {
                colors = { bg: '#E0E0E0', border: '#BDBDBD' }; // Silver
            } else if (rank === 3) {
                colors = { bg: '#cd7f32', border: '#b87333' }; // Bronze
            } else {
                return `<div style="font-size: 1.2rem; font-weight: 900;">${rank}</div>`;
            }

            return `
                <div style="display: flex; justify-content: center;">
                    <div style="position: relative; display: inline-block; width: 44px; height: 50px;">
                        <svg width="34" height="20" viewBox="0 0 30 20" style="position: absolute; top: -5px; left: 5px; z-index: 1;">
                            <path d="M0 0 L10 20 L15 15 L20 20 L30 0 Z" fill="#e74c3c" stroke="white" stroke-width="1.5" />
                            <!-- Vertical lines for ribbon effect -->
                            <line x1="5" y1="0" x2="10" y2="10" stroke="white" stroke-width="1.5" />
                            <line x1="25" y1="0" x2="20" y2="10" stroke="white" stroke-width="1.5" />
                        </svg>
                        <div style="position: absolute; bottom: 0; left: 2px; width: 40px; height: 40px; border-radius: 50%; background: ${colors.bg}; border: 3px solid ${colors.border}; display: flex; justify-content: center; align-items: center; color: white; font-weight: 900; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 2; text-shadow: 1px 1px 2px rgba(0,0,0,0.2); font-size: 1.2rem;">${rank}</div>
                    </div>
                </div>
            `;
        }

        async function fetchLeaderboardData() {
            if (!leaderboardList) return;
            leaderboardList.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem;">Loading leaderboard data...</div>';

            try {
                // Fetch users and all score levels concurrently
                const [usersRes, lvl1Res, lvl2Res, lvl3Res, lvl4Res, lvl5Res] = await Promise.all([
                    supabase.from('users').select('email, firstname, lastname'),
                    supabase.from('lvl1_scores').select('user_email, points, treats, accuracy'),
                    supabase.from('lvl2_scores').select('user_email, points, treats, accuracy'),
                    supabase.from('lvl3_scores').select('user_email, points, treats, accuracy'),
                    supabase.from('lvl4_scores').select('user_email, points, treats, accuracy'),
                    supabase.from('lvl5_scores').select('user_email, points, treats, accuracy')
                ]);

                const users = usersRes.data || [];
                const allLevels = [lvl1Res.data, lvl2Res.data, lvl3Res.data, lvl4Res.data, lvl5Res.data];

                const playerStats = {};
                users.forEach(u => {
                    playerStats[u.email] = {
                        name: `${capitalizeName(u.firstname)} ${capitalizeName(u.lastname)}`,
                        points: 0,
                        treats: 0,
                        accuracies: []
                    };
                });

                allLevels.forEach(lvlData => {
                    if (!lvlData) return;
                    lvlData.forEach(row => {
                        const email = row.user_email;
                        if (playerStats[email]) {
                            playerStats[email].points += (row.points || 0);
                            playerStats[email].treats += (row.treats || 0);
                            if (row.accuracy != null) {
                                playerStats[email].accuracies.push(row.accuracy);
                            }
                        }
                    });
                });

                const leaderboard = [];
                for (const email in playerStats) {
                    const p = playerStats[email];
                    let avgAccuracy = 0;
                    if (p.accuracies.length > 0) {
                        avgAccuracy = Math.round(p.accuracies.reduce((a, b) => a + b, 0) / p.accuracies.length);
                    }
                    
                    if (p.points > 0 || p.treats > 0 || p.accuracies.length > 0) {
                        leaderboard.push({
                            name: p.name,
                            points: p.points,
                            treats: p.treats,
                            accuracy: avgAccuracy
                        });
                    }
                }

                // Sort descending by points
                leaderboard.sort((a, b) => b.points - a.points);
                
                leaderboardList.innerHTML = '';
                
                if (leaderboard.length === 0) {
                     leaderboardList.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem;">No players on the leaderboard yet!</div>';
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
                    leaderboardList.appendChild(row);
                });

            } catch (error) {
                console.error('Error fetching leaderboard', error);
                leaderboardList.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 1.2rem;">Error loading leaderboard data.</div>';
            }
        }

        if (btnLeaderboard && modalLeaderboard) {
            btnLeaderboard.addEventListener('click', async (e) => {
                e.preventDefault();
                if (overlay) overlay.classList.add('active');
                modalLeaderboard.classList.add('active');
                document.body.style.overflow = 'hidden';
                await fetchLeaderboardData();
            });
        }

        if (btnCloseLeaderboard && modalLeaderboard) {
            btnCloseLeaderboard.addEventListener('click', () => {
                if (overlay) overlay.classList.remove('active');
                modalLeaderboard.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close leaderboard on overlay click (adding logic for modalLeaderboard)
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (modalLeaderboard && modalLeaderboard.classList.contains('active')) {
                    modalLeaderboard.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (modalGoals && modalGoals.classList.contains('active')) {
                    modalGoals.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (modalAbout && modalAbout.classList.contains('active')) {
                    modalAbout.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (modalHowtoplay && modalHowtoplay.classList.contains('active')) {
                    modalHowtoplay.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

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
    const modalGoals = document.getElementById('modal-goals');
    const modalAbout = document.getElementById('modal-about');

    // Buttons
    const btnStartGame = document.getElementById('btn-start-game');
    const btnNotYet = document.getElementById('btn-not-yet');
    const btnLetsGo = document.getElementById('btn-lets-go');
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');
    const navServices = document.getElementById('nav-services');
    const navAbout = document.getElementById('nav-about');
    const closePlay = document.getElementById('close-play');
    const closeLogin = document.getElementById('close-login');
    const closeSignup = document.getElementById('close-signup');
    const closeForgotPw = document.getElementById('close-forgot-pw');
    const closeGoals = document.getElementById('close-goals');
    const closeAbout = document.getElementById('close-about');
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
        const allModals = [modalPlay, modalLogin, modalSignup, modalForgotPw, modalResetPw, modalGoals, modalAbout];
        allModals.forEach(m => {
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

    // Nav services -> Goals modal
    if (navServices) {
        navServices.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalGoals);
        });
    }

    // Nav about -> About modal
    if (navAbout) {
        navAbout.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(modalAbout);
        });
    }

    // Close buttons
    if (closePlay) closePlay.addEventListener('click', closeAllModals);
    if (closeLogin) closeLogin.addEventListener('click', closeAllModals);
    if (closeSignup) closeSignup.addEventListener('click', closeAllModals);
    if (closeForgotPw) closeForgotPw.addEventListener('click', closeAllModals);
    if (closeGoals) closeGoals.addEventListener('click', closeAllModals);
    if (closeAbout) closeAbout.addEventListener('click', closeAllModals);

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

    // --- Signup Username Real-time Validation ---
    const signupUsernameInput = document.getElementById('signup-username');
    const signupUsernameIcon = document.getElementById('signup-username-check-icon');
    const signupUsernameErr = document.getElementById('err-signup-username');
    let signupUsernameCheckTimer = null;

    if (signupUsernameInput) {
        signupUsernameInput.addEventListener('input', () => {
            clearTimeout(signupUsernameCheckTimer);
            const val = signupUsernameInput.value.trim();
            signupUsernameErr.textContent = '';
            signupUsernameIcon.textContent = '';
            signupUsernameInput.classList.remove('input-valid', 'input-error');

            if (!val) return;
            if (val.length < 3) {
                signupUsernameErr.textContent = 'Username must be at least 3 characters.';
                signupUsernameInput.classList.add('input-error');
                return;
            }

            signupUsernameIcon.textContent = '⏳';
            signupUsernameCheckTimer = setTimeout(async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('username')
                    .ilike('username', val)
                    .limit(1);

                if (error) {
                    signupUsernameIcon.textContent = '';
                    return;
                }

                if (data && data.length > 0) {
                    signupUsernameIcon.textContent = '❌';
                    signupUsernameInput.classList.add('input-error');
                    signupUsernameInput.classList.remove('input-valid');
                    signupUsernameErr.textContent = 'Username is already taken.';
                } else {
                    signupUsernameIcon.textContent = '✅';
                    signupUsernameInput.classList.add('input-valid');
                    signupUsernameInput.classList.remove('input-error');
                    signupUsernameErr.textContent = '';
                }
            }, 500);
        });
    }

    // --- Signup Email Real-time Validation ---
    const signupEmailInput = document.getElementById('signup-email');
    const signupEmailIcon = document.getElementById('signup-email-check-icon');
    const signupEmailErr = document.getElementById('err-signup-email');
    let signupEmailCheckTimer = null;

    if (signupEmailInput) {
        signupEmailInput.addEventListener('input', () => {
            clearTimeout(signupEmailCheckTimer);
            const val = signupEmailInput.value.trim();
            signupEmailErr.textContent = '';
            signupEmailIcon.textContent = '';
            signupEmailInput.classList.remove('input-valid', 'input-error');

            if (!val) return;

            // Simple format check before DB query
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
                // We don't necessarily show an error yet as they might be typing
                return;
            }

            signupEmailIcon.textContent = '⏳';
            signupEmailCheckTimer = setTimeout(async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('email')
                    .eq('email', val)
                    .limit(1);

                if (error) {
                    signupEmailIcon.textContent = '';
                    return;
                }

                if (data && data.length > 0) {
                    signupEmailIcon.textContent = '❌';
                    signupEmailInput.classList.add('input-error');
                    signupEmailInput.classList.remove('input-valid');
                    signupEmailErr.textContent = 'Email is already registered.';
                } else {
                    signupEmailIcon.textContent = '✅';
                    signupEmailInput.classList.add('input-valid');
                    signupEmailInput.classList.remove('input-error');
                    signupEmailErr.textContent = '';
                }
            }, 500);
        });
    }

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

        // --- Username Validation ---
        const signupUsernameInput = document.getElementById('signup-username');
        const signupUsernameErr = document.getElementById('err-signup-username');
        const signupUsernameIcon = document.getElementById('signup-username-check-icon');

        if (signupUsernameInput && signupUsernameInput.classList.contains('input-error')) {
            alert('Please choose a different username.');
            return;
        }

        const signupEmailInput = document.getElementById('signup-email');
        const signupEmailErr = document.getElementById('err-signup-email');
        const signupEmailIcon = document.getElementById('signup-email-check-icon');

        if (signupEmailInput && signupEmailInput.classList.contains('input-error')) {
            alert('This email is already registered.');
            return;
        }

        const submitBtn = formSignup.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        // Double check username uniqueness before proceeding
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .ilike('username', username)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            alert('Username is already taken. Please choose another one.');
            if (signupUsernameInput) {
                signupUsernameInput.classList.add('input-error');
                signupUsernameInput.classList.remove('input-valid');
            }
            if (signupUsernameErr) signupUsernameErr.textContent = 'Username is already taken.';
            if (signupUsernameIcon) signupUsernameIcon.textContent = '❌';
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Double check email uniqueness
        const { data: existingEmail } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .limit(1);

        if (existingEmail && existingEmail.length > 0) {
            alert('Email is already registered. Please log in or use another email.');
            if (signupEmailInput) {
                signupEmailInput.classList.add('input-error');
                signupEmailInput.classList.remove('input-valid');
            }
            if (signupEmailErr) signupEmailErr.textContent = 'Email is already registered.';
            if (signupEmailIcon) signupEmailIcon.textContent = '❌';
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

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
        // Success: Show success message UI and then switch to login modal
        formSignup.style.display = 'none';
        const modalSubtitle = modalSignup.querySelector('.modal-subtitle');
        if (modalSubtitle) modalSubtitle.style.display = 'none';

        const modalFooter = modalSignup.querySelector('.modal-footer-text');
        if (modalFooter) modalFooter.style.display = 'none';

        if (signupSuccess) {
            signupSuccess.classList.remove('hidden');
            if (signupNameDisplay) signupNameDisplay.textContent = fname;

            // Wait 3 seconds before switching to the login modal
            setTimeout(() => {
                formSignup.reset();
                formSignup.style.display = '';
                if (modalSubtitle) modalSubtitle.style.display = '';
                if (modalFooter) modalFooter.style.display = '';
                signupSuccess.classList.add('hidden');
                switchModal(modalSignup, modalLogin);
            }, 3000);
        } else {
            // Basic fallback
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
            submitBtn.textContent = 'Verifying...';
            submitBtn.disabled = true;

            try {
                // 1. Check if email exists in our "users" table
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('email')
                    .eq('email', email)
                    .maybeSingle();

                if (userError) throw userError;

                if (!userData) {
                    alert('This email address is not registered. Please check the spelling or sign up for a new account.');
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                // 2. If registered, send the reset link
                submitBtn.textContent = 'Sending...';
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + window.location.pathname
                });

                if (resetError) throw resetError;

                alert('A password reset link has been sent to your email! Please check your inbox.');
                formForgotPw.reset();
                switchModal(modalForgotPw, modalLogin);

            } catch (err) {
                alert('Oops! ' + (err.message || 'An error occurred. Please try again later.'));
                console.error('Password reset error:', err);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // --- Preset Nav Links ---
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.id.includes('login') && !link.id.includes('signup')) {
            link.addEventListener('click', (e) => e.preventDefault());
        }
    });

});
