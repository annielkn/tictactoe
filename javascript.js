const row = 3;
const col = 3;

function Gameboard() {
    const board = [];

    for (let i=0; i<row; i++){
        board[i] = [];
        for (let j=0; j<col; j++){
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;
    
    const updateBoard = (r, c, player) => {
        if (board[r][c].getValue()!=0) {
            console.log(`can't do that`);
            return false;
        } else {
            board[r][c].addToken(player);
            return true;
        }
    };

    const printBoard = () => {
        const boardWithValues = board.map((row) => (row.map((Cell) => Cell.getValue())));
        console.log(boardWithValues);
    };

    const rowWin = Array.from({length:col}, (_, j) => Array.from({length:row}, (_, i) => i+j*row));
    const colWin = Array.from({length:col}, (_, j) => Array.from({length:row}, (_, i) => j+i*row));
    const diagWin = [
        Array.from({length:row}, (_,i) => i+i*row),
        Array.from({length:row}, (_,i) => (row-i-1)+i*row)
    ];
    const winningConditions = [...rowWin, ...colWin, ...diagWin];
    
    const checkWin = (player) => {
        const playerBoard = board.flatMap((row, i) => row.flatMap((cell, j) => cell.getValue() === player ? [i*row.length+j] : []));
        console.log(playerBoard);
        if (playerBoard.length < 3) return;
        const result = winningConditions.some(sub => {
            return sub.every((s) => playerBoard.includes(s));
        });
        console.log(result);
        return result;
    };

    const emptyCells = () => {
        return board
            .flatMap((row) => row.flatMap((Cell) => Cell.getValue()))
            .filter(v => v === 0).length
        };
    
    const resetBoard = () => (board.map((row) => (row.map((Cell) => (Cell.resetValue())))));

    const renderBoard = () => {
        //
    };

    return { getBoard, updateBoard, printBoard, checkWin, emptyCells, resetBoard };
}

function Cell(){
    let value = 0;

    const addToken = (player) => {value = player};
    const resetValue = () => value = 0;
    const getValue = () => value;
    return { addToken, getValue, resetValue };
}

function Player (name, token, key, score) { 
    this.name = name;
    this.token = token;
    this.key = key;
    this.score = 0
}

Player.prototype.updateScore = function() {
    this.score++;
}

Player.prototype.resetScore = function() {
    this.score = 0;
}

function GameController (p1 = "firstplayer", p2 = "secondplayer") {
    const board = Gameboard ();
    const players =  [ new Player(p1, 1, "X"), new Player(p2, 2, "O") ];

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer;

    const switchActivePlayer = () => {
        activePlayer = (getActivePlayer() === players[0]) ? players[1] : players[0]
    };

    const newRound = () => {
        board.printBoard();
        console.log(`turn: ${getActivePlayer().name}`);
    };

    const validMove = (r, c) => {
        return board.updateBoard(r, c, getActivePlayer().token);
    };

    const playRound = (r, c) => {
        if (!roundResult()){
            switchActivePlayer();
            newRound();
        }
    };

    const roundResult = () => {
        if (board.checkWin(getActivePlayer().token)) {
            getActivePlayer().updateScore();
            console.log(`${getActivePlayer().name} wins, resetting board`);
        } else if (board.emptyCells() === 0) {
            console.log(`tie`);
        } else {
            return false;
        }
        return true;
    }

    const getScores = () => {return players.map((v) => `${v.name}: ${v.score}`).join("; ");};

    const resetScores = () => {
        players.map((v) => v.resetScore());
    }
    const resetRound = () => {
        board.resetBoard();
        newRound();
    }
    const resetGame = () => {
        resetScores();
        resetRound();
    };

    return { getActivePlayer, newRound, playRound, getScores, resetRound, resetGame, validMove, roundResult };
}

function initialiseBoard () {
    const boardDisplay = document.querySelector(".tgrid");
    const template = document.getElementById("tcell");

    for (let i = 0; i < col * row; i++) {
        const cellDisplay = template.content.cloneNode(true);
        const btn = cellDisplay.querySelector(".userCell");

        btn.dataset.row = Math.floor(i / row);
        btn.dataset.col = i % row;
        
        boardDisplay.appendChild(cellDisplay);
    }
    
};

function bindBoard() {
    const game = GameController();

    const bindScores = () => {
        document.querySelector(".tscore").textContent = game.getScores();
    };

    const bindPlayer = () => {
        document.querySelector(".tinfo").textContent = `Current player: ${game.getActivePlayer().name} playing as ${game.getActivePlayer().key}`;
    };

    bindScores();
    bindPlayer();

    document.querySelector(".tgrid").addEventListener("click", (e) => {
        const button = e.target.closest(".userCell");
        if (!button) return; 
        
        const r = Number(button.dataset.row);
        const c = Number(button.dataset.col);
        if (game.validMove(r, c)) {
            button.textContent = `${game.getActivePlayer().key}`
            if (game.roundResult()) {
                clearText();
                game.resetRound();
            } else game.playRound(r,c);
            
            bindPlayer();
        };
        bindScores();
    });
    
    document.querySelector(".treset").addEventListener("click", (e) => {
                clearText();
                game.resetGame();
            });
    
    const clearText = () => {
        document.querySelectorAll(".userCell").forEach((cl) => cl.textContent = "");
    }
}

initialiseBoard();
bindBoard();
