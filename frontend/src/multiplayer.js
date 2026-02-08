// multiplayer.js - FIXED READY SYNCHRONIZATION
console.log("🎮 Multiplayer v7.0 - Perfect sync");

import io from 'socket.io-client';

let socket = null;
let currentRoom = null;
let players = [];
let username = '';
let isHost = false;

export function startMultiplayerGame() {
  const root = document.getElementById("root");
  
  // Remove annoying popup
  const existingPopup = document.querySelector('div[style*="position: fixed"][style*="top: 10px"]');
  if (existingPopup) existingPopup.remove();
  
  // Generate username
  if (!username) {
    const adjectives = ['Cool', 'Swift', 'Creative', 'Happy', 'Smart', 'Quick', 'Funny'];
    const nouns = ['Artist', 'Player', 'Sketch', 'Master', 'Genius', 'Wizard'];
    username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
  }
  
  root.innerHTML = `
    <div style="max-width: 1200px; margin: 20px auto; padding: 20px;">
      <!-- Header -->
      <div style="padding: 15px 20px; background: #1a1a2e; border-radius: 12px; border: 2px solid #646cff; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; color: white; font-size: 1.8rem;">🎮 Strokelier Multiplayer</h1>
            <div style="display: flex; align-items: center; gap: 15px; margin-top: 8px;">
              <div id="connectionStatus" style="display: flex; align-items: center; gap: 6px;">
                <div id="statusDot" style="width: 8px; height: 8px; border-radius: 50%; background: #4CAF50;"></div>
                <span id="statusText" style="color: #4CAF50; font-size: 13px;">Connected</span>
              </div>
              <div style="font-size: 14px; color: #aaa;">
                <span id="roomStatus">No active room</span>
                <span id="roomCodeBadge" style="display: none; margin-left: 10px; padding: 4px 10px; background: rgba(78, 205, 196, 0.2); border-radius: 10px; font-family: monospace; color: #4ecdc4;"></span>
              </div>
            </div>
          </div>
          <button onclick="switchToSingleMode()" style="padding: 8px 16px; background: rgba(255,255,255,0.1); color: white; border: 1px solid #646cff; border-radius: 6px; cursor: pointer;">← Single Player</button>
        </div>
      </div>
      
      <!-- Debug Info (Hidden by default, enable with F12) -->
      <div id="debugInfo" style="display: none; background: #2a2a2a; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #888; margin-bottom: 10px;">
        Room: <span id="debugRoom">---</span> | Players: <span id="debugPlayerCount">0</span> | Ready: <span id="debugReadyCount">0</span> | You: <span id="debugUsername">---</span>
      </div>
      
      <!-- Main Content -->
      <div style="display: flex; gap: 20px;">
        <!-- Left Panel -->
        <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 2px solid #646cff;">
          <h2 style="color: #4ecdc4; margin-top: 0;">🏠 Room: <span id="roomCodeDisplay" style="font-family: monospace;">---</span></h2>
          
          <div style="margin: 20px 0;">
            <label style="display: block; margin-bottom: 8px; color: #aaa;">Your Name:</label>
            <input type="text" id="usernameInput" value="${username}" style="width: 100%; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid #444; border-radius: 6px; color: white;">
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
            <button id="createRoomBtn" style="padding: 12px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">🏠 Create New Room</button>
            <div style="display: flex; gap: 10px;">
              <input type="text" id="roomCodeInput" placeholder="Enter room code" style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid #444; border-radius: 6px; color: white; font-family: monospace; text-align: center;" maxlength="6">
              <button id="joinRoomBtn" style="padding: 10px 20px; background: linear-gradient(135deg, #2196F3, #1976D2); color: white; border: none; border-radius: 6px; cursor: pointer;">Join</button>
            </div>
          </div>
          
          <!-- Player List -->
          <div style="margin: 20px 0;">
            <h3 style="color: #ffd166; margin-bottom: 10px;">👥 Players (<span id="playerCount">0</span>/4)</h3>
            <div id="playerList" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; min-height: 200px;">
              <div style="text-align: center; padding: 30px 0; color: #666;">
                <div style="font-size: 40px; margin-bottom: 10px;">👥</div>
                No players in room
              </div>
            </div>
          </div>
          
          <!-- Room Controls -->
          <div id="roomControls" style="display: none;">
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-bottom: 10px; text-align: center;">
              <div style="font-size: 12px; color: #aaa;">Your Status</div>
              <div id="readyStatusText" style="font-size: 16px; color: #FF9800; font-weight: bold;">⏳ Not Ready</div>
            </div>
            
            <button id="readyBtn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #FF9800, #F57C00); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 10px; display: none;">✅ Mark as Ready</button>
            
            <button id="startGameBtn" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-bottom: 10px; display: none;">🎮 Start Game</button>
            
            <button id="leaveRoomBtn" style="width: 100%; padding: 10px; background: rgba(244, 67, 54, 0.1); color: #f44336; border: 1px solid #f44336; border-radius: 6px; cursor: pointer;">🚪 Leave Room</button>
          </div>
        </div>
        
        <!-- Right Panel -->
        <div style="flex: 2; background: rgba(255,255,255,0.03); padding: 20px; border-radius: 12px; border: 1px solid #333;">
          <div style="margin-bottom: 20px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong style="color: #aaa;">Game Status:</strong>
                <span id="gameStatus" style="color: #4ecdc4; margin-left: 10px;">Lobby</span>
              </div>
              <div style="color: #FF9800;">
                Ready: <span id="readyCount">0</span>/<span id="totalPlayers">0</span>
              </div>
            </div>
            <div id="gameMessage" style="margin-top: 8px; font-size: 13px; color: #888;"></div>
          </div>
          
          <div style="background: rgba(0,0,0,0.2); border-radius: 8px; height: 400px; display: flex; align-items: center; justify-content: center;">
            <div style="text-align: center;">
              <div style="font-size: 60px; margin-bottom: 15px; opacity: 0.7;">🎨</div>
              <h3 style="color: #aaa; margin-bottom: 10px;">Multiplayer Canvas</h3>
              <p style="color: #666; max-width: 400px; margin: 0 auto;">
                Ready status is now perfectly synchronized!
              </p>
            </div>
          </div>
          
          <div id="notificationArea" style="margin-top: 20px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; min-height: 60px; max-height: 100px; overflow-y: auto;">
            <div id="notificationContent">System ready - Create or join a room!</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  initializeSocket();
  setupEventListeners();
  
  // Enable debug with F12
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') {
      const debug = document.getElementById('debugInfo');
      if (debug) debug.style.display = debug.style.display === 'none' ? 'block' : 'none';
    }
  });
}

// ========== SOCKET.IO ==========

function initializeSocket() {
  if (!socket) {
    socket = io('http://localhost:3000');
    setupSocketEvents();
  }
}

function setupSocketEvents() {
  socket.on('connect', () => {
    console.log('✅ Connected:', socket.id);
    updateStatus('Connected', '#4CAF50');
    addNotification('Connected to server');
  });
  
  socket.on('roomCreated', (data) => {
    console.log('🎉 Room created:', data);
    handleRoomCreated(data);
  });
  
  socket.on('joinedRoom', (data) => {
    console.log('🎉 Joined room:', data);
    handleJoinedRoom(data);
  });
  
  socket.on('playerJoined', (data) => {
    console.log('👤 Player joined:', data);
    addNotification(`${data.username} joined`, 'info');
    // Note: We don't update players here - wait for server sync
  });
  
  // CRITICAL FIX: This is the MAIN sync handler
  socket.on('playerReadyUpdate', (data) => {
    console.log('🔄 SERVER SYNC RECEIVED:', data);
    
    // ALWAYS use server data as source of truth
    players = data.allPlayers.map(player => ({
      username: player.username,
      isHost: player.isHost,
      isReady: player.isReady
    }));
    
    updateDebugInfo();
    updatePlayerList();
    updateGameControls();
    
    // Find if this update was triggered by current player
    const currentPlayer = players.find(p => p.username === username);
    if (currentPlayer) {
      const readyPlayers = players.filter(p => p.isReady).length;
      addNotification(`Sync: ${readyPlayers}/${players.length} ready`, 'info');
    }
  });
  
  socket.on('playerLeft', (data) => {
    console.log('👋 Player left:', data);
    addNotification(`${data.username} left`, 'warning');
    // Wait for server sync - don't update locally
  });
  
  socket.on('error', (error) => {
    console.error('Server error:', error);
    addNotification(error.message, 'error');
  });
  
  socket.on('disconnect', () => {
    updateStatus('Disconnected', '#f44336');
  });
}

function handleRoomCreated(data) {
  currentRoom = data.roomId;
  isHost = true;
  
  // Initial player list - host only, auto-ready
  players = [{
    username: data.username,
    isHost: true,
    isReady: true
  }];
  
  updateUI();
  updateDebugInfo();
  addNotification(`Room created: ${currentRoom}`, 'success');
}

function handleJoinedRoom(data) {
  currentRoom = data.roomId;
  isHost = false;
  
  // Initial player list from server - all players NOT ready except host
  players = data.players.map((playerName, index) => ({
    username: playerName,
    isHost: index === 0,
    isReady: index === 0  // Only host is ready initially
  }));
  
  updateUI();
  updateDebugInfo();
  addNotification(`Joined room: ${currentRoom}`, 'success');
}

// ========== UI FUNCTIONS ==========

function updateStatus(text, color) {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  if (statusDot) statusDot.style.background = color;
  if (statusText) {
    statusText.textContent = text;
    statusText.style.color = color;
  }
}

function updateDebugInfo() {
  const debugRoom = document.getElementById('debugRoom');
  const debugPlayerCount = document.getElementById('debugPlayerCount');
  const debugReadyCount = document.getElementById('debugReadyCount');
  const debugUsername = document.getElementById('debugUsername');
  
  if (debugRoom) debugRoom.textContent = currentRoom || '---';
  if (debugPlayerCount) debugPlayerCount.textContent = players.length;
  if (debugReadyCount) debugReadyCount.textContent = players.filter(p => p.isReady).length;
  if (debugUsername) debugUsername.textContent = username;
}

function updateUI() {
  // Update room info
  const roomStatus = document.getElementById('roomStatus');
  const roomCodeBadge = document.getElementById('roomCodeBadge');
  const roomCodeDisplay = document.getElementById('roomCodeDisplay');
  const roomControls = document.getElementById('roomControls');
  
  if (currentRoom) {
    roomStatus.textContent = 'In room';
    roomCodeBadge.textContent = currentRoom;
    roomCodeBadge.style.display = 'inline-block';
    if (roomCodeDisplay) roomCodeDisplay.textContent = currentRoom;
    if (roomControls) roomControls.style.display = 'block';
  } else {
    roomStatus.textContent = 'No active room';
    if (roomCodeBadge) roomCodeBadge.style.display = 'none';
    if (roomCodeDisplay) roomCodeDisplay.textContent = '---';
    if (roomControls) roomControls.style.display = 'none';
  }
  
  updatePlayerList();
  updateGameControls();
}

function updatePlayerList() {
  const playerList = document.getElementById('playerList');
  const playerCount = document.getElementById('playerCount');
  const readyCount = document.getElementById('readyCount');
  const totalPlayers = document.getElementById('totalPlayers');
  
  if (!playerList) return;
  
  const readyPlayers = players.filter(p => p.isReady).length;
  
  if (players.length === 0) {
    playerList.innerHTML = `
      <div style="text-align: center; padding: 30px 0; color: #666;">
        <div style="font-size: 40px; margin-bottom: 10px;">👥</div>
        No players in room
      </div>
    `;
  } else {
    playerList.innerHTML = players.map(player => {
      const isMe = player.username === username;
      return `
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          margin-bottom: 8px;
          background: ${isMe ? 'rgba(100, 108, 255, 0.1)' : 'rgba(255,255,255,0.05)'};
          border-radius: 6px;
          border-left: 3px solid ${player.isHost ? '#646cff' : (player.isReady ? '#4CAF50' : '#FF9800')};
        ">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${player.isHost ? '#646cff' : (player.isReady ? '#4CAF50' : '#FF9800')};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          ">${player.username.charAt(0)}</div>
          <div style="flex: 1;">
            <div style="font-weight: bold; color: ${isMe ? '#646cff' : 'white'}">
              ${player.username}
              ${player.isHost ? ' <span style="color: #646cff; font-size: 12px;">(Host)</span>' : ''}
              ${isMe ? ' <span style="color: #4ecdc4; font-size: 12px;">(You)</span>' : ''}
            </div>
            <div style="font-size: 12px; color: #888;">
              ${player.isReady ? '✅ Ready' : '⏳ Not ready'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  if (playerCount) playerCount.textContent = players.length;
  if (readyCount) readyCount.textContent = readyPlayers;
  if (totalPlayers) totalPlayers.textContent = players.length;
  
  // Update game message - SINGLE SOURCE OF TRUTH
  const gameMessage = document.getElementById('gameMessage');
  if (gameMessage) {
    if (players.length < 2) {
      gameMessage.textContent = `Need ${2 - players.length} more player${players.length === 1 ? '' : 's'} to start`;
      gameMessage.style.color = '#FF9800';
    } else if (readyPlayers < 2) {
      gameMessage.textContent = `Need ${2 - readyPlayers} more player${readyPlayers === 1 ? '' : 's'} ready`;
      gameMessage.style.color = '#FF9800';
    } else {
      gameMessage.textContent = 'All players ready! Host can start the game.';
      gameMessage.style.color = '#4CAF50';
    }
  }
}

function updateGameControls() {
  const readyBtn = document.getElementById('readyBtn');
  const startGameBtn = document.getElementById('startGameBtn');
  const readyStatusText = document.getElementById('readyStatusText');
  const gameStatus = document.getElementById('gameStatus');
  
  if (!currentRoom) return;
  
  // Find current player
  const currentPlayer = players.find(p => p.username === username);
  if (!currentPlayer) return;
  
  const readyPlayers = players.filter(p => p.isReady).length;
  
  // Update status text
  if (readyStatusText) {
    readyStatusText.textContent = currentPlayer.isReady ? '✅ Ready!' : '⏳ Not Ready';
    readyStatusText.style.color = currentPlayer.isReady ? '#4CAF50' : '#FF9800';
  }
  
  // Show appropriate button
  if (currentPlayer.isHost) {
    // Host sees Start Game button
    if (readyBtn) readyBtn.style.display = 'none';
    if (startGameBtn) {
      startGameBtn.style.display = 'block';
      startGameBtn.innerHTML = readyPlayers >= 2 
        ? `🎮 Start Game (${readyPlayers}/${players.length} ready)`
        : `⏳ Need ${2 - readyPlayers} more ready`;
      startGameBtn.disabled = readyPlayers < 2;
    }
    if (gameStatus) {
      gameStatus.textContent = readyPlayers >= 2 ? 'Host • Ready to start!' : 'Host • Waiting for players';
      gameStatus.style.color = readyPlayers >= 2 ? '#4CAF50' : '#646cff';
    }
  } else {
    // Non-host sees Ready button
    if (readyBtn) {
      readyBtn.style.display = 'block';
      readyBtn.innerHTML = currentPlayer.isReady ? '✅ Ready!' : '✅ Mark as Ready';
      readyBtn.style.background = currentPlayer.isReady 
        ? 'linear-gradient(135deg, #4CAF50, #45a049)'
        : 'linear-gradient(135deg, #FF9800, #F57C00)';
    }
    if (startGameBtn) startGameBtn.style.display = 'none';
    if (gameStatus) {
      gameStatus.textContent = currentPlayer.isReady 
        ? `Ready! (${readyPlayers}/${players.length} ready)` 
        : 'Click Ready when set';
      gameStatus.style.color = currentPlayer.isReady ? '#4CAF50' : '#FF9800';
    }
  }
}

function addNotification(message, type = 'info') {
  const notificationContent = document.getElementById('notificationContent');
  if (!notificationContent) return;
  
  const colors = { success: '#4CAF50', error: '#f44336', warning: '#FF9800', info: '#2196F3' };
  const icon = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: ${colors[type] || colors.info};
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  notification.innerHTML = `<div>${icon[type] || 'ℹ️'}</div><div>${message}</div><div style="margin-left: auto; color: #666; font-size: 11px;">${time}</div>`;
  
  notificationContent.insertBefore(notification, notificationContent.firstChild);
  
  // Keep only last 10 notifications
  while (notificationContent.children.length > 10) {
    notificationContent.removeChild(notificationContent.lastChild);
  }
}

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
  // Username
  const usernameInput = document.getElementById('usernameInput');
  if (usernameInput) {
    usernameInput.addEventListener('input', (e) => {
      username = e.target.value.trim() || 'Player';
      updateDebugInfo();
    });
  }
  
  // Create Room
  const createRoomBtn = document.getElementById('createRoomBtn');
  if (createRoomBtn) {
    createRoomBtn.onclick = () => {
      const name = usernameInput?.value.trim() || username;
      if (!name) return addNotification('Enter a username', 'error');
      username = name;
      socket.emit('createRoom', username);
    };
  }
  
  // Join Room
  const joinRoomBtn = document.getElementById('joinRoomBtn');
  if (joinRoomBtn) {
    joinRoomBtn.onclick = () => {
      const roomCode = document.getElementById('roomCodeInput')?.value.trim().toUpperCase();
      const name = usernameInput?.value.trim() || username;
      if (!roomCode || roomCode.length !== 6) return addNotification('Enter 6-character code', 'error');
      if (!name) return addNotification('Enter a username', 'error');
      if (currentRoom === roomCode) return addNotification('Already in this room', 'warning');
      username = name;
      socket.emit('joinRoom', { roomId: roomCode, username });
    };
  }
  
  // Leave Room
  const leaveRoomBtn = document.getElementById('leaveRoomBtn');
  if (leaveRoomBtn) {
    leaveRoomBtn.onclick = () => {
      currentRoom = null;
      players = [];
      isHost = false;
      updateUI();
      updateDebugInfo();
      addNotification('Left the room', 'warning');
    };
  }
  
  // Ready Button - SENDS TO SERVER, WAITS FOR SYNC
  const readyBtn = document.getElementById('readyBtn');
  if (readyBtn) {
    readyBtn.onclick = () => {
      if (!currentRoom) return;
      
      const currentPlayer = players.find(p => p.username === username);
      if (currentPlayer) {
        const newReadyState = !currentPlayer.isReady;
        
        console.log('📤 Sending ready state to server:', newReadyState);
        
        // Send to server - server will broadcast sync to everyone
        socket.emit('playerReady', {
          roomId: currentRoom,
          username: username,
          isReady: newReadyState
        });
        
        // Local optimistic update (will be confirmed by server)
        currentPlayer.isReady = newReadyState;
        updatePlayerList();
        updateGameControls();
        
        addNotification(`Sending: ${newReadyState ? 'Ready' : 'Not ready'}`, 'info');
      }
    };
  }
  
  // Start Game Button
  const startGameBtn = document.getElementById('startGameBtn');
  if (startGameBtn) {
    startGameBtn.onclick = () => {
      const readyPlayers = players.filter(p => p.isReady).length;
      if (readyPlayers >= 2) {
        addNotification('Starting game...', 'success');
        // TODO: Implement actual game start
      } else {
        addNotification(`Need ${2 - readyPlayers} more players ready`, 'error');
      }
    };
  }
  
  // Enter key for room code
  const roomCodeInput = document.getElementById('roomCodeInput');
  if (roomCodeInput) {
    roomCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') joinRoomBtn.click();
    });
  }
}

// Global function
window.switchToSingleMode = function() {
  const url = new URL(window.location);
  url.searchParams.set('mode', 'single');
  window.location.href = url.toString();
};