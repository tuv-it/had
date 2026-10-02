const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

// Základní proměnné
let score = 0;
let lastRenderTime = 0; 
let gameOverFlag = false;
let isGameRunning = false;
let gameSpeed = 155; // Rychlost hada
let pulseTimer = 0;

// Mřížka
const gridSize = 27;
let tileCountX, tileCountY;
let snake = [];
let food = { x: 0, y: 0 };
let dx = gridSize;
let dy = 0;
let nextDirection = { x: gridSize, y: 0 };



// TUV SUD logo
const logoImg = new Image();
logoImg.src = 'logo.svg'; 

//Inicializace -> načtení okna
window.onload = initGame;
restartBtn.addEventListener('click', initGame);

function initGame() {
    resultScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverFlag = false;

    // Dynamický canvas
    const size = Math.min(window.innerWidth * 0.82, 300);
    canvas.width = Math.floor(size / gridSize) * gridSize;
    canvas.height = canvas.width; 
    
    tileCountX = canvas.width / gridSize;
    tileCountY = canvas.height / gridSize;

    score = 0;
    document.getElementById('currentScore').innerText = score;
    
    // Počáteční pozice hada
    snake = [{ x: Math.floor(tileCountX / 2) * gridSize, y: Math.floor(tileCountY / 2) * gridSize }];
    generateFood();
    
    dx = gridSize;
    dy = 0;
    nextDirection = { x: gridSize, y: 0 };
    lastRenderTime = 0;
    isGameRunning = false; // Had čeká na první input směru pohybu

    window.requestAnimationFrame(mainGameLoop);
}

// Hlavní smyčka
function mainGameLoop(currentTime) {
    if (gameOverFlag) return;
    window.requestAnimationFrame(mainGameLoop);

    const secondsSinceLastRender = currentTime - lastRenderTime;
    if (secondsSinceLastRender < gameSpeed) return; 
    
    lastRenderTime = currentTime;
    updateGame();
    draw();
}

// Generace potravy pro hada na random pozici
function generateFood() {
    food.x = Math.floor(Math.random() * tileCountX) * gridSize;
    food.y = Math.floor(Math.random() * tileCountY) * gridSize;
    
    for (let part of snake) {
        if (part.x === food.x && part.y === food.y) generateFood();
    }
}

// Update hry
function updateGame() {
    pulseTimer += 0.2; // Pulzování jídla
    
    // Hra překresluje scénu, pokud nedošlo k počátečnímu inputu
    if (!isGameRunning) {
        draw(); 
        return; 
    }

    // Směr pohybu
    dx = nextDirection.x;
    dy = nextDirection.y;
    
    // Korekce pozice hlavy hada
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Kontrola kolizí
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return gameOver();
    }
    
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) return gameOver();
    }

    // vykreslení hlavy na nové pozici
    snake.unshift(head);

    // Kontrola sežrání jídla
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('currentScore').innerText = score;
        generateFood();
    } else {
        snake.pop(); 
    }
}

// Vykreslení scény
function draw() {
    // Pozadí plátna
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vykreslení mřížky
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // Vykreslení loga na pozadí
    if (logoImg.complete && logoImg.naturalWidth !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen'; 
        ctx.globalAlpha = 0.15;
        const logoSize = canvas.width * 0.8; 
        ctx.drawImage(logoImg, (canvas.width - logoSize)/2, (canvas.height - logoSize)/2, logoSize, logoSize);
        ctx.restore();
    }

    // Vykreslení jídla
    if (logoImg.complete && logoImg.naturalWidth !== 0) {
        ctx.save();
        
        // Výpočet pulzování
        const pulseSize = Math.sin(pulseTimer) * 1.5;
        
        // Přizpůsobení velikosti jídla
        const carSize = (gridSize - 2) + pulseSize;
        const carOffsetX = food.x + (gridSize - carSize) / 2;
        const carOffsetY = food.y + (gridSize - carSize) / 2;
        
        ctx.drawImage(logoImg, carOffsetX, carOffsetY, carSize, carSize);
        ctx.restore();
    } else {
        // V případě špatného načtení obrázku jídla
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(food.x + 1, food.y + 1, gridSize - 2, gridSize - 2);
    }

    // Vykreslení hada
    snake.forEach((part, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() : getComputedStyle(document.documentElement).getPropertyValue('--snake-body').trim();
        ctx.beginPath();
        ctx.roundRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, isHead ? 6 : 4);
        ctx.fill();

        if (isHead) {
            ctx.fillStyle = '#ffffff'; //barva očí
            let eX1, eY1, eX2, eY2;
            const eyeRadius = gridSize * 0.1;
            
            if (dx > 0) { eX1 = part.x + (gridSize*0.7); eY1 = part.y + (gridSize*0.25); eX2 = part.x + (gridSize*0.7); eY2 = part.y + (gridSize*0.75); }
            else if (dx < 0) { eX1 = part.x + (gridSize*0.3); eY1 = part.y + (gridSize*0.25); eX2 = part.x + (gridSize*0.3); eY2 = part.y + (gridSize*0.75); }
            else if (dy > 0) { eX1 = part.x + (gridSize*0.25); eY1 = part.y + (gridSize*0.7); eX2 = part.x + (gridSize*0.75); eY2 = part.y + (gridSize*0.7); }
            else if (dy < 0) { eX1 = part.x + (gridSize*0.25); eY1 = part.y + (gridSize*0.3); eX2 = part.x + (gridSize*0.75); eY2 = part.y + (gridSize*0.3); }
            
            ctx.beginPath(); ctx.arc(eX1, eY1, eyeRadius, 0, 2 * Math.PI); ctx.fill();
            ctx.beginPath(); ctx.arc(eX2, eY2, eyeRadius, 0, 2 * Math.PI); ctx.fill();
        }
    });
}

// Game Over
function gameOver() {
    gameOverFlag = true;
    gameScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    document.getElementById('finalScore').innerText = score;
}

// Změna směru
function changeDirection(dir) {
    // Povolení běhu hry po prvním inputu
    if (!isGameRunning) {
        isGameRunning = true;
        
        if (dir === 'UP')    nextDirection = { x: 0, y: -gridSize };
        if (dir === 'DOWN')  nextDirection = { x: 0, y: gridSize };
        if (dir === 'LEFT')  nextDirection = { x: -gridSize, y: 0 };
        if (dir === 'RIGHT') nextDirection = { x: gridSize, y: 0 };
        
        return;
    }

    if (dir === 'UP' && dy === 0)    nextDirection = { x: 0, y: -gridSize };
    if (dir === 'DOWN' && dy === 0)  nextDirection = { x: 0, y: gridSize };
    if (dir === 'LEFT' && dx === 0)  nextDirection = { x: -gridSize, y: 0 };
    if (dir === 'RIGHT' && dx === 0) nextDirection = { x: gridSize, y: 0 };
}

// --- OVLÁDÁNÍ ---
// Tlačítka D-PAD (Mobil)
document.getElementById('btnUp').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('UP'); }, { passive: false });
document.getElementById('btnDown').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('DOWN'); }, { passive: false });
document.getElementById('btnLeft').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('LEFT'); }, { passive: false });
document.getElementById('btnRight').addEventListener('touchstart', (e) => { e.preventDefault(); changeDirection('RIGHT'); }, { passive: false });

// Klikání myší (PC test)
document.getElementById('btnUp').addEventListener('click', () => changeDirection('UP'));
document.getElementById('btnDown').addEventListener('click', () => changeDirection('DOWN'));
document.getElementById('btnLeft').addEventListener('click', () => changeDirection('LEFT'));
document.getElementById('btnRight').addEventListener('click', () => changeDirection('RIGHT'));

// Klávesnice (PC)
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); 
    if (e.key === 'ArrowUp') changeDirection('UP');
    if (e.key === 'ArrowDown') changeDirection('DOWN');
    if (e.key === 'ArrowLeft') changeDirection('LEFT');
    if (e.key === 'ArrowRight') changeDirection('RIGHT');
});

// Ovládání pomocí Swipování
let tX = 0, tY = 0;
window.addEventListener('touchstart', (e) => {
    if(e.target.classList.contains('dpad-btn')) return;
    tX = e.changedTouches.screenX; tY = e.changedTouches.screenY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    if(e.target.classList.contains('dpad-btn')) return;
    let xDiff = e.changedTouches.screenX - tX, yDiff = e.changedTouches.screenY - tY;
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (Math.abs(xDiff) > 40) { if (xDiff > 0) changeDirection('RIGHT'); else changeDirection('LEFT'); }
    } else {
        if (Math.abs(yDiff) > 40) { if (yDiff > 0) changeDirection('DOWN'); else changeDirection('UP'); }
    }
}, { passive: true });
