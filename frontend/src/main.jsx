import './index.css'
import './App.css'

// Check URL for mode
const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get('mode') || 'single';

// Add mode switcher UI
const switcher = document.createElement('div');
switcher.innerHTML = `
  <div style="
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    background: rgba(0,0,0,0.95);
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    border: 2px solid #646cff;
    box-shadow: 0 4px 20px rgba(100, 108, 255, 0.3);
    min-width: 300px;
    backdrop-filter: blur(10px);
  ">
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${mode === 'multiplayer' ? '#4CAF50' : '#FF9800'};
          animation: ${mode === 'multiplayer' ? 'pulse 1.5s infinite' : 'none'};
        "></div>
        <div>
          <strong>Mode:</strong> ${mode === 'multiplayer' ? '🎮 MULTIPLAYER' : '👤 SINGLE PLAYER'}
          <br>
          <small style="color: ${mode === 'multiplayer' ? '#4ecdc4' : '#aaa'}; font-size: 11px;">
            ${mode === 'multiplayer' ? 'Connect with friends' : 'Practice alone'}
          </small>
        </div>
      </div>
      <button onclick="switchGameMode()" style="
        padding: 8px 16px;
        background: ${mode === 'multiplayer' ? '#FF9800' : '#646cff'};
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: bold;
        transition: all 0.3s;
        white-space: nowrap;
        min-width: 120px;
      ">
        ${mode === 'multiplayer' ? '← Switch to Single' : 'Switch to Multiplayer →'}
      </button>
    </div>
    ${mode === 'multiplayer' ? `
      <div id="connectionStatus" style="
        margin-top: 10px;
        padding: 8px;
        background: rgba(76, 175, 80, 0.1);
        border-radius: 5px;
        border: 1px solid rgba(76, 175, 80, 0.3);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #4CAF50;"></div>
        <span>Checking backend connection...</span>
      </div>
    ` : ''}
  </div>
`;

// Add keyframes for pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style);

document.body.appendChild(switcher);

// Update connection status
function updateConnectionStatus(status, message) {
  const statusEl = document.getElementById('connectionStatus');
  if (!statusEl) return;
  
  const colors = {
    connecting: { bg: '#FF9800', text: '#FF9800' },
    connected: { bg: '#4CAF50', text: '#4CAF50' },
    error: { bg: '#f44336', text: '#f44336' }
  };
  
  statusEl.innerHTML = `
    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${colors[status].bg};"></div>
    <span>${message}</span>
  `;
}

// Switch mode function
window.switchGameMode = function() {
  const newMode = mode === 'multiplayer' ? 'single' : 'multiplayer';
  const url = new URL(window.location);
  url.searchParams.set('mode', newMode);
  window.location.href = url.toString();
};

// Load the appropriate game based on mode
if (mode === 'multiplayer') {
  console.log('🎮 Loading multiplayer game...');
  
  // First check if backend is running
  updateConnectionStatus('connecting', 'Checking backend server...');
  
  fetch('http://localhost:3000/health')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    })
    .then(data => {
      console.log('✅ Backend server is running:', data);
      updateConnectionStatus('connected', `Connected to backend (Port ${data.port})`);
      
      // Add small delay to show connection status
      setTimeout(() => {
        loadMultiplayer();
      }, 500);
    })
    .catch(error => {
      console.warn('⚠️ Backend not found:', error);
      updateConnectionStatus('error', 'Backend server not running');
      
      // Show user-friendly error
      const userConfirmed = confirm(
        'Multiplayer server is not running.\n\n' +
        'To play multiplayer:\n' +
        '1. Open a new terminal\n' +
        '2. Navigate to: C:\\Users\\maazi\\Desktop\\Strokelier\n' +
        '3. Run: node server.js\n\n' +
        'Start single-player mode instead?'
      );
      
      if (userConfirmed) {
        loadSinglePlayer();
        // Update switcher to show single player
        document.querySelector('[onclick="switchGameMode()"]').textContent = 'Switch to Multiplayer →';
      } else {
        // Keep trying or show instructions
        document.body.innerHTML += `
          <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.95);
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #646cff;
            color: white;
            text-align: center;
            z-index: 10001;
            max-width: 500px;
          ">
            <h3 style="color: #ff6b6b; margin-top: 0;">🚨 Backend Server Required</h3>
            <p>To play multiplayer, you need to start the backend server:</p>
            <div style="
              background: #1a1a1a;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              font-family: monospace;
              text-align: left;
            ">
              <div>1. Open <strong>Command Prompt</strong> or <strong>Terminal</strong></div>
              <div>2. Type: <code>cd C:\\Users\\maazi\\Desktop\\Strokelier</code></div>
              <div>3. Type: <code>node server.js</code></div>
            </div>
            <p>Then refresh this page.</p>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
              <button onclick="location.reload()" style="padding: 10px 20px; background: #646cff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                🔄 Refresh
              </button>
              <button onclick="switchGameMode()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                👤 Single Player
              </button>
            </div>
          </div>
        `;
      }
    });
} else {
  console.log('👤 Loading single-player game...');
  loadSinglePlayer();
}

// Game loader functions
function loadSinglePlayer() {
  import('./game.js')
    .then(module => {
      console.log('✅ Single-player game loaded');
      if (module && module.startGame) {
        module.startGame();
      } else {
        throw new Error('startGame function not found in game.js');
      }
    })
    .catch(error => {
      console.error('Failed to load single-player game:', error);
      document.getElementById('root').innerHTML = `
        <div style="color: white; padding: 50px; text-align: center; background: #1a1a1a; border-radius: 10px; margin: 50px;">
          <h2 style="color: #ff6b6b;">❌ Error loading game</h2>
          <p>${error.message}</p>
          <button onclick="location.reload()" style="padding: 10px 20px; background: #646cff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
            Retry
          </button>
        </div>
      `;
    });
}

function loadMultiplayer() {
  import('./multiplayer.js')
    .then(module => {
      console.log('✅ Multiplayer game loaded');
      if (module && module.startMultiplayerGame) {
        module.startMultiplayerGame();
      } else {
        throw new Error('startMultiplayerGame function not found in multiplayer.js');
      }
    })
    .catch(error => {
      console.error('Failed to load multiplayer game:', error);
      document.getElementById('root').innerHTML = `
        <div style="color: white; padding: 50px; text-align: center; background: #1a1a1a; border-radius: 10px; margin: 50px;">
          <h2 style="color: #ff6b6b;">🎮 Multiplayer Not Available</h2>
          <p>${error.message}</p>
          <button onclick="switchGameMode()" style="padding: 10px 20px; background: #646cff; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
            Switch to Single Player
          </button>
        </div>
      `;
    });
}

// Quick navigation help in console
console.log(`
╔════════════════════════════════════════╗
║         🎮 STROKELIER CONTROLS         ║
╠════════════════════════════════════════╣
║ • Single Player: http://localhost:5174 ║
║ • Multiplayer:   http://localhost:5174/?mode=multiplayer ║
║ • Backend API:   http://localhost:3000 ║
║ • Health Check:  http://localhost:3000/health ║
║ • Press F12 for developer console      ║
╚════════════════════════════════════════╝
`);