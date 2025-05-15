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
const moveSound = new Audio('assets/move.mp3');

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
        if (direction && makeMove(grid, direction)) {
            displayBoard(grid);
        }
    });
}

function makeMove(grid, direction, makeSound = true) {
    let rowWithNull = -1;
    let colWithNull = -1;

    // Find the null tile
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === null) {
                rowWithNull = r;
                colWithNull = c;
                break;
            }
        }
        if (rowWithNull !== -1) break;
    }

    // Determine move target based on direction
    let targetR = rowWithNull;
    let targetC = colWithNull;

    switch (direction) {
        case 'up':
            targetR = rowWithNull + 1;
            break;
        case 'down':
            targetR = rowWithNull - 1;
            break;
        case 'left':
            targetC = colWithNull + 1;
            break;
        case 'right':
            targetC = colWithNull - 1;
            break;
        default:
            return false; // invalid direction
    }

    // Check bounds
    if (targetR >= 0 && targetR < grid.length && targetC >= 0 && targetC < grid[0].length) {
        // Swap tiles
        grid[rowWithNull][colWithNull] = grid[targetR][targetC];
        grid[targetR][targetC] = null;

        // Play move sound
        if (makeSound) playSound(moveSound);

        return true; // move was successful
    }

    return false; // move was invalid
}

function playSound(sound) {
    const s = sound.cloneNode(); // Clone to allow overlapping
    s.volume = 0.3; // Lower volume to avoid loudness when overlapping
    s.play();
}

function tryClickMove(grid, clickedR, clickedC) {
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
        for (let i = 0; i < distance; i++) {
            makeMove(grid, dir);
        }
        return true;
    } else if (clickedC === nullC && clickedR !== nullR) {
        const dir = clickedR < nullR ? 'down' : 'up';
        const distance = Math.abs(clickedR - nullR);
        for (let i = 0; i < distance; i++) {
            makeMove(grid, dir);
        }
        return true;
    }

    return false;
}

async function scrambleGrid(movesCount = 100) {
    let lastMove = null;

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
        makeMoveNTimes(grid, move.direction, move.distance);
        displayBoard(grid);
        lastMove = move;
    }
}

function makeMoveNTimes(grid, direction, distance) {
    for (let i = 0; i < distance; i++) {
        makeMove(grid, direction, false);
    }
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
