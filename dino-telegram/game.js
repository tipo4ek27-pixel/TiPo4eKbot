// ==================== Telegram WebApp ====================
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Поддержка тёмной темы
  if (tg.colorScheme === 'dark') {
    document.body.classList.add('dark');
  }
  tg.onEvent('themeChanged', () => {
    document.body.classList.toggle('dark', tg.colorScheme === 'dark');
  });
}

// ==================== Canvas setup ====================
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = 800;
const GAME_HEIGHT = 300;
const GROUND_Y = 250;

let scale = 1;

function resize() {
  const container = document.getElementById('game-container');
  const maxW = container.clientWidth;
  const maxH = container.clientHeight;

  scale = Math.min(maxW / GAME_WIDTH, maxH / GAME_HEIGHT);
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  canvas.style.width = `${GAME_WIDTH * scale}px`;
  canvas.style.height = `${GAME_HEIGHT * scale}px`;
}

window.addEventListener('resize', resize);
resize();

// ==================== Assets (свои текстуры) ====================
// Просто положи PNG-файлы в папку assets/
// Если файла нет — игра нарисует простые фигуры

const assets = {
  dino: null,
  dinoJump: null,
  cactus: null,
  ground: null,
  cloud: null,
};

const ASSET_PATHS = {
  dino: 'assets/dino.png',
  dinoJump: 'assets/dino-jump.png',
  cactus: 'assets/cactus.png',
  ground: 'assets/ground.png',
  cloud: 'assets/cloud.png',
};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // если файла нет — null
    img.src = src;
  });
}

async function loadAssets() {
  const entries = Object.entries(ASSET_PATHS);
  const results = await Promise.all(entries.map(([, path]) => loadImage(path)));
  entries.forEach(([key], i) => {
    assets[key] = results[i];
  });
}

// ==================== Game state ====================
let gameState = 'start'; // start | playing | gameover
let score = 0;
let highScore = parseInt(localStorage.getItem('dinoHighScore') || '0', 10);
let speed = 6;
let frame = 0;
let lastTime = 0;

// Player
const player = {
  x: 80,
  y: GROUND_Y,
  width: 44,
  height: 47,
  vy: 0,
  gravity: 0.7,
  jumpForce: -13,
  grounded: true,
  ducking: false,
};

// Obstacles
let obstacles = [];
let nextObstacleFrame = 0;

// Ground & clouds
let groundOffset = 0;
let clouds = [];

// ==================== UI elements ====================
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

highScoreEl.textContent = `Рекорд: ${highScore}`;

// ==================== Input ====================
function jump() {
  if (gameState === 'start') {
    startGame();
    return;
  }
  if (gameState === 'playing' && player.grounded) {
    player.vy = player.jumpForce;
    player.grounded = false;
  }
  if (gameState === 'gameover') {
    restart();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    jump();
  }
});

canvas.addEventListener('pointerdown', jump);
startScreen.addEventListener('pointerdown', jump);
restartBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  restart();
});

// ==================== Game logic ====================
function startGame() {
  gameState = 'playing';
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  score = 0;
  speed = 6;
  frame = 0;
  obstacles = [];
  nextObstacleFrame = 60;
  player.y = GROUND_Y;
  player.vy = 0;
  player.grounded = true;
  groundOffset = 0;
  clouds = [];
  spawnCloud();
  scoreEl.textContent = '0';
}

function gameOver() {
  gameState = 'gameover';
  finalScoreEl.textContent = Math.floor(score);
  gameOverScreen.classList.remove('hidden');

  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem('dinoHighScore', highScore);
    highScoreEl.textContent = `Рекорд: ${highScore}`;
  }

  // Можно отправить данные в Telegram (опционально)
  if (tg) {
    // tg.sendData(JSON.stringify({ score: Math.floor(score) }));
  }
}

function restart() {
  startGame();
}

function spawnObstacle() {
  const types = [
    { w: 25, h: 50 },   // маленький кактус
    { w: 35, h: 55 },   // средний
    { w: 50, h: 50 },   // широкий
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  obstacles.push({
    x: GAME_WIDTH + 20,
    y: GROUND_Y - type.h + 5,
    width: type.w,
    height: type.h,
  });
}

function spawnCloud() {
  clouds.push({
    x: GAME_WIDTH + Math.random() * 100,
    y: 40 + Math.random() * 80,
    speed: 0.5 + Math.random() * 0.8,
    width: 46,
    height: 14,
  });
}

function update(dt) {
  if (gameState !== 'playing') return;

  frame++;
  score += speed * 0.1;
  scoreEl.textContent = Math.floor(score);

  // Увеличение скорости
  if (frame % 400 === 0) {
    speed = Math.min(speed + 0.5, 15);
  }

  // Игрок
  player.vy += player.gravity;
  player.y += player.vy;

  if (player.y >= GROUND_Y) {
    player.y = GROUND_Y;
    player.vy = 0;
    player.grounded = true;
  }

  // Земля
  groundOffset = (groundOffset + speed) % 48;

  // Облака
  clouds.forEach((c) => {
    c.x -= c.speed;
  });
  clouds = clouds.filter((c) => c.x + c.width > 0);
  if (clouds.length < 3 && Math.random() < 0.01) {
    spawnCloud();
  }

  // Препятствия
  if (frame >= nextObstacleFrame) {
    spawnObstacle();
    nextObstacleFrame = frame + 70 + Math.random() * 90;
  }

  obstacles.forEach((o) => {
    o.x -= speed;
  });
  obstacles = obstacles.filter((o) => o.x + o.width > 0);

  // Коллизии
  const pBox = {
    x: player.x + 8,
    y: player.y - player.height + 8,
    w: player.width - 16,
    h: player.height - 12,
  };

  for (const o of obstacles) {
    if (
      pBox.x < o.x + o.width &&
      pBox.x + pBox.w > o.x &&
      pBox.y < o.y + o.height &&
      pBox.y + pBox.h > o.y
    ) {
      gameOver();
      break;
    }
  }
}

// ==================== Drawing ====================
function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPlayer() {
  const img = player.grounded ? assets.dino : (assets.dinoJump || assets.dino);
  const drawY = player.y - player.height;

  if (img) {
    ctx.drawImage(img, player.x, drawY, player.width, player.height);
  } else {
    // Заглушка — простой динозавр
    ctx.fillStyle = '#535353';
    // тело
    ctx.fillRect(player.x + 10, drawY + 15, 30, 25);
    // голова
    ctx.fillRect(player.x + 28, drawY, 18, 18);
    // глаз
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(player.x + 38, drawY + 5, 4, 4);
    // ноги
    ctx.fillStyle = '#535353';
    if (player.grounded && Math.floor(frame / 6) % 2 === 0) {
      ctx.fillRect(player.x + 12, drawY + 38, 8, 12);
      ctx.fillRect(player.x + 28, drawY + 38, 8, 8);
    } else {
      ctx.fillRect(player.x + 12, drawY + 38, 8, 8);
      ctx.fillRect(player.x + 28, drawY + 38, 8, 12);
    }
  }
}

function drawObstacle(o) {
  if (assets.cactus) {
    ctx.drawImage(assets.cactus, o.x, o.y, o.width, o.height);
  } else {
    // Заглушка — кактус
    ctx.fillStyle = '#535353';
    ctx.fillRect(o.x + o.width * 0.3, o.y, o.width * 0.4, o.height);
    ctx.fillRect(o.x, o.y + o.height * 0.3, o.width * 0.3, o.height * 0.25);
    ctx.fillRect(o.x + o.width * 0.7, o.y + o.height * 0.2, o.width * 0.3, o.height * 0.3);
  }
}

function drawGround() {
  const y = GROUND_Y + 5;
  if (assets.ground) {
    const imgW = assets.ground.width;
    let x = -groundOffset;
    while (x < GAME_WIDTH) {
      ctx.drawImage(assets.ground, x, y, imgW, 24);
      x += imgW;
    }
  } else {
    // Простая линия земли
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GAME_WIDTH, y);
    ctx.stroke();

    // Точки на земле
    ctx.fillStyle = '#535353';
    for (let i = 0; i < GAME_WIDTH / 24 + 2; i++) {
      const gx = ((i * 24) - groundOffset) % (GAME_WIDTH + 48);
      ctx.fillRect(gx, y + 4, 3, 3);
      ctx.fillRect(gx + 10, y + 8, 2, 2);
    }
  }
}

function drawCloud(c) {
  if (assets.cloud) {
    ctx.drawImage(assets.cloud, c.x, c.y, c.width, c.height);
  } else {
    ctx.fillStyle = '#dadada';
    ctx.beginPath();
    ctx.ellipse(c.x + 15, c.y + 8, 18, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 30, c.y + 6, 14, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 8, c.y + 6, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw() {
  // Фон
  const isDark = document.body.classList.contains('dark');
  ctx.fillStyle = isDark ? '#212121' : '#f7f7f7';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // Облака
  clouds.forEach(drawCloud);

  // Земля
  drawGround();

  // Препятствия
  obstacles.forEach(drawObstacle);

  // Игрок
  drawPlayer();
}

// ==================== Main loop ====================
function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 16.67, 3); // нормализация
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

// ==================== Start ====================
loadAssets().then(() => {
  requestAnimationFrame(loop);
});
