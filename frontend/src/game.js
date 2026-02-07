export function startGame() {
  const root = document.getElementById("root");

  /* ---------- GAME SETUP ---------- */
  const players = ["Player 1", "Player 2", "Player 3", "Player 4"];
  let currentPlayerIndex = 0;

  const words = ["Tree", "House", "Car", "Cat", "Bridge"];
  const word = words[Math.floor(Math.random() * words.length)];
  const imposterIndex = Math.floor(Math.random() * players.length);

  console.log("IMPOSTER:", players[imposterIndex]);
  console.log("WORD:", word);

  /* ---------- UI ---------- */
  root.innerHTML = `
    <h2 id="turnInfo"></h2>
    <p id="wordInfo"></p>
    <p id="timer"></p>

    <canvas id="canvas" width="800" height="500"
      style="border:2px solid black; background:white"></canvas>

    <div>
      <button id="endTurn">End Turn</button>
      <button id="undo">Undo</button>
      <button id="replay">Replay</button>
      <button id="clear">New Round</button>
      <button id="vote">Vote Imposter</button>
    </div>
  `;

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const turnInfo = document.getElementById("turnInfo");
  const wordInfo = document.getElementById("wordInfo");
  const timerEl = document.getElementById("timer");

  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  /* ---------- STATE ---------- */
  let drawing = false;
  let hasDrawn = false;
  let strokes = [];
  let currentStroke = null;

  let timeLeft = 15;
  let timerId;

  /* ---------- TURN UI ---------- */
  function updateUI() {
    const player = players[currentPlayerIndex];
    turnInfo.textContent = `${player}'s turn`;

    wordInfo.textContent =
      currentPlayerIndex === imposterIndex
        ? "You are the IMPOSTER"
        : `Word: ${word}`;

    resetTimer();
  }

  /* ---------- TIMER ---------- */
  function resetTimer() {
    clearInterval(timerId);
    timeLeft = 15;
    timerEl.textContent = `Time: ${timeLeft}`;

    timerId = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `Time: ${timeLeft}`;
      if (timeLeft === 0) endTurn();
    }, 1000);
  }

  /* ---------- DRAWING ---------- */
  canvas.addEventListener("mousedown", e => {
    if (hasDrawn) return;

    drawing = true;
    currentStroke = {
      player: players[currentPlayerIndex],
      points: [{ x: e.offsetX, y: e.offsetY }]
    };

    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  canvas.addEventListener("mousemove", e => {
    if (!drawing) return;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    currentStroke.points.push({ x: e.offsetX, y: e.offsetY });
  });

  canvas.addEventListener("mouseup", () => {
    if (!drawing) return;

    drawing = false;
    hasDrawn = true;
    strokes.push(currentStroke);
    currentStroke = null;
  });

  /* ---------- TURN CONTROL ---------- */
  function endTurn() {
    hasDrawn = false;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateUI();
  }

  document.getElementById("endTurn").onclick = endTurn;

  /* ---------- UNDO ---------- */
  document.getElementById("undo").onclick = () => {
    const last = strokes[strokes.length - 1];
    if (!last || last.player !== players[currentPlayerIndex]) return;

    strokes.pop();
    redraw();
    hasDrawn = false;
  };

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) {
      ctx.beginPath();
      stroke.points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
    }
  }

  /* ---------- REPLAY ---------- */
  document.getElementById("replay").onclick = async () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      ctx.beginPath();
      for (let i = 0; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        ctx.stroke();
        await new Promise(r => setTimeout(r, 10));
      }
    }
  };

  /* ---------- NEW ROUND ---------- */
  document.getElementById("clear").onclick = () => {
    strokes = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  /* ---------- VOTING ---------- */
  document.getElementById("vote").onclick = () => {
    const guess = prompt(
      "Who is the imposter?\n" + players.join(", ")
    );

    if (!players.includes(guess)) return alert("Invalid player");

    if (players.indexOf(guess) === imposterIndex) {
      alert("Correct! Imposter caught 🎉");
    } else {
      alert("Wrong! Imposter wins 😈");
    }
  };

  /* ---------- KEYBOARD SHORTCUTS ---------- */
  document.addEventListener("keydown", e => {
    if (e.key === "Enter") endTurn();
    if (e.key === "u") document.getElementById("undo").click();
    if (e.key === "r") document.getElementById("replay").click();
  });

  updateUI();
}
