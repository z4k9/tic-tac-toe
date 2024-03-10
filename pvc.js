const HUMAN_PLAYER = 'x';
const AI_PLAYER = 'o';
const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];
const SCORES = {
    [AI_PLAYER]: 10,
    [HUMAN_PLAYER]: -10,
    'tie': 0
};

let currentPlayer, gameInProgress = false;
const board = document.getElementById('board');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const cells = [];

restartBtn.addEventListener('click', startGame);
startGame();

function startGame() {
    clearBoard();
    currentPlayer = HUMAN_PLAYER;
    status.innerText = "Player X's turn";
    gameInProgress = true;
    createBoard();
    if (currentPlayer === AI_PLAYER)
        makeAIMove();
}

function clearBoard() {
    board.innerHTML = '';
    cells.length = 0;
}

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

function handleClick(e) {
    if (!gameInProgress) return;
    const cell = e.target;
    const index = cell.getAttribute('data-index');
    if (cells[index] === '' && currentPlayer === HUMAN_PLAYER) {
        placeMark(cell, HUMAN_PLAYER);
        cells[index] = HUMAN_PLAYER;
        if (checkWin(HUMAN_PLAYER)) endGame(HUMAN_PLAYER);
        else if (isDraw()) endGame('tie');
        else {
            currentPlayer = AI_PLAYER;
            status.innerText = "Player O's turn";
            makeAIMove();
        }
    }
}

function placeMark(cell, player) {
    cell.classList.add(player);
    cell.innerText = player;
}

function checkWin(player) {
    return WINNING_COMBOS.some(combination => combination.every(index => cells[index] === player));
}

function isDraw() {
    return cells.every(cell => cell !== '');
}

function endGame(winner) {
    if (winner === 'tie') status.innerText = "It's a tie!";
    else status.innerText = `Player ${winner} wins!`;
    gameInProgress = false;
}

function makeAIMove() {
    setTimeout(() => {
        const bestMove = getBestMove(cells, AI_PLAYER);
        const cell = document.querySelector(`[data-index="${bestMove.index}"]`);
        placeMark(cell, AI_PLAYER);
        cells[bestMove.index] = AI_PLAYER;
        if (checkWin(AI_PLAYER)) endGame(AI_PLAYER);
        else if (isDraw()) endGame('tie');
        else {
            currentPlayer = HUMAN_PLAYER;
            status.innerText = "Player X's turn";
        }
    }, 500);
}

function getBestMove(board, player) {
    let bestScore = -Infinity;
    let bestMove;
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = player;
            let score = minimax(board, player, 0, false, -Infinity, Infinity);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return { index: bestMove };
}

function minimax(board, player, depth, isMaximizing, alpha, beta) {
    let result = checkWinner();
    if (result !== null) {
        return SCORES[result];
    }

    if (depth >= 5) {
        return evaluate(board, player);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = player;
                let eval = minimax(board, player, depth + 1, false, alpha, beta);
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                board[i] = '';
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        let opponent = player === AI_PLAYER ? HUMAN_PLAYER : AI_PLAYER;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = opponent;
                let eval = minimax(board, player, depth + 1, true, alpha, beta);
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                board[i] = '';
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

function checkWinner() {
    for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        if (cells[a] === cells[b] && cells[b] === cells[c] && cells[a] !== '') {
            return cells[a];
        }
    }
    if (isDraw()) return 'tie';
    return null;
}

function evaluate(board, player) {
    let score = 0;
    for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        if (board[a] === board[b] && board[b] === board[c]) {
            if (board[a] === player) score += 10;
            else if (board[a] !== '') score -= 10;
        }
    }
    return score;
}