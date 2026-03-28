document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dashBtnStart = document.getElementById("dash-btn-start");
  const levelScreen = document.getElementById("level-screen");
  const btnLevelBack = document.getElementById("btn-level-back");
  const level1Btn = document.getElementById("level-1");
  
  // Game Elements V2
  const gameScreenV2 = document.getElementById("game-screen-v2");
  const gsBtnBack = document.getElementById("gs-btn-back");

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

  if (gsBtnBack) {
    gsBtnBack.addEventListener("click", () => {
        if (gameScreenV2) gameScreenV2.style.display = "none";
        if (levelScreen) levelScreen.style.display = "flex";
    });
  }
});
