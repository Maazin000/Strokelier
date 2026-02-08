const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: ["http://localhost:5174", "http://localhost:5173"],
  credentials: true
}));

// Simple API routes
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🎮 Strokelier Backend</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          min-height: 100vh;
          margin: 0;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.05);
          padding: 30px;
          border-radius: 15px;
          border: 2px solid #646cff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .status { 
          background: linear-gradient(90deg, #4CAF50, #45a049);
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: bold;
          margin: 20px 0;
          display: inline-block;
        }
        .links { 
          margin: 30px 0; 
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 10px;
        }
        a { 
          color: #4ecdc4; 
          text-decoration: none;
          display: block;
          margin: 15px 0;
          padding: 12px;
          background: rgba(100, 108, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(100, 108, 255, 0.3);
          transition: all 0.3s;
          font-size: 16px;
        }
        a:hover {
          background: rgba(100, 108, 255, 0.2);
          transform: translateX(5px);
          border-color: #646cff;
        }
        code { 
          background: rgba(0,0,0,0.3); 
          padding: 3px 8px; 
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        .badge {
          background: #ff6b6b;
          color: white;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-left: 10px;
        }
        .socket-info {
          background: rgba(78, 205, 196, 0.1);
          border-left: 4px solid #4ecdc4;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .path-info {
          background: rgba(255, 214, 102, 0.1);
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          font-size: 12px;
          margin: 10px 0;
          border-left: 3px solid #ffd166;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="color: #646cff; margin-top: 0;">🎮 Strokelier Backend Server</h1>
        
        <div class="path-info">
          📍 <strong>Project Root:</strong> ${__dirname}<br>
          📁 <strong>Frontend Path:</strong> ${path.join(__dirname, 'frontend')}
        </div>
        
        <div class="status">✅ Server is running on port ${PORT}</div>
        
        <div class="socket-info">
          <strong>Socket.io Status:</strong> Active and ready for multiplayer connections
        </div>
        
        <div class="links">
          <h3 style="color: #4ecdc4; border-bottom: 2px solid #4ecdc4; padding-bottom: 10px;">Quick Links</h3>
          <a href="http://localhost:5174">
            🎯 <strong>Frontend Game (Vite Dev Server)</strong>
          </a>
          <a href="http://localhost:5174/?mode=multiplayer">
            🎮 <strong>Multiplayer Mode</strong> <span class="badge">Recommended</span>
          </a>
          <a href="/health">
            📊 <strong>Health Check</strong> - API Status
          </a>
        </div>
        
        <h3 style="color: #ffd166;">📡 Connection Information</h3>
        <p><strong>Frontend URL:</strong> <code>http://localhost:5174</code></p>
        <p><strong>Backend API:</strong> <code>http://localhost:${PORT}</code></p>
        <p><strong>Socket.io URL:</strong> <code>ws://localhost:${PORT}</code></p>
        
        <h3 style="color: #ffd166;">⚙️ How to Run</h3>
        <ol>
          <li>Keep this backend running in Terminal 1</li>
          <li>Open new Terminal 2 and run: <code>cd ${path.basename(__dirname)}/frontend && npm run dev</code></li>
          <li>Visit <a href="http://localhost:5174/?mode=multiplayer">Multiplayer Game</a></li>
        </ol>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #888;">
          <p>Backend started at: ${new Date().toLocaleTimeString()}</p>
          <p>Server running from: ${__dirname}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    server: 'Strokelier Backend',
    port: PORT,
    projectRoot: __dirname,
    frontendExists: require('fs').existsSync(path.join(__dirname, 'frontend')),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==============================================
// SOCKET.IO SETUP WITH READY SYSTEM SYNCHRONIZATION
// ==============================================

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5174", "http://localhost:5173"],
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('🎯 Player connected:', socket.id);
  
  // Send welcome message
  socket.emit('welcome', { 
    message: 'Connected to Strokelier multiplayer server!',
    id: socket.id,
    serverTime: new Date().toISOString()
  });
  
  // ========== CREATE ROOM ==========
  socket.on('createRoom', (username) => {
    console.log('📢 CREATE ROOM EVENT RECEIVED:', { username, socketId: socket.id });
    
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      players: [{ 
        id: socket.id, 
        username: username,
        isHost: true,
        isReady: true  // Host is automatically ready
      }],
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
    
    rooms.set(roomId, room);
    socket.join(roomId);
    
    console.log('🏠 Room created:', roomId, 'by', username);
    console.log('📤 EMITTING roomCreated to client...');
    
    // EMIT BACK TO CLIENT
    socket.emit('roomCreated', { 
      roomId, 
      username,
      message: `Room ${roomId} created! Share this code with friends.`
    });
    
    console.log('✅ Room created event sent to client');
  });
  
  // ========== JOIN ROOM ==========
  socket.on('joinRoom', ({ roomId, username }) => {
    console.log('📢 JOIN ROOM EVENT RECEIVED:', { roomId, username, socketId: socket.id });
    
    const room = rooms.get(roomId);
    
    if (!room) {
      console.log('❌ Room not found:', roomId);
      socket.emit('error', { 
        type: 'ROOM_NOT_FOUND',
        message: `Room ${roomId} doesn't exist. Check the code and try again.`
      });
      return;
    }
    
    if (room.players.length >= 4) {
      console.log('❌ Room full:', roomId);
      socket.emit('error', { 
        type: 'ROOM_FULL', 
        message: 'Room is full (max 4 players). Create a new room instead.'
      });
      return;
    }
    
    // Check if username already exists in room
    const existingPlayer = room.players.find(p => p.username === username);
    if (existingPlayer) {
      console.log('⚠️ Username already taken in this room:', username);
      socket.emit('error', {
        type: 'USERNAME_TAKEN',
        message: `Username "${username}" is already taken in this room. Please choose a different name.`
      });
      return;
    }
    
    // Add player to room (not ready by default)
    room.players.push({ 
      id: socket.id, 
      username: username,
      isHost: false,
      isReady: false  // Players join as not ready
    });
    
    socket.join(roomId);
    
    console.log('✅ Player joined:', username, 'to room', roomId);
    
    // Get player usernames for the list
    const playerUsernames = room.players.map(p => p.username);
    
    // Notify the joining player
    socket.emit('joinedRoom', {
      roomId,
      players: playerUsernames,
      message: `Welcome to room ${roomId}! Waiting for game to start...`
    });
    
    // Notify all players in the room
    io.to(roomId).emit('playerJoined', {
      username,
      players: playerUsernames,
      totalPlayers: room.players.length
    });
    
    console.log(`👤 ${username} joined room ${roomId} (${room.players.length}/4 players)`);
    
    // Send current ready status to all players
    updateRoomReadyStatus(roomId);
  });
  
  // ========== PLAYER READY STATUS ==========
  socket.on('playerReady', ({ roomId, username, isReady }) => {
    console.log('📢 PLAYER READY EVENT:', { roomId, username, isReady });
    
    const room = rooms.get(roomId);
    if (!room) {
      console.log('❌ Room not found for ready update:', roomId);
      return;
    }
    
    // Update player's ready status
    const player = room.players.find(p => p.username === username);
    if (player) {
      player.isReady = isReady;
      console.log(`✅ ${username} is now ${isReady ? 'READY' : 'NOT READY'}`);
      
      // Broadcast to all players in the room
      updateRoomReadyStatus(roomId);
    } else {
      console.log('❌ Player not found in room:', username);
    }
  });
  
  // ========== HELPER FUNCTION: UPDATE ROOM READY STATUS ==========
  // In server.js, replace the updateRoomReadyStatus function with this:

function updateRoomReadyStatus(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  // Prepare player data for broadcast
  const playerData = room.players.map(p => ({
    username: p.username,
    isHost: p.isHost,
    isReady: p.isReady
  }));
  
  const readyCount = room.players.filter(p => p.isReady).length;
  const totalPlayers = room.players.length;
  
  console.log(`📢 Broadcasting to room ${roomId}:`, 
    `${readyCount}/${totalPlayers} ready`, playerData);
  
  // CRITICAL: Broadcast to ALL players in the room
  io.to(roomId).emit('playerReadyUpdate', {
    allPlayers: playerData,
    readyCount: readyCount,
    totalPlayers: totalPlayers,
    timestamp: new Date().toISOString()
  });
}
  
  // ========== HANDLE DISCONNECTION ==========
  socket.on('disconnect', () => {
    console.log('👋 Player disconnected:', socket.id);
    
    // Remove player from any rooms
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const username = room.players[playerIndex].username;
        const wasHost = room.players[playerIndex].isHost;
        
        room.players.splice(playerIndex, 1);
        
        console.log(`🗑️ Removed ${username} from room ${roomId}`);
        
        // If host left and there are remaining players, promote next player to host
        if (wasHost && room.players.length > 0) {
          room.players[0].isHost = true;
          room.players[0].isReady = true; // New host is auto-ready
          console.log(`👑 Promoted ${room.players[0].username} to host in room ${roomId}`);
        }
        
        // Notify remaining players
        io.to(roomId).emit('playerLeft', {
          username,
          remainingPlayers: room.players.map(p => p.username)
        });
        
        // Update ready status after player left
        updateRoomReadyStatus(roomId);
        
        // Clean up empty rooms
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`🧹 Deleted empty room ${roomId}`);
        }
      }
    });
  });
  
  // ========== HANDLE DRAWING DATA (FOR FUTURE) ==========
  socket.on('drawingData', (data) => {
    const { roomId, stroke } = data;
    if (rooms.has(roomId)) {
      // Broadcast to all other players in the room
      socket.to(roomId).emit('playerDrawing', {
        playerId: socket.id,
        stroke: stroke
      });
    }
  });
});

// ==============================================
// START SERVER
// ==============================================

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  const projectName = path.basename(__dirname);
  
  console.log('\n' + '='.repeat(60));
  console.log('          🎮  STROKELIER MULTIPLAYER SERVER');
  console.log('='.repeat(60));
  console.log(`📍  Project Root:    ${__dirname}`);
  console.log(`📁  Frontend Folder: ${path.join(__dirname, 'frontend')}`);
  console.log('');
  console.log(`✅  Backend API:    http://localhost:${PORT}`);
  console.log(`📊  Health Check:   http://localhost:${PORT}/health`);
  console.log(`⚡  Socket.io:      ws://localhost:${PORT}`);
  console.log('');
  console.log(`🎯  Frontend Game:  http://localhost:5174`);
  console.log(`🎮  Multiplayer:    http://localhost:5174/?mode=multiplayer`);
  console.log('');
  console.log('📋  INSTRUCTIONS:');
  console.log('    1. Keep this terminal open (backend server)');
  console.log(`    2. Open NEW terminal and run:`);
  console.log(`       cd "${__dirname}"`);
  console.log(`       cd frontend && npm run dev`);
  console.log('    3. Open browser to: http://localhost:5174/?mode=multiplayer');
  console.log('='.repeat(60) + '\n');
  
  console.log('🚀 READY SYSTEM FEATURES:');
  console.log('   • Host is automatically marked as ready');
  console.log('   • Players can toggle ready status');
  console.log('   • Ready status synchronized across all clients');
  console.log('   • Host promotion when host disconnects');
  console.log('   • Username validation to prevent duplicates');
  console.log('='.repeat(60) + '\n');
});