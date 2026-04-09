// --- Fresh Session Check (Fresh Start on Close) ---
if (!sessionStorage.getItem('gt_session_active')) {
    ['loggedInEmail', 'firstname', 'settings-mode', 'settings-sound', 'settings-bgm', 'unlockedLevel', 'showLevelScreen', 'latestScore', 'latestTreats', 'showCertificatePopup'].forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem('gt_session_active', 'true');
}

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dashBtnStart = document.getElementById("dash-btn-start");
  const levelScreen = document.getElementById("level-screen");
  const btnLevelBack = document.getElementById("btn-level-back");
  const level1Btn = document.getElementById("level-1");
  const level2Btn = document.getElementById("level-2");
  const level3Btn = document.getElementById("level-3"); // added in case you want more later
  const level4Btn = document.getElementById("level-4"); 
  const level5Btn = document.getElementById("level-5");
  const levelSelectionScreen = document.getElementById("level-screen");
  
  // Game Elements V2
  const gameScreenV2 = document.getElementById("game-screen-v2");
  const gsBtnBack = document.getElementById("gs-btn-back");

  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5fb871', '#619bdc', '#FFD700', '#f87171'],
        zIndex: 1000
      });
    }
  }

  // Show Level Screen when "Start Game" is clicked on Dashboard
  if (dashBtnStart && levelScreen) {
    dashBtnStart.addEventListener("click", (e) => {
      e.preventDefault();
      levelScreen.style.display = "flex";
      document.body.style.overflow = "hidden";
      
      // Play unlock/grow animation for level 1
      if (level1Btn) {
        level1Btn.classList.remove("unlock-animation");
        void level1Btn.offsetWidth; // Trigger reflow
        level1Btn.classList.add("unlock-animation");
      }
      
      /* 
      // Play background music
      if (window.bgMusic) {
        window.bgMusic.play().catch(err => console.log('Music play failed:', err));
      }
      */
    });
  }

  // --- Level Progression Logic ---
  const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel") || "1");
  const showLevelScreenFlag = localStorage.getItem("showLevelScreen");
  const latestScore = localStorage.getItem("latestScore");
  const latestTreats = localStorage.getItem("latestTreats");

  // Display latest stats on dashboard if available
  if (latestScore !== null) {
    const levelScoreElem = document.getElementById("level-score");
    if (levelScoreElem) levelScoreElem.innerText = latestScore;
  }
  if (latestTreats !== null) {
    const levelTreatsElem = document.getElementById("level-treats");
    if (levelTreatsElem) levelTreatsElem.innerText = latestTreats;
  }

  if (unlockedLevel >= 2 && level2Btn) {
    level2Btn.classList.remove("locked");
    level2Btn.disabled = false;
    if (level1Btn) level1Btn.classList.add("completed");
  }

  if (unlockedLevel >= 3 && level3Btn) {
    level3Btn.classList.remove("locked");
    level3Btn.disabled = false;
    if (level2Btn) level2Btn.classList.add("completed");
  }

  if (unlockedLevel >= 4 && level4Btn) {
    level4Btn.classList.remove("locked");
    level4Btn.disabled = false;
    if (level3Btn) level3Btn.classList.add("completed");
  }

  if (unlockedLevel >= 5 && level5Btn) {
    level5Btn.classList.remove("locked");
    level5Btn.disabled = false;
    if (level4Btn) level4Btn.classList.add("completed");
  }

  if (unlockedLevel >= 6) {
    if (level5Btn) level5Btn.classList.add("completed");
  }

  // Auto-show level selection if flag is set
  if (showLevelScreenFlag === "true" && levelScreen) {
    levelScreen.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    // Play unlock animation for newest unlocked level
    if (unlockedLevel === 2 && level2Btn) {
      setTimeout(() => {
        level2Btn.classList.add("unlock-animation");
        triggerConfetti();
      }, 500);
    } else if (unlockedLevel === 3 && level3Btn) {
      setTimeout(() => {
        level3Btn.classList.add("unlock-animation");
        triggerConfetti();
      }, 500);
    } else if (unlockedLevel === 4 && level4Btn) {
      setTimeout(() => {
        level4Btn.classList.add("unlock-animation");
        triggerConfetti();
      }, 500);
    } else if (unlockedLevel === 5 && level5Btn) {
      setTimeout(() => {
        level5Btn.classList.add("unlock-animation");
        triggerConfetti();
      }, 500);
    }

    // Clear flag after use
    localStorage.removeItem("showLevelScreen");
  }

  // Hide Level Screen when "Back" is clicked
  if (btnLevelBack && levelScreen) {
    btnLevelBack.addEventListener("click", (e) => {
      e.preventDefault();
      levelScreen.style.display = "none";
      document.body.style.overflow = "";
    });
  }

  // --- Dynamic UI Sync from script.js ---
  document.addEventListener('progressRestored', (e) => {
      const newUnlockedLevel = e.detail.unlockedLevel;
      console.log(`UI Sync: Updating levels for Level ${newUnlockedLevel}`);
      
      // Reset all first
      [level1Btn, level2Btn, level3Btn, level4Btn, level5Btn].forEach(btn => {
          if (btn) {
              btn.classList.add("locked");
              btn.classList.remove("completed");
              btn.disabled = true;
          }
      });
      if (level1Btn) {
          level1Btn.classList.remove("locked");
          level1Btn.disabled = false;
      }

      if (newUnlockedLevel >= 2) {
          if (level2Btn) { level2Btn.classList.remove("locked"); level2Btn.disabled = false; }
          if (level1Btn) level1Btn.classList.add("completed");
      }
      if (newUnlockedLevel >= 3) {
          if (level3Btn) { level3Btn.classList.remove("locked"); level3Btn.disabled = false; }
          if (level2Btn) level2Btn.classList.add("completed");
      }
      if (newUnlockedLevel >= 4) {
          if (level4Btn) { level4Btn.classList.remove("locked"); level4Btn.disabled = false; }
          if (level3Btn) level3Btn.classList.add("completed");
      }
      if (newUnlockedLevel >= 5) {
          if (level5Btn) { level5Btn.classList.remove("locked"); level5Btn.disabled = false; }
          if (level4Btn) level4Btn.classList.add("completed");
      }
      if (newUnlockedLevel >= 6) {
          if (level5Btn) level5Btn.classList.add("completed");
      }
  });

  // Launch Empty Level 1 when Level 1 is clicked
  if (level1Btn) {
    level1Btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Redirect to the new Capitalization game
      window.location.href = "/games/capitalization/";
    });
  }

  // Add click listener for Level 2 (optional - for now it can just show Level 2 placeholder or something)
  if (level2Btn) {
    level2Btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Redirect to Punctuation game
      window.location.href = "/games/punctuation";
    });
  }

  if (level3Btn) {
    level3Btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/games/grammar-proficiency/";
    });
  }

  if (level4Btn) {
    level4Btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/games/arrange-the-word/";
    });
  }

  if (level5Btn) {
    level5Btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/games/sentence-correction/";
    });
  }

  if (gsBtnBack) {
    gsBtnBack.addEventListener("click", () => {
        if (gameScreenV2) gameScreenV2.style.display = "none";
        if (levelScreen) levelScreen.style.display = "flex";
    });
  }
});
