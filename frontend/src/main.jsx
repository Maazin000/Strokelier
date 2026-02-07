//import { StrictMode } from 'react'
//import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
//import App from './App.jsx'
import { startGame } from './game.js'


startGame();


//createRoot(document.getElementById('root')).render(
//  <StrictMode>
//    <App />
//  </StrictMode>,
//)

/*const root = document.getElementById('root');

root.innerHTML = `
  <h2 id="turn-info">Player 1's turn</h2>

  <canvas id="gameCanvas" width="800" height="500"></canvas>

  <button id="endTurnBtn">End Turn</button>
`;

// ---- Canvas logic ----
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let canDraw = true;

ctx.strokeStyle = "white";
ctx.lineWidth = 3;
ctx.lineCap = "round";

canvas.addEventListener("mousedown", (e) => {
  if (!canDraw) return;
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  canDraw = false;
});

document.getElementById("endTurnBtn").addEventListener("click", () => {
  canDraw = true;
});
*/