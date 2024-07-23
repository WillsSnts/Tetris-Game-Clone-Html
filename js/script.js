
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 10; // Tamanho de cada quadradinho (10x10 px)
const tetrominoSequence = []; // Array de peças

// Todas as peças que serão geradas
const tetrominos = {
    'I': [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    'J': [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'L': [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    'O': [
        [1, 1],
        [1, 1]
    ],
    'S': [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    'Z': [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    'T': [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
    ]
};

// Cores das peças
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

// Tamanho do campo de jogo: 50 linhas (altura) x 30 colunas (largura)
const playfield = [];

for (let row = -2; row < 50; row++) {
    playfield[row] = [];
    for (let col = 0; col < 30; col++) {
        playfield[row][col] = 0;
    }
}

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;
let paused = false;
let score = 0;
let level = 1;
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const menuButton = document.getElementById('menuButton');
const menu = document.getElementById('menu');
const gameCanvas = document.getElementById('gameCanvas');
const controls = document.getElementById('controls');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');

function getNextTetromino() 
{
    if (tetrominoSequence.length === 0) 
    {
        const tetrominos = ['I', 'J', 'L', 'O', 'S', 'Z', 'T'];
        while (tetrominos.length) 
        {
            const rand = Math.floor(Math.random() * tetrominos.length);
            const name = tetrominos.splice(rand, 1)[0];
            tetrominoSequence.push(name);
        }
    }
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    const row = name === 'I' ? -1 : -2;

    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}

function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
    return result;
}

function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }
    return true;
}

function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    for (let row = playfield.length - 1; row >= 0;) {
        if (playfield[row].every(cell => !!cell)) {
            score += 10;
            scoreElement.innerText = score;

            if (score % 100 === 0) {
                level += 1;
                levelElement.innerText = level;
            }

            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }
        } else {
            row--;
        }
    }
    tetromino = getNextTetromino();
}

function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    alert('Game Over');
}

function resetGame() {
    // Reset playfield
    for (let row = -2; row < 50; row++) {
        for (let col = 0; col < 30; col++) {
            playfield[row][col] = 0;
        }
    }

    // Reset variables
    count = 0;
    tetrominoSequence.length = 0; // Clear the sequence array
    tetromino = getNextTetromino();
    gameOver = false;
    paused = false;
    score = 0;
    level = 1;
    scoreElement.innerText = score;
    levelElement.innerText = level;
}

function loop() {
    rAF = requestAnimationFrame(loop);
    if (paused) {
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 50; row++) {
        for (let col = 0; col < 30; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    if (tetromino) {
        if (++count > (36 - level)) {
            tetromino.row++;
            count = 0;

            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}

document.addEventListener('keydown', function (e) {
    if (gameOver) return;

    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37
            ? tetromino.col - 1
            : tetromino.col + 1;

        if (isValidMove(tetromino.matrix, tetromino.row, col)) {
            tetromino.col = col;
        }
    }

    if (e.which === 38) {
        const matrix = rotate(tetromino.matrix);
        if (isValidMove(matrix, tetromino.row, tetromino.col)) {
            tetromino.matrix = matrix;
        }
    }

    if (e.which === 40) {
        const row = tetromino.row + 1;
        if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
            tetromino.row = row - 1;
            placeTetromino();
            return;
        }
        tetromino.row = row;
    }
});

startButton.addEventListener('click', () => {
    resetGame(); // Reset the game state before starting a new game
    menu.classList.add('hidden');
    gameCanvas.classList.remove('hidden');
    controls.classList.remove('hidden');
    rAF = requestAnimationFrame(loop);
});

pauseButton.addEventListener('click', () => {
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
});

menuButton.addEventListener('click', () => {
    cancelAnimationFrame(rAF);
    gameOver = true;
    paused = false;
    score = 0;
    level = 1;
    scoreElement.innerText = score;
    levelElement.innerText = level;
    menu.classList.remove('hidden');
    gameCanvas.classList.add('hidden');
    controls.classList.add('hidden');
});