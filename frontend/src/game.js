// game.js - Fixed with original canvas and scrolling
export function startGame() {
  const root = document.getElementById("root");

  /* ---------- BIGGER WORD LIST ---------- */
  const wordCategories = {
    easy: ["Cat", "Dog", "Sun", "Tree", "House", "Car", "Book", "Ball"],
    medium: ["Airplane", "Elephant", "Mountain", "Restaurant", "Computer", "Guitar"],
    hard: ["Evolution", "Metamorphosis", "Infrastructure", "Photosynthesis"]
  };
  
  const allWords = [...wordCategories.easy, ...wordCategories.medium, ...wordCategories.hard];
  
  /* ---------- GAME SETUP ---------- */
  const players = ["Player 1", "Player 2", "Player 3", "Player 4"];
  let currentPlayerIndex = 0;
  let scores = { "Player 1": 0, "Player 2": 0, "Player 3": 0, "Player 4": 0 };
  
  const word = allWords[Math.floor(Math.random() * allWords.length)];
  const imposterIndex = Math.floor(Math.random() * players.length);

  console.log("IMPOSTER:", players[imposterIndex]);
  console.log("WORD:", word);

  /* ---------- UI WITH SCROLLING ---------- */
  root.innerHTML = `
    <div style="
      max-width: 1300px;
      margin: 0 0 0 300px;
      padding: 15px;
      min-height: 100vh;
      display: flex;
      gap: 20px;
    ">
      <!-- LEFT EMPTY SPACE -->
      <div style="
        position: fixed;
        left: 10px;
        top: 10px;
        width: 280px;
        height: calc(100vh - 20px);
        background: rgba(255, 255, 255, 0.03);
        border-radius: 10px;
        border: 1px dashed #444;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
      ">
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 40px; margin-bottom: 10px;">🚧</div>
          Future Features<br><small style="font-size: 12px;">(Chat, Settings, etc.)</small>
        </div>
      </div>

      <!-- CENTER: Game -->
      <div style="
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      ">
        <!-- Header -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        ">
          <div>
            <h2 id="turnInfo" style="margin: 0 0 8px 0; color: #4ecdc4; font-size: 24px;">Player 1's turn</h2>
            <p id="wordInfo" style="margin: 0; color: #ff6b6b; font-size: 16px;"></p>
          </div>
          
          <div style="text-align: right;">
            <p id="timer" style="
              font-size: 20px;
              margin: 0 0 8px 0;
              padding: 8px 16px;
              background: #333;
              color: white;
              border-radius: 8px;
              display: inline-block;
            ">⏱️ 20s</p>
            <p id="roundInfo" style="margin: 0; font-size: 14px; color: #aaa;">Round 1</p>
          </div>
        </div>

        <!-- Canvas - ORIGINAL WORKING VERSION -->
        <div style="
          margin: 0 0 20px 0;
          border: 4px solid #646cff;
          border-radius: 10px;
          overflow: hidden;
          background: black;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        ">
          <canvas id="canvas" width="800" height="500" style="
            display: block;
            background: white;
            cursor: crosshair;
          "></canvas>
        </div>

        <!-- Tools -->
        <div style="
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        ">
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 14px; color: #aaa;">Brush:</span>
            <input type="range" id="brushSize" min="1" max="20" value="3" style="width: 100px;">
            <span id="brushSizeValue" style="font-size: 14px;">3</span>
          </div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 14px; color: #aaa;">Color:</span>
            ${['black', 'red', 'blue', 'green', 'purple'].map(color => `
              <button class="color-btn" data-color="${color}" style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: ${color};
                border: ${color === 'black' ? '3px solid gold' : '2px solid #666'};
                cursor: pointer;
                padding: 0;
              "></button>
            `).join('')}
          </div>
        </div>

        <!-- Controls -->
        <div style="
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 15px;
        ">
          <button id="endTurn" style="
            padding: 15px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
          ">End Turn</button>
          
          <button id="undo" style="
            padding: 15px;
            background: #FF9800;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
          ">Undo</button>
          
          <button id="clear" style="
            padding: 15px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
          ">New Round</button>
          
          <button id="vote" style="
            padding: 15px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            opacity: 0.5;
          " disabled>Vote Imposter</button>
        </div>

        <!-- Status -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
          font-size: 14px;
          color: #666;
        ">
          <div>
            Difficulty: ${wordCategories.easy.includes(word) ? '🟢 Easy' : wordCategories.medium.includes(word) ? '🟡 Medium' : '🔴 Hard'}
          </div>
          <div style="color: #aaa;">
            Strokes: <span id="strokeCount">0</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Player Scores -->
      <div style="
        width: 200px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        padding: 15px;
        border: 1px solid #333;
        position: sticky;
        top: 15px;
        height: fit-content;
      ">
        <h3 style="margin: 0 0 15px 0; color: #aaa; text-align: center; font-size: 18px;">Players</h3>
        
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        ">
          ${players.map(p => `
            <div data-player="${p}" style="
              background: rgba(255, 255, 255, 0.1);
              padding: 12px 10px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #333;
            ">
              <div style="
                font-size: 12px;
                color: #aaa;
                margin-bottom: 8px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${p}</div>
              <div style="
                font-size: 28px;
                font-weight: bold;
                color: #4ecdc4;
              ">${scores[p]}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="
          margin-top: 20px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          font-size: 12px;
          color: #888;
          line-height: 1.4;
        ">
          <div style="color: #4ecdc4; margin-bottom: 8px; font-weight: bold;">🎨 How to play:</div>
          <div>• One player is the IMPOSTER</div>
          <div>• Others draw the secret word</div>
          <div>• Vote after all draw</div>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const turnInfo = document.getElementById("turnInfo");
  const wordInfo = document.getElementById("wordInfo");
  const timerEl = document.getElementById("timer");
  const brushSizeInput = document.getElementById("brushSize");
  const brushSizeValue = document.getElementById("brushSizeValue");

  /* ---------- DRAWING TOOLS SETUP ---------- */
  let currentColor = "black";
  let currentBrushSize = 3;
  
  // Set initial brush - ORIGINAL WORKING SETTINGS
  ctx.lineWidth = currentBrushSize;
  ctx.lineCap = "round";
  ctx.strokeStyle = currentColor;
  
  // Brush size control
  brushSizeInput.addEventListener("input", (e) => {
    currentBrushSize = parseInt(e.target.value);
    brushSizeValue.textContent = currentBrushSize;
    ctx.lineWidth = currentBrushSize;
  });
  
  // Color buttons
  document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      currentColor = e.target.dataset.color;
      ctx.strokeStyle = currentColor;
      // Update active color
      document.querySelectorAll(".color-btn").forEach(b => 
        b.style.border = b === e.target ? "3px solid gold" : "2px solid #666"
      );
    });
  });

  /* ---------- STATE ---------- */
  let drawing = false;
  let hasDrawn = false;
  let strokes = [];
  let currentStroke = null;
  let round = 1;

  // 20 seconds timer
  let timeLeft = 20;
  let timerId;

  /* ---------- SCORE TRACKING ---------- */
  function updateScores(correctVoter = null) {
    if (correctVoter) {
      scores[correctVoter] += 10;
      const scoreEl = document.querySelector(`[data-player="${correctVoter}"] div:nth-child(2)`);
      if (scoreEl) scoreEl.textContent = scores[correctVoter];
    }
    
    // Highlight current player
    document.querySelectorAll('[data-player]').forEach(el => {
      el.style.background = "rgba(255, 255, 255, 0.1)";
      el.style.border = "1px solid #333";
    });
    const currentPlayerEl = document.querySelector(`[data-player="${players[currentPlayerIndex]}"]`);
    if (currentPlayerEl) {
      currentPlayerEl.style.background = "rgba(100, 108, 255, 0.3)";
      currentPlayerEl.style.border = "1px solid #646cff";
    }
  }

  /* ---------- STROKE COUNTER ---------- */
  function updateStrokeCount() {
    const strokeCount = document.getElementById('strokeCount');
    if (strokeCount) {
      strokeCount.textContent = strokes.length;
    }
  }

  /* ---------- TURN UI ---------- */
  function updateUI() {
    const player = players[currentPlayerIndex];
    turnInfo.textContent = `${player}'s turn`;
    
    document.getElementById("roundInfo").textContent = `Round ${round}`;

    wordInfo.textContent =
      currentPlayerIndex === imposterIndex
        ? "🎭 You are the IMPOSTER!"
        : `📝 Word: ${word}`;
        
    wordInfo.style.color = currentPlayerIndex === imposterIndex ? "#ff6b6b" : "#4ecdc4";
    
    updateScores();
    resetTimer();
  }

  /* ---------- TIMER (20 SECONDS) ---------- */
  function resetTimer() {
    clearInterval(timerId);
    timeLeft = 20;
    updateTimerDisplay();
    
    timerId = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 5) {
        timerEl.style.color = "#ff6b6b";
        timerEl.style.fontWeight = "bold";
      } else {
        timerEl.style.color = "";
        timerEl.style.fontWeight = "";
      }
      
      if (timeLeft === 0) {
        clearInterval(timerId);
        endTurn();
      }
    }, 1000);
  }
  
  function updateTimerDisplay() {
    timerEl.textContent = `⏱️ ${timeLeft}s`;
  }

  /* ---------- DRAWING (ORIGINAL WORKING VERSION) ---------- */
  canvas.addEventListener("mousedown", e => {
    if (hasDrawn) return;

    drawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    currentStroke = {
      player: players[currentPlayerIndex],
      points: [{ x: x, y: y }],
      color: currentColor,
      width: currentBrushSize
    };

    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  canvas.addEventListener("mousemove", e => {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    currentStroke.points.push({ x: x, y: y });
  });

  canvas.addEventListener("mouseup", () => {
    if (!drawing) return;

    drawing = false;
    hasDrawn = true;
    strokes.push(currentStroke);
    currentStroke = null;
    updateStrokeCount();
  });

  /* ---------- TURN CONTROL ---------- */
  function endTurn() {
    hasDrawn = false;
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    
    if (currentPlayerIndex === 0) {
      document.getElementById("vote").disabled = false;
      document.getElementById("vote").style.opacity = "1";
    }
    
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
    updateStrokeCount();
  };

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      stroke.points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
    }
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentBrushSize;
  }

  /* ---------- NEW ROUND ---------- */
  document.getElementById("clear").onclick = () => {
    strokes = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    round++;
    
    const newWord = allWords[Math.floor(Math.random() * allWords.length)];
    const newImposterIndex = Math.floor(Math.random() * players.length);
    
    console.log("NEW ROUND - Word:", newWord, "Imposter:", players[newImposterIndex]);
    
    document.getElementById("vote").disabled = true;
    document.getElementById("vote").style.opacity = "0.5";
    
    currentPlayerIndex = 0;
    hasDrawn = false;
    updateStrokeCount();
    updateUI();
  };

  /* ---------- VOTING ---------- */
  document.getElementById("vote").onclick = () => {
    const modal = document.createElement("div");
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; justify-content: center;
      align-items: center; z-index: 1000;
    `;
    
    modal.innerHTML = `
      <div style="background: #1a1a1a; padding: 30px; border-radius: 10px; text-align: center; border: 2px solid #646cff;">
        <h3 style="margin-top: 0">Who is the imposter?</h3>
        <div style="margin: 20px;">
          ${players.map(player => `
            <button class="vote-option" 
              style="display: block; margin: 10px auto; padding: 12px 24px; width: 200px; 
                     background: #2a2a2a; color: white; border: 1px solid #646cff; border-radius: 5px;"
              data-player="${player}">
              ${player}
            </button>
          `).join('')}
        </div>
        <button id="cancelVote" style="padding: 8px 20px; margin-top: 10px; background: #666; color: white; border: none; border-radius: 5px;">Cancel</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll(".vote-option").forEach(btn => {
      btn.onclick = (e) => {
        const guess = e.target.dataset.player;
        modal.remove();
        
        const isCorrect = players.indexOf(guess) === imposterIndex;
        
        if (isCorrect) {
          alert(`🎉 Correct! ${guess} was the imposter!\nThe word was: ${word}`);
          updateScores(guess);
        } else {
          alert(`😈 Wrong! ${players[imposterIndex]} was the imposter!\nThe word was: ${word}`);
        }
        
        const imposterEl = document.querySelector(`[data-player="${players[imposterIndex]}"]`);
        if (imposterEl) {
          imposterEl.style.background = "#ff4444";
          imposterEl.style.color = "white";
        }
      };
    });
    
    modal.querySelector("#cancelVote").onclick = () => {
      modal.remove();
    };
  };

  /* ---------- KEYBOARD SHORTCUTS ---------- */
  document.addEventListener("keydown", e => {
    if (e.key === "Enter") endTurn();
    if (e.key === "u") document.getElementById("undo").click();
    if (e.key === "c") document.getElementById("clear").click();
    
    if (e.key >= "1" && e.key <= "5") {
      const colors = ["black", "red", "blue", "green", "purple"];
      const colorBtn = document.querySelector(`.color-btn[data-color="${colors[parseInt(e.key)-1]}"]`);
      if (colorBtn) colorBtn.click();
    }
  });

  /* ---------- INITIALIZE ---------- */
  updateUI();
  updateStrokeCount();
  updateScores();
}