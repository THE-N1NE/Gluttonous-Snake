// 游戏常量
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const INITIAL_SPEED = 150; // 初始速度（毫秒）

// 游戏状态
let snake = [];
let food = {};
let direction = '';
let nextDirection = '';
let score = 0;
let gameLoopId = null;
let gameSpeed = INITIAL_SPEED;
let isGameOver = false;
let isPaused = false;

// DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const resetButton = document.getElementById('reset-btn');

// 初始化游戏
function initGame() {
    // 设置画布大小
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // 重置游戏状态
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    gameSpeed = INITIAL_SPEED;
    isGameOver = false;
    isPaused = false;
    
    // 生成初始食物
    generateFood();
    
    // 更新分数显示
    updateScore();
    
    // 渲染初始状态
    drawGame();
    
    // 更新按钮状态
    updateButtonStates();
}

// 生成食物
function generateFood() {
    let newFood;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    food = newFood;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#27ae60' : '#2ecc71'; // 蛇头和蛇身颜色不同
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1, // 留一点间隙
            GRID_SIZE - 1
        );
    });
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(
        food.x * GRID_SIZE,
        food.y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
    );
    
    // 如果游戏结束，显示游戏结束信息
    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
        ctx.font = '18px Arial';
        ctx.fillText(`最终得分: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    }
    
    // 如果暂停，显示暂停信息
    if (isPaused && !isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
}

// 移动蛇
function moveSnake() {
    if (isPaused || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 获取蛇头位置
    const head = { ...snake[0] };
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 检查碰撞（墙壁）
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE ||
        head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
        gameOver();
        return;
    }
    
    // 检查碰撞（自己的身体）
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }
    
    // 将新头部添加到蛇身
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        updateScore();
        
        // 生成新食物
        generateFood();
        
        // 随着分数增加，游戏速度加快
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            // 重新开始游戏循环以应用新速度
            clearInterval(gameLoopId);
            gameLoopId = setInterval(gameLoop, gameSpeed);
        }
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
    
    // 绘制游戏
    drawGame();
}

// 游戏循环
function gameLoop() {
    moveSnake();
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoopId);
    gameLoopId = null;
    drawGame();
    updateButtonStates();
}

// 更新分数显示
function updateScore() {
    scoreElement.textContent = score;
}

// 更新按钮状态
function updateButtonStates() {
    startButton.disabled = gameLoopId !== null && !isPaused && !isGameOver;
    pauseButton.disabled = gameLoopId === null || isGameOver;
    resetButton.disabled = gameLoopId === null && !isGameOver;
}

// 事件监听器
function setupEventListeners() {
    // 按钮事件
    startButton.addEventListener('click', () => {
        if (isGameOver || snake.length === 0) {
            // 重新开始游戏
            initGame();
        }
        
        if (!isPaused && !isGameOver) {
            // 开始新游戏
            gameLoopId = setInterval(gameLoop, gameSpeed);
        } else if (isPaused && !isGameOver) {
            // 继续游戏
            isPaused = false;
            gameLoopId = setInterval(gameLoop, gameSpeed);
        }
        updateButtonStates();
        drawGame();
    });
    
    pauseButton.addEventListener('click', () => {
        if (!isPaused && !isGameOver) {
            isPaused = true;
            clearInterval(gameLoopId);
            gameLoopId = null;
            updateButtonStates();
            drawGame();
        }
    });
    
    resetButton.addEventListener('click', () => {
        clearInterval(gameLoopId);
        gameLoopId = null;
        initGame();
    });
    
    // 键盘控制
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        
        // 游戏控制键
        if (key === ' ' || key === 'Spacebar') { // 空格键暂停/继续
            event.preventDefault();
            if (isGameOver) return;
            
            if (gameLoopId) {
                pauseButton.click();
            } else {
                startButton.click();
            }
        }
        
        if (key === 'r' || key === 'R') { // R键重置游戏
            if (isGameOver) {
                resetButton.click();
            }
        }
        
        // 移动控制
        // 防止蛇180度转向（例如：向右移动时不能直接向左）
        if (key === 'ArrowUp' || key === 'w' || key === 'W') {
            if (direction !== 'down') {
                nextDirection = 'up';
            }
        } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
            if (direction !== 'up') {
                nextDirection = 'down';
            }
        } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            if (direction !== 'right') {
                nextDirection = 'left';
            }
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            if (direction !== 'left') {
                nextDirection = 'right';
            }
        }
    });
    
    // 移动端触摸控制（简单实现）
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        if (!gameLoopId || isGameOver || isPaused) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // 确定滑动方向（水平或垂直）
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        e.preventDefault();
    }, { passive: false });
}

// 初始化
function init() {
    initGame();
    setupEventListeners();
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', init);