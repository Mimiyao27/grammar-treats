// ── Candy SVG ──
function candySVG(seed) {
  const hues = [0, 20, 200, 270, 330, 160, 40];
  const h = hues[seed % hues.length];
  const body = `hsl(${h},80%,80%)`,
    stripe = `hsl(${h},70%,60%)`,
    twist = `hsl(${h},75%,72%)`;
  return `<svg viewBox="0 0 60 54" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="10" cy="27" rx="10" ry="13" fill="${twist}" opacity=".9" transform="rotate(-15 10 27)"/>
    <ellipse cx="50" cy="27" rx="10" ry="13" fill="${twist}" opacity=".9" transform="rotate(15 50 27)"/>
    <ellipse cx="30" cy="27" rx="18" ry="15" fill="${body}"/>
    <clipPath id="cc${seed}"><ellipse cx="30" cy="27" rx="18" ry="15"/></clipPath>
    <g clip-path="url(#cc${seed})">
      <line x1="12" y1="12" x2="48" y2="42" stroke="${stripe}" stroke-width="4.5" opacity=".65"/>
      <line x1="20" y1="10" x2="56" y2="40" stroke="${stripe}" stroke-width="4.5" opacity=".65"/>
      <line x1="4"  y1="20" x2="40" y2="50" stroke="${stripe}" stroke-width="4.5" opacity=".65"/>
    </g>
    <ellipse cx="30" cy="27" rx="18" ry="15" fill="none" stroke="${stripe}" stroke-width="2"/>
    <ellipse cx="23" cy="20" rx="5" ry="3" fill="white" opacity=".45" transform="rotate(-20 23 20)"/>
  </svg>`;
}

// ── Questions ──
const questions = [
  {
    sentence: [
      "on",
      "friday,",
      "the",
      "students",
      "presented",
      "their",
      "science",
      "projects.",
    ],
    correct: [
      "On",
      "Friday,",
      "the",
      "students",
      "presented",
      "their",
      "science",
      "projects.",
    ],
    explanation: `We capitalize <em>"On"</em> because it is the first word of the sentence, and <em>"Friday"</em> because it is a day of the week. <em>"science"</em> stays lowercase here because it is used as a general subject, not a formal course title.`,
    explainWrong: `We need to capitalize <em>"On"</em> as the first word and <em>"Friday"</em> as a day of the week. Note that <em>"science"</em> stays lowercase since it is a general subject name here.`,
  },
  {
    sentence: [
      "my",
      "little",
      "brother,",
      "sam,",
      "built",
      "a",
      "treehouse",
      "in",
      "our",
      "backyard.",
    ],
    correct: [
      "My",
      "little",
      "brother,",
      "Sam,",
      "built",
      "a",
      "treehouse",
      "in",
      "our",
      "backyard.",
    ],
    explanation: `We capitalize <em>"My"</em> because it is the first word of the sentence, and <em>"Sam"</em> because it is a proper name — the specific name of a person.`,
    explainWrong: `We need to capitalize <em>"My"</em> as the first word of the sentence and <em>"Sam"</em> because it is a person's proper name.`,
  },
  {
    sentence: [
      "mrs.",
      "garcia,",
      "our",
      "english",
      "teacher,",
      "explained",
      "the",
      "assignment",
      "clearly.",
    ],
    correct: [
      "Mrs.",
      "Garcia,",
      "our",
      "English",
      "teacher,",
      "explained",
      "the",
      "assignment",
      "clearly.",
    ],
    explanation: `We capitalize <em>"Mrs."</em> as a title before a name, <em>"Garcia"</em> as a person's last name, and <em>"English"</em> because it is the name of a language.`,
    explainWrong: `We need to capitalize <em>"Mrs."</em> as a courtesy title, <em>"Garcia"</em> as a proper last name, and <em>"English"</em> because it is the name of a language.`,
  },
  {
    sentence: [
      "during",
      "art",
      "class,",
      "i",
      "painted",
      "a",
      "picture",
      "of",
      "mayon",
      "volcano.",
    ],
    correct: [
      "During",
      "Art",
      "class,",
      "I",
      "painted",
      "a",
      "picture",
      "of",
      "Mayon",
      "Volcano.",
    ],
    explanation: `We capitalize <em>"During"</em> as the first word, <em>"Art"</em> as a formal school subject title, <em>"I"</em> because the pronoun "I" is always capitalized, and <em>"Mayon Volcano"</em> as a proper geographical name.`,
    explainWrong: `We need to capitalize <em>"During"</em> as the first word, <em>"Art"</em> as a formal subject title, <em>"I"</em> because it is always capitalized, and <em>"Mayon Volcano"</em> as a proper place name.`,
  },
  {
    sentence: [
      "my",
      "friend,",
      "liza,",
      "bakes",
      "delicious",
      "banana",
      "cakes",
      "every",
      "weekend.",
    ],
    correct: [
      "My",
      "friend,",
      "Liza,",
      "bakes",
      "delicious",
      "banana",
      "cakes",
      "every",
      "weekend.",
    ],
    explanation: `We capitalize <em>"My"</em> as the first word of the sentence and <em>"Liza"</em> because it is a person's proper name.`,
    explainWrong: `We need to capitalize <em>"My"</em> as the first word and <em>"Liza"</em> because it is a proper name — the specific name of a person.`,
  },
  {
    sentence: [
      "i",
      "helped",
      "my",
      "neighbor,",
      "mr.",
      "delos",
      "santos,",
      "water",
      "the",
      "plants.",
    ],
    correct: [
      "I",
      "helped",
      "my",
      "neighbor,",
      "Mr.",
      "Delos",
      "Santos,",
      "water",
      "the",
      "plants.",
    ],
    explanation: `We capitalize <em>"I"</em> because the pronoun "I" is always capitalized, <em>"Mr."</em> as a title before a name, and <em>"Delos Santos"</em> as a person's proper last name.`,
    explainWrong: `We need to capitalize <em>"I"</em> (always capitalized), <em>"Mr."</em> as a title, and <em>"Delos Santos"</em> as a proper last name.`,
  },
  {
    sentence: [
      "during",
      "computer",
      "class,",
      "we",
      "learned",
      "to",
      "create",
      "a",
      "presentation",
      "in",
      "powerpoint.",
    ],
    correct: [
      "During",
      "Computer",
      "class,",
      "we",
      "learned",
      "to",
      "create",
      "a",
      "presentation",
      "in",
      "PowerPoint.",
    ],
    explanation: `We capitalize <em>"During"</em> as the first word, <em>"Computer"</em> as a formal school subject title, and <em>"PowerPoint"</em> because it is a trademarked brand name (note the capital "P" in the middle too!).`,
    explainWrong: `We need to capitalize <em>"During"</em> as the first word, <em>"Computer"</em> as a formal subject title, and <em>"PowerPoint"</em> as a brand name with a capital P and capital P.`,
  },
  {
    sentence: [
      "my",
      "cat,",
      "whiskers,",
      "likes",
      "to",
      "sleep",
      "on",
      "the",
      "sofa.",
    ],
    correct: [
      "My",
      "cat,",
      "Whiskers,",
      "likes",
      "to",
      "sleep",
      "on",
      "the",
      "sofa.",
    ],
    explanation: `We capitalize <em>"My"</em> as the first word and <em>"Whiskers"</em> because it is a proper name — the specific name given to the cat.`,
    explainWrong: `We need to capitalize <em>"My"</em> as the first word and <em>"Whiskers"</em> because it is a proper name given to the cat.`,
  },
  {
    sentence: [
      "on",
      "wednesday,",
      "our",
      "class",
      "went",
      "to",
      "intramuros",
      "for",
      "history",
      "tour.",
    ],
    correct: [
      "On",
      "Wednesday,",
      "our",
      "class",
      "went",
      "to",
      "Intramuros",
      "for",
      "history",
      "tour.",
    ],
    explanation: `We capitalize <em>"On"</em> as the first word, <em>"Wednesday"</em> as a day of the week, and <em>"Intramuros"</em> as a proper name of a historical place in the Philippines.`,
    explainWrong: `We need to capitalize <em>"On"</em> as the first word, <em>"Wednesday"</em> as a day of the week, and <em>"Intramuros"</em> as a proper place name.`,
  },
  {
    sentence: [
      "the",
      "earth",
      "revolves",
      "around",
      "the",
      "sun",
      "once",
      "every",
      "365",
      "days.",
    ],
    correct: [
      "The",
      "Earth",
      "revolves",
      "around",
      "the",
      "Sun",
      "once",
      "every",
      "365",
      "days.",
    ],
    explanation: `We capitalize <em>"The"</em> as the first word, <em>"Earth"</em> as the proper name of our planet, and <em>"Sun"</em> as the proper name of our star. Planet and star names are always proper nouns!`,
    explainWrong: `We need to capitalize <em>"The"</em> as the first word, <em>"Earth"</em> as our planet's proper name, and <em>"Sun"</em> as the proper name of our star.`,
  },
];

const TOTAL = 10;
let currentQ = 0;
let score = 0;
let correctCount = 0;
let incorrectLog = []; // stores {qIdx, userSentence, correctSentence, explanation}
let userAnswers = [];
let activeTileIndex = null;
let playerName = "Player";

const $ = (id) => document.getElementById(id);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.toggle("visible", s.id === id);
    s.classList.toggle("hidden", s.id !== id);
  });
}

// ── Build question panel ──
function buildPanel(qIdx) {
  const q = questions[qIdx % questions.length];
  $("q-counter").textContent = `QUESTION ${qIdx + 1} of ${TOTAL}`;
  userAnswers = [...q.sentence];
  const panel = $("wordPanel");
  panel.innerHTML = "";
  q.sentence.forEach((word, i) => {
    const tile = document.createElement("div");
    tile.className = "word-tile";
    tile.dataset.index = i;
    tile.style.animationDelay = `${i * 55}ms`;
    tile.innerHTML = `<div class="candy-icon">${candySVG(i)}</div><div class="word-bubble" id="bubble-${i}">${word}</div>`;
    tile.addEventListener("click", () => {
      playClickSound();
      openModal(i);
    });
    panel.appendChild(tile);
  });
}

// ── Modal ──
function openModal(index) {
  activeTileIndex = index;
  const q = questions[currentQ % questions.length];
  $("modal-original").textContent = q.sentence[index];
  $("modal-input").value =
    userAnswers[index] !== q.sentence[index] ? userAnswers[index] : "";
  $("modal").classList.add("open");
  setTimeout(() => $("modal-input").focus(), 220);
}
function closeModal() {
  $("modal").classList.remove("open");
  activeTileIndex = null;
  $("modal-input").value = "";
}
function confirmModal() {
  if (activeTileIndex === null) return;
  const typed = $("modal-input").value.trim();
  if (!typed) {
    closeModal();
    return;
  }
  const tile = document.querySelector(
    `.word-tile[data-index="${activeTileIndex}"]`,
  );
  const bubble = $(`bubble-${activeTileIndex}`);
  userAnswers[activeTileIndex] = typed;
  bubble.textContent = typed;
  // No green/red hint — just mark as "answered" (slightly lighter shade)
  tile.classList.remove("corrected", "wrong");
  tile.classList.add("answered");
  closeModal();
}

// ── Confetti ──
function spawnConfetti() {
  const wrap = $("confettiWrap");
  wrap.innerHTML = "";
  const colors = [
    "#f5922c",
    "#4cbe5a",
    "#22b8c8",
    "#e8403a",
    "#fff44f",
    "#c084fc",
    "#38bdf8",
  ];
  for (let i = 0; i < 55; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left:${Math.random() * 100}%;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      width:${6 + Math.random() * 8}px;
      height:${10 + Math.random() * 14}px;
      animation-duration:${1.8 + Math.random() * 2.2}s;
      animation-delay:${Math.random() * 0.8}s;
      border-radius:${Math.random() > 0.5 ? "50%" : "3px"};
    `;
    wrap.appendChild(el);
  }
}

// ── Show result screen ──
function showResult(isCorrect) {
  const q = questions[currentQ % questions.length];
  const sentenceText = q.correct.join(" ");

  if (isCorrect) {
    score += 100;
    correctCount++;
    playCorrectSound();
    $("correct-score").textContent = `Score: ${score}`;
    $("correct-sentence-display").textContent = sentenceText;
    $("correct-explanation").innerHTML = q.explanation;
    spawnConfetti();
    showScreen("screen-correct");
  } else {
    incorrectLog.push({
      qIdx: currentQ,
      userSentence: [...userAnswers].join(" "),
      correctSentence: sentenceText,
      explanation: q.explainWrong,
    });
    playIncorrectSound();
    $("incorrect-score").textContent = `Score: ${score}`;
    $("incorrect-sentence-display").textContent = sentenceText;
    $("incorrect-explanation").innerHTML = q.explainWrong;
    showScreen("screen-incorrect");
  }
}

// ── Submit ──
$("submitBtn").addEventListener("click", () => {
  const q = questions[currentQ % questions.length];
  const attempted = userAnswers.some((a, i) => a !== q.sentence[i]);
  if (!attempted) {
    // Bounce all tiles to prompt interaction
    document.querySelectorAll(".word-tile").forEach((t, i) => {
      setTimeout(() => {
        t.classList.add("wrong");
        setTimeout(() => t.classList.remove("wrong"), 400);
      }, i * 60);
    });
    return;
  }
  document
    .querySelectorAll(".word-tile")
    .forEach((t) => t.classList.remove("answered", "wrong"));
  const allCorrect = q.correct.every((w, i) => userAnswers[i] === w);
  showResult(allCorrect);
});

// ── Next question ──
function goNextQuestion() {
  currentQ++;
  if (currentQ >= TOTAL) {
    showFinalScreen();
    return;
  }
  buildPanel(currentQ);
  showScreen("screen-question");
}

// ── Final Result Screen ──
function drawPieChart(correct, total) {
  const canvas = $("finalPieChart");
  const ctx = canvas.getContext("2d");
  const cx = 65,
    cy = 65,
    r = 58;
  const incorrectCount = total - correct;
  ctx.clearRect(0, 0, 130, 130);
  // Draw incorrect slice (red) first
  if (incorrectCount > 0) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(
      cx,
      cy,
      r,
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI * incorrectCount) / total,
    );
    ctx.closePath();
    ctx.fillStyle = "#e8403a";
    ctx.fill();
  }
  // Draw correct slice (green)
  if (correct > 0) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(
      cx,
      cy,
      r,
      -Math.PI / 2 + (2 * Math.PI * incorrectCount) / total,
      -Math.PI / 2 + 2 * Math.PI,
    );
    ctx.closePath();
    ctx.fillStyle = "#4cbe5a";
    ctx.fill();
  }
  // Border
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function showFinalScreen() {
  const name = playerName || "Player";
  $("finalTitle").textContent = `Great job, ${name}!`;
  $("finalScoreOf").textContent = `${correctCount}/10`;
  $("finalPoints").textContent = score;

  // Fun fixed treats: 3–5 per correct answer
  const treatsPerCorrect = [3, 4, 5, 4, 3, 5, 4, 3, 5, 4];
  const treats =
    correctCount > 0
      ? treatsPerCorrect.slice(0, correctCount).reduce((a, b) => a + b, 0)
      : 0;
  $("finalTreats").textContent = treats;
  // Update game list badges
  $("gl-score-badge").textContent = `Score: ${score}`;
  $("gl-treats-badge").textContent = `Treats Earned: ${treats}`;

  // Motivational message based on score
  const msgs = [
    "Keep practicing — every great reader started just like you! 💪",
    "Good effort! A little more practice and you'll be a Grammar Champion! 📚",
    "Nice work! Keep polishing your skills to collect even more tasty treats! 🍬",
    "Excellent! You're so close to a perfect score — keep it up! ⭐",
    "Perfect score! You're a Grammar Superstar! 🏆🎉",
  ];
  const tier =
    correctCount <= 2
      ? 0
      : correctCount <= 4
        ? 1
        : correctCount <= 6
          ? 2
          : correctCount <= 9
            ? 3
            : 4;
  $("finalMotivate").textContent = msgs[tier];

  drawPieChart(correctCount, TOTAL);
  spawnFinalConfetti();
  showScreen("screen-final");
}

function spawnFinalConfetti() {
  const wrap = $("finalConfettiWrap");
  wrap.innerHTML = "";
  const colors = [
    "#f5922c",
    "#4cbe5a",
    "#22b8c8",
    "#e8403a",
    "#fff44f",
    "#c084fc",
    "#38bdf8",
  ];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `left:${Math.random() * 100}%;background:${colors[Math.floor(Math.random() * colors.length)]};width:${6 + Math.random() * 8}px;height:${10 + Math.random() * 14}px;animation-duration:${2 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1.2}s;border-radius:${Math.random() > 0.5 ? "50%" : "3px"};`;
    wrap.appendChild(el);
  }
}

$("nextBtnCorrect").addEventListener("click", goNextQuestion);
$("nextBtnIncorrect").addEventListener("click", goNextQuestion);

// ── Navigation ──

$("startBtn").addEventListener("click", () => {
  playerName = "Player";
  // Update welcome badge
  document.querySelector(".welcome-badge .username").textContent = playerName;
  // Update game list badges
  $("gl-score-badge").textContent = `Score: ${score}`;
  $("gl-treats-badge").textContent = `Treats Earned: 0`;
  showScreen("screen-gamelist");
});

// ── Game List wiring ──
$("glBackBtn").addEventListener("click", () => showScreen("screen-welcome"));

$("lvCard1").addEventListener("click", () => {
  //---- BG Music
  const music = document.getElementById("bgMusic");
  music.play().catch(() => {});
  score = 0;
  currentQ = 0;
  correctCount = 0;
  incorrectLog = [];
  buildPanel(0);
  showScreen("screen-question");
});

// Locked levels show toast
let toastTimer = null;
function showLockedToast() {
  const toast = $("lockedToast");
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}
["lvCard2", "lvCard3", "lvCard4", "lvCard5"].forEach((id) => {
  $(id).addEventListener("click", showLockedToast);
});
$("backBtn").addEventListener("click", () => showScreen("screen-welcome"));
$("resBackCorrect").addEventListener("click", () =>
  showScreen("screen-question"),
);
$("resBackIncorrect").addEventListener("click", () =>
  showScreen("screen-question"),
);
$("finalBackBtn").addEventListener("click", () => {
  $("gl-score-badge").textContent = `Score: ${score}`;
  showScreen("screen-gamelist");
});

// ── Next Level → Unlock Level 2 ──
$("nextLevelBtn").addEventListener("click", () => {
  const card = $("lvCard2");
  card.classList.remove("locked");
  card.classList.add("unlocked");
  const lockIcon = card.querySelector(".level-lock-icon");
  if (lockIcon) {
    lockIcon.outerHTML = `<div class="level-play-btn">▶</div>`;
  }
  $("gl-score-badge").textContent = `Score: ${score}`;
  showScreen("screen-gamelist");
});
$("comingSoonClose").addEventListener("click", () => {
  $("comingSoonOverlay").classList.remove("open");
});
$("comingSoonOverlay").addEventListener("click", (e) => {
  if (e.target === $("comingSoonOverlay"))
    $("comingSoonOverlay").classList.remove("open");
});

// ── Review Incorrect Answers ──
$("reviewBtn").addEventListener("click", () => {
  const list = $("reviewList");
  list.innerHTML = "";
  if (incorrectLog.length === 0) {
    list.innerHTML = `<div class="review-no-errors">🎉 You got everything right! No errors to review.</div>`;
  } else {
    incorrectLog.forEach((entry, idx) => {
      const div = document.createElement("div");
      div.className = "review-item";
      div.innerHTML = `
              <div class="ri-label">QUESTION ${entry.qIdx + 1}</div>
              <div class="ri-wrong">Your answer: ${entry.userSentence}</div>
              <div class="ri-correct">✓ Correct: ${entry.correctSentence}</div>
              <div class="ri-exp">${entry.explanation}</div>
            `;
      list.appendChild(div);
    });
  }
  $("reviewOverlay").classList.add("open");
});
$("reviewClose").addEventListener("click", () =>
  $("reviewOverlay").classList.remove("open"),
);
$("reviewOverlay").addEventListener("click", (e) => {
  if (e.target === $("reviewOverlay"))
    $("reviewOverlay").classList.remove("open");
});

// ── Modal wiring ──
$("modal-cancel").addEventListener("click", closeModal);
$("modal-confirm").addEventListener("click", confirmModal);
$("modal").addEventListener("click", (e) => {
  if (e.target === $("modal")) closeModal();
});
$("modal-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") confirmModal();
  if (e.key === "Escape") closeModal();
});
//--- SOUND CLICK
function playClickSound() {
  const click = new Audio("sound/click.wav");
  click.play();
}
//--- correct sound
const playCorrectSound = () => {
  const click = new Audio("sound/correct.mp3");
  click.play();
};
//----- incorrect sound
const playIncorrectSound = () => {
  const click = new Audio("sound/incorrect.wav");
  click.play();
};

