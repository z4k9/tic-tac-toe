// Constants
const HUMAN_PLAYER = 'x';
const AI_PLAYER = 'o';
const WINNING_COMBOS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];
const MAX_DEPTH = 9; // Maximum depth to search (entire board)
const EVAL_WEIGHTS = [1, 10, 100]; // Weights for different game states

// Variables
let currentPlayer;
let gameInProgress = false;

// DOM Elements
const board = document.getElementById('board');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const cells = [];

// Event listeners
restartBtn.addEventListener('click', startGame);

// Initialize the game
startGame();

// Functions

// Start a new game
function startGame() {
    clearBoard();
    currentPlayer = HUMAN_PLAYER;
    status.innerText = "Player X's turn";
    gameInProgress = true;
    createBoard();
    if (currentPlayer === AI_PLAYER) {
        makeAIMove();
    }
}

// Clear the game board
function clearBoard() {
    board.innerHTML = '';
    cells.length = 0;
}

// Create the game board
function createBoard() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleClick);
        board.appendChild(cell);
        cells.push('');
    }
}

// Handle player's move
function handleClick(e) {
    if (!gameInProgress) return;

    const cell = e.target;
    const index = cell.getAttribute('data-index');
    if (cells[index] === '' && currentPlayer === HUMAN_PLAYER) {
        placeMark(cell, HUMAN_PLAYER);
        cells[index] = HUMAN_PLAYER;
        if (checkWin(HUMAN_PLAYER)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            currentPlayer = AI_PLAYER;
            status.innerText = "Player O's turn";
            makeAIMove();
        }
    }
}

// Place a mark on the board
function placeMark(cell, player) {
    cell.classList.add(player);
    cell.innerText = player;
}

// Check if a player has won
function checkWin(player) {
    return WINNING_COMBOS.some(combination => {
        return combination.every(index => {
            return cells[index] === player;
        });
    });
}

// Check if it's a draw
function isDraw() {
    return cells.every(cell => {
        return cell === HUMAN_PLAYER || cell === AI_PLAYER;
    });
}

// End the game
function endGame(draw) {
    if (draw) {
        status.innerText = "It's a draw!";
    } else {
        status.innerText = `Player ${currentPlayer} wins!`;
    }
    gameInProgress = false;
}

// Make AI move
function makeAIMove() {
    setTimeout(() => {
        const bestMove = minimaxAlphaBeta(cells, 0, -Infinity, Infinity, true);
        placeMark(document.querySelector(`[data-index="${bestMove.index}"]`), AI_PLAYER);
        cells[bestMove.index] = AI_PLAYER;
        if (checkWin(AI_PLAYER)) {
            endGame(false);
        } else if (isDraw()) {
            endGame(true);
        } else {
            currentPlayer = HUMAN_PLAYER;
            status.innerText = "Player X's turn";
        }
    }, 500);
}

// Minimax algorithm with alpha-beta pruning
function minimaxAlphaBeta(board, depth, alpha, beta, isMaximizing) {
    if (depth === MAX_DEPTH || checkWin(HUMAN_PLAYER) || checkWin(AI_PLAYER) || isDraw()) {
        return { score: evaluateBoard(board) };
    }

    if (isMaximizing) {
        let bestMove = { score: -Infinity };
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = AI_PLAYER;
                let moveScore = minimaxAlphaBeta(board, depth + 1, alpha, beta, false).score;
                board[i] = '';
                if (moveScore > bestMove.score) {
                    bestMove.score = moveScore;
                    bestMove.index = i;
                }
                alpha = Math.max(alpha, bestMove.score);
                if (beta <= alpha) break;
            }
        }
        return bestMove;
    } else {
        let bestMove = { score: Infinity };
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = HUMAN_PLAYER;
                let moveScore = minimaxAlphaBeta(board, depth + 1, alpha, beta, true).score;
                board[i] = '';
                if (moveScore < bestMove.score) {
                    bestMove.score = moveScore;
                    bestMove.index = i;
                }
                beta = Math.min(beta, bestMove.score);
                if (beta <= alpha) break;
            }
        }
        return bestMove;
    }
}

// Evaluate the board position
function evaluateBoard(board) {
    let score = 0;
    for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] === AI_PLAYER && board[b] === AI_PLAYER && board[c] === AI_PLAYER) {
            score += EVAL_WEIGHTS[2]; // AI wins
        } else if (board[a] === HUMAN_PLAYER && board[b] === HUMAN_PLAYER && board[c] === HUMAN_PLAYER) {
            score -= EVAL_WEIGHTS[2]; // Human wins
        } else {
            if (board[a] === AI_PLAYER) score += EVAL_WEIGHTS[1]; // AI has two in a row
            else if (board[a] === HUMAN_PLAYER) score -= EVAL_WEIGHTS[1]; // Human has two in a row

            if (board[b] === AI_PLAYER) score += EVAL_WEIGHTS[1]; // AI has two in a row
            else if (board[b] === HUMAN_PLAYER) score -= EVAL_WEIGHTS[1]; // Human has two in a row

            if (board[c] === AI_PLAYER) score += EVAL_WEIGHTS[1]; // AI has two in a row
            else if (board[c] === HUMAN_PLAYER) score -= EVAL_WEIGHTS[1]; // Human has two in a row
        }
    }
    return score;
}
