const player = (name) => {
  return { name };
};

const game = (() => {
  const players = [];
  players.push(player("X"));
  players.push(player("O"));

  let currentPlayer = players[0];
  let winner = null;

  const getCurrentPlayer = () => {
    return currentPlayer;
  };

  const switchCurrentPlayer = () => {
    currentPlayer === players[0]
      ? (currentPlayer = players[1])
      : (currentPlayer = players[0]);
  };

  const getWinner = () => {
    return winner;
  };

  const setWinner = (player) => {
    winner = player;
  };

  const displayWinner = (text = `${winner.name} has won the game!`) => {
    const announcement = document.createElement("h1");
    announcement.setAttribute("id", "win");
    announcement.textContent = text;
    document.body.appendChild(announcement);
  };

  const hideWinner = () => {
    const announcement = document.getElementById("win");
    if (announcement) {
      announcement.parentNode.removeChild(announcement);
    }
  };

  return {
    getCurrentPlayer,
    switchCurrentPlayer,
    getWinner,
    setWinner,
    displayWinner,
    hideWinner,
  };
})();

const square = (row, column) => {
  let content = null;

  const element = document.createElement("div");
  element.classList.add(
    "grid__square",
    `grid__square--row-${row}`,
    `grid__square--column-${column}`
  );
  element.setAttribute("id", `square${row}-${column}`);

  return { element, content };
};

const scoreBoard = ((rows, columns) => {
  const score = {};
  // Initialize dynamic properties
  const initializeScore = () => {
    for (let i = 0; i < rows; i++) {
      score[`row${i}X`] = 0;
      score[`row${i}O`] = 0;
    }
    for (let j = 0; j < columns; j++) {
      score[`col${j}X`] = 0;
      score[`col${j}O`] = 0;
    }
    for (let k = 0; k < 2; k++) {
      score[`diag${k}X`] = 0;
      score[`diag${k}O`] = 0;
    }
    return initializeScore;
  };

  initializeScore();

  const updateScore = (row, column) => {
    const playerName = game.getCurrentPlayer().name;
    const columnScore = ++score[`col${row}${playerName}`];
    const rowScore = ++score[`row${column}${playerName}`];

    let diagonalScore1;
    let diagonalScore2;
    if (
      (row === 0 && column === 0) ||
      (row === 1 && column === 1) ||
      (row === 2 && column === 2)
    ) {
      diagonalScore1 = ++score[`diag0${playerName}`];
    }
    if (
      (row === 0 && column === 2) ||
      (row === 1 && column === 1) ||
      (row === 2 && column === 0)
    ) {
      diagonalScore2 = ++score[`diag1${playerName}`];
    }

    if (
      rowScore >= 3 ||
      columnScore >= 3 ||
      diagonalScore1 >= 3 ||
      diagonalScore2 >= 3
    ) {
      game.setWinner(game.getCurrentPlayer());
      game.displayWinner();
    } else if (!gameBoard.getEmptySquareCount()) {
      game.displayWinner("Draw!");
    }
  };

  return { score, updateScore, initializeScore };
})(3, 3);

const gameBoard = (() => {
  const grid = document.getElementById("grid");
  // This happens only once at window load
  const squares = ((rows, columns) => {
    const gridArray = [];
    for (let row = 0; row < rows; row++) {
      const rowArray = [];
      for (let column = 0; column < columns; column++) {
        const newSquare = square(row, column);
        grid.appendChild(newSquare.element);

        newSquare.element.addEventListener("click", () => {
          if (newSquare.content ?? game.getWinner()) {
            return;
          }
          fillSquare(newSquare, game.getCurrentPlayer());
          scoreBoard.updateScore(row, column);
          game.switchCurrentPlayer();
          setTimeout(AI.makeMove, 100);
        });

        rowArray.push(newSquare);
      }
      gridArray.push(rowArray);
    }
    return gridArray;
  })(3, 3);

  const fillSquare = (square, { name }) => {
    square.content = name;
    square.element.style.color = `rgba(13, 0, 0, 0)`;
    let opacity = 0;
    const fadeSquare = () => {
      opacity += 0.03;
      if (opacity >= 1) {
        return;
      }
      square.element.style.color = `rgba(13, 0, 0, ${opacity})`;
      requestAnimationFrame(fadeSquare);
    };
    fadeSquare();
    square.element.textContent = name;
  };

  const resetSquares = () => {
    gameBoard.squares = squares.map((row) => {
      return row.map((square) => {
        square.element.textContent = null;
        square.content = null;
        return square;
      });
    });
  };

  const getEmptySquareCount = () => {
    let i = 0;
    for (const row of squares) {
      for (const square of row) {
        if (!square.content) {
          ++i;
        }
      }
    }
    return i;
  };

  return { squares, resetSquares, fillSquare, getEmptySquareCount };
})();

document.getElementById("reset").addEventListener("click", () => {
  console.log("Reset!");
  scoreBoard.initializeScore();
  gameBoard.resetSquares();
  game.hideWinner();
  game.setWinner(null);
});

const AI = (() => {
  // The AI makes a simple random move
  const makeMove = () => {
    const emptySquareCount = gameBoard.getEmptySquareCount();
    if (game.getWinner() || !emptySquareCount) {
      return;
    }

    let probability = 1 / emptySquareCount;

    for (const [row, rowArray] of gameBoard.squares.entries()) {
      for (const [column, square] of rowArray.entries()) {
        if (square.content) {
          continue;
        }

        if (Math.random() <= probability) {
          gameBoard.fillSquare(square, game.getCurrentPlayer());
          scoreBoard.updateScore(row, column);
          game.switchCurrentPlayer();
          return;
        } else {
          probability += 1 / emptySquareCount;
        }
      }
    }
  };
  return { makeMove };
})();
