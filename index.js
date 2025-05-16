let grid4x4 = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, null],
];

let grid5x5 = [
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, null],
];

let grid6x4 = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
    [13, 14, 15, 16],
    [17, 18, 19, 20],
    [21, 22, 23, null],
];

let moveMade = false;
let grid = grid4x4;
let moves = [];
let nullPosition = null;
let startTime = null;
let timerInterval = null;
const timeDisplay = document.getElementById('time');
const movesPerSecondDiv = document.getElementById('moves-per-second');
const moveSound = new Audio('assets/move.mp3');
const movesCounterDiv = document.getElementById('moves-counter');

const gridSelect = document.getElementById('grid-select');
gridSelect.addEventListener('change', (event) => {
    switch (event.target.value) {
        case '5x5':
            grid = grid5x5;
            break;
        case '6x4':
            grid = grid6x4;
            break;
        default:
            grid = grid4x4;
    }

    const board = document.getElementById('board');
    board.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${grid.length}, 1fr)`;

    displayBoard();
});

document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    board.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${grid.length}, 1fr)`;

    displayBoard();
    startMovingLogic();
});

document.getElementById('start').addEventListener('click', async () => {
    await scrambleGrid();
});

function displayBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tileDiv = document.createElement('div');
            tileDiv.innerHTML = grid[r][c] !== null ? `${grid[r][c]}` : '';
            tileDiv.classList.add('tile');
            tileDiv.addEventListener('click', () => {
                if (tryClickMove(grid, r, c)) {
                    displayBoard();
                    checkSolved();
                }
            });
            board.appendChild(tileDiv);
        }
    }
}

function startMovingLogic() {
    document.addEventListener('keydown', (event) => {
        let direction = null;
        switch (event.key) {
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
        }
        if (direction && makeMove(grid, direction, 1)) {
            startTimer();
            displayBoard(grid);
            checkSolved();
        }
    });
}

function makeMove(grid, direction, distance, makeSound = true) {
    // Use cached nullPosition if available, otherwise find and cache it
    let row, col;
    if (nullPosition && grid[nullPosition.row][nullPosition.col] === null) {
        row = nullPosition.row;
        col = nullPosition.col;
    } else {
        outer: for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < grid[r].length; c++) {
                if (grid[r][c] === null) {
                    row = r;
                    col = c;
                    nullPosition = { row, col };
                    break outer;
                }
            }
        }
        if (row === undefined || col === undefined) return false; // Null tile not found
    }

    // Direction vectors
    const directions = {
        up: [1, 0, 'U'],
        down: [-1, 0, 'D'],
        left: [0, 1, 'L'],
        right: [0, -1, 'R'],
    };

    if (!directions.hasOwnProperty(direction)) return false;

    const [dRow, dCol, moveLetter] = directions[direction];

    // Perform move step by step
    for (let i = 0; i < distance; i++) {
        const newRow = row + dRow;
        const newCol = col + dCol;

        // Check bounds
        if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
            return false; // Stop if move goes out of bounds
        }

        // Swap with target tile
        grid[row][col] = grid[newRow][newCol];
        grid[newRow][newCol] = null;

        // Update null position
        row = newRow;
        col = newCol;
    }

    // Update cached nullPosition
    nullPosition = { row, col };

    // Sound and move recording
    if (makeSound) playSound(moveSound);
    moves.push(`${moveLetter}${distance}`);
    movesCounterDiv.innerText = `${moves.length} moves`;

    return true;
}

function startTimer() {
    if (startTime !== null) return;

    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (elapsed < 600000) {
            // under 10 minutes
            const centiseconds = Math.floor((elapsed % 1000) / 10);
            timeDisplay.innerText =
                (minutes > 0 ? `${minutes}:` : '') +
                `${seconds}`.padStart(minutes > 0 ? 2 : 1, '0') +
                `.${centiseconds.toString().padStart(2, '0')}`;
        } else {
            timeDisplay.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        const movesPerSecond = moves.length / (elapsed / 1000);
        movesPerSecondDiv.innerText = `${movesPerSecond.toFixed(2)} m/s`;
    }, 30);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
}

function playSound(sound) {
    const s = sound.cloneNode(); // Clone to allow overlapping
    s.volume = 0.3; // Lower volume to avoid loudness when overlapping
    s.play();
}

function checkSolved() {
    const goal = getGoalGrid(grid);
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] !== goal[r][c]) return;
        }
    }

    stopTimer();
    alert('🎉 Puzzle solved!');
}

function getGoalGrid(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const goal = [];
    let count = 1;
    for (let r = 0; r < rows; r++) {
        goal[r] = [];
        for (let c = 0; c < cols; c++) {
            goal[r][c] = count++;
        }
    }
    goal[rows - 1][cols - 1] = null;
    return goal;
}

function tryClickMove(grid, clickedR, clickedC) {
    if (!startTime) {
        startTimer();
    }

    let nullR, nullC;
    outer: for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === null) {
                nullR = r;
                nullC = c;
                break outer;
            }
        }
    }

    if (clickedR === nullR && clickedC !== nullC) {
        const dir = clickedC < nullC ? 'right' : 'left';
        const distance = Math.abs(clickedC - nullC);
        makeMove(grid, dir, distance);
        return true;
    } else if (clickedC === nullC && clickedR !== nullR) {
        const dir = clickedR < nullR ? 'down' : 'up';
        const distance = Math.abs(clickedR - nullR);
        makeMove(grid, dir, distance);
        return true;
    }

    return false;
}

async function scrambleGrid() {
    let lastMove = null;

    const numRows = grid.length;
    const numCols = grid[0].length;
    const numOfTiles = numRows * numCols - 1;
    const movesCount = 10 * numOfTiles * numOfTiles;

    for (let i = 0; i < movesCount; i++) {
        const legalMoves = getLegalMoves(grid).filter((move) => {
            if (!lastMove) return true;
            return !(
                (lastMove.direction === 'up' && move.direction === 'down') ||
                (lastMove.direction === 'down' && move.direction === 'up') ||
                (lastMove.direction === 'left' && move.direction === 'right') ||
                (lastMove.direction === 'right' && move.direction === 'left')
            );
        });

        if (legalMoves.length === 0) break;

        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        makeMove(grid, move.direction, move.distance, false);
        displayBoard(grid);
        lastMove = move;
    }

    moves = [];
    movesCounterDiv.innerText = `${moves.length} moves`;
    timeDisplay.innerText = '0.00';
    movesPerSecondDiv.innerText = '0.00 m/s';
}

function getLegalMoves(grid) {
    const moves = [];
    let row = -1,
        col = -1;

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === null) {
                row = r;
                col = c;
                break;
            }
        }
        if (row !== -1) break;
    }

    for (let d = 1; row + d < grid.length; d++) moves.push({ direction: 'up', distance: d });
    for (let d = 1; row - d >= 0; d++) moves.push({ direction: 'down', distance: d });
    for (let d = 1; col + d < grid[0].length; d++) moves.push({ direction: 'left', distance: d });
    for (let d = 1; col - d >= 0; d++) moves.push({ direction: 'right', distance: d });

    return moves;
}
