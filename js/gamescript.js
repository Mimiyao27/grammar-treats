document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dashBtnStart = document.getElementById("dash-btn-start");
  const levelScreen = document.getElementById("level-screen");
  const btnLevelBack = document.getElementById("btn-level-back");
  const level1Btn = document.getElementById("level-1");
  const level2Btn = document.getElementById("level-2");
  const level3Btn = document.getElementById("level-3"); // added in case you want more later
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
    // Replace lock icon with play icon
    const lockIcon = level2Btn.querySelector(".lock-icon");
    if (lockIcon) {
      lockIcon.outerHTML = `
        <svg class="level-icon play-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      `;
    }
  }

  if (unlockedLevel >= 3 && level3Btn) {
    level3Btn.classList.remove("locked");
    level3Btn.disabled = false;
    const lockIcon = level3Btn.querySelector(".lock-icon");
    if (lockIcon) {
      lockIcon.outerHTML = `
        <svg class="level-icon play-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      `;
    }
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
      // Redirect to Pop the Balloon game
      window.location.href = "/games/poptheballoon";
    });
  }

  if (level3Btn) {
    level3Btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/games/grammar-proficiency/";
    });
  }

  if (gsBtnBack) {
    gsBtnBack.addEventListener("click", () => {
        if (gameScreenV2) gameScreenV2.style.display = "none";
        if (levelScreen) levelScreen.style.display = "flex";
    });
  }
});
