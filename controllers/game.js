var db = require("./../models");
var turnTimer;

var Game = {
  addPlayer: function(io, playerName) {
    //   db.Players.findAll({}).then(function(data) {
    //   });
    //   var newPlayer = {name: }
    // db.Player.create
  },

  characterSelect: function(io) {
    var newOrder = this.newTurnOrder();
    var newBoardSpots = {
      spots: [
        {
          // 0
          hasPlayer: true,
          hasItem: false,
          validMoves: [1, 5],
          playerId: 1
        },
        {
          // 1
          hasPlayer: false,
          hasItem: true,
          validMoves: [0, 2, 6],
          playerId: 0
        },
        {
          // 2
          hasPlayer: false,
          hasItem: false,
          validMoves: [1, 3, 7],
          playerId: 0
        },
        {
          // 3
          hasPlayer: false,
          hasItem: false,
          validMoves: [2, 4, 8],
          playerId: 0
        },
        {
          // 4
          hasPlayer: true,
          hasItem: false,
          validMoves: [3, 9],
          playerId: 2
        },
        {
          // 5
          hasPlayer: false,
          hasItem: true,
          validMoves: [0, 10],
          playerId: 0
        },
        {
          // 6
          hasPlayer: false,
          hasItem: false,
          validMoves: [1, 11],
          playerId: 0
        },
        {
          // 7
          hasPlayer: false,
          hasItem: false,
          validMoves: [2, 12],
          playerId: 0
        },
        {
          // 8
          hasPlayer: false,
          hasItem: false,
          validMoves: [3, 9, 13],
          playerId: 0
        },
        {
          // 9
          hasPlayer: false,
          hasItem: false,
          validMoves: [4, 8, 14],
          playerId: 0
        },
        {
          // 10
          hasPlayer: false,
          hasItem: false,
          validMoves: [5, 15],
          playerId: 0
        },
        {
          // 11
          hasPlayer: false,
          hasItem: false,
          validMoves: [6, 16],
          playerId: 0
        },
        {
          // 12
          hasPlayer: false,
          hasItem: false,
          validMoves: [7, 17],
          playerId: 0
        },
        {
          // 13
          hasPlayer: false,
          hasItem: true,
          validMoves: [8, 14, 18],
          playerId: 0
        },
        {
          // 14
          hasPlayer: false,
          hasItem: false,
          validMoves: [9, 13, 19],
          playerId: 0
        },
        {
          // 15
          hasPlayer: false,
          hasItem: false,
          validMoves: [10, 20],
          playerId: 0
        },
        {
          // 16
          hasPlayer: false,
          hasItem: false,
          validMoves: [11, 21],
          playerId: 0
        },
        {
          // 17
          hasPlayer: false,
          hasItem: false,
          validMoves: [12, 22],
          playerId: 0
        },
        {
          // 18
          hasPlayer: false,
          hasItem: false,
          validMoves: [13, 19, 23],
          playerId: 0
        },
        {
          // 19
          hasPlayer: false,
          hasItem: false,
          validMoves: [14, 18, 24],
          playerId: 0
        },
        {
          // 20
          hasPlayer: true,
          hasItem: false,
          validMoves: [15, 21],
          playerId: 3
        },
        {
          // 21
          hasPlayer: false,
          hasItem: false,
          validMoves: [16, 20, 22],
          playerId: 0
        },
        {
          // 22
          hasPlayer: false,
          hasItem: true,
          validMoves: [17, 21, 23],
          playerId: 0
        },
        {
          // 23
          hasPlayer: false,
          hasItem: false,
          validMoves: [18, 22, 24],
          playerId: 0
        },
        {
          // 24
          hasPlayer: true,
          hasItem: false,
          validMoves: [19, 23],
          playerId: 4
        }
      ]
    };
    newBoardSpots = JSON.stringify(newBoardSpots);
    var paths = { p1: "", p2: "", p3: "", p4: "" };
    paths = JSON.stringify(paths);
    var newBoard = {
      turnOrder: newOrder,
      currentTurn: parseInt(newOrder[0]),
      boardSpots: newBoardSpots,
      imagePaths: paths
    };
    db.Board.create(newBoard).then(function() {
      io.emit("startCharSelect", newOrder[0]);
    });
  },

  clickCharacter: function(io) {
    io.emit("clickCharacter");
  },

  selectCharacter: function(io, turnAndId) {
    db.Character.findOne({ where: { id: parseInt(turnAndId.id) } }).then(
      function(charData) {
        db.Board.findAll({}).then(function(data) {
          var paths = JSON.parse(data[0].imagePaths);
          paths["p" + turnAndId.playerTurn] = charData.imgLoc;
          paths = JSON.stringify(paths);
          var startGame = false;

          if (parseInt(turnAndId.playerTurn) === data[0].currentTurn) {
            var index = data[0].turnOrder.indexOf(data[0].currentTurn);
            var newTurn;

            if (data[0].turnOrder[index + 1]) {
              newTurn = parseInt(data[0].turnOrder[index + 1]);
            } else {
              startGame = true;
              newTurn = parseInt(data[0].turnOrder[0]);
            }

            db.Board.update(
              { currentTurn: newTurn, imagePaths: paths },
              { where: { id: 1 } }
            ).then(function() {
              if (startGame) {
                db.Player.findAll({}).then(function(playerData) {
                  playerData.push(data[0].turnOrder);
                  Game.startTurnTimer(io, parseInt(data[0].turnOrder[0]), 20);
                  io.emit("startGame", playerData);
                });
              } else {
                io.emit("startCharSelect", newTurn);
              }
            });
          }
        });
      }
    );
  },

  rollDice: function(io) {
    var num1 = Math.floor(Math.random() * 6) + 1;
    var num2 = Math.floor(Math.random() * 6) + 1;
    db.Board.update({ movesRemaining: num1 + num2 }, { where: { id: 1 } }).then(
      function() {
        var diceNumbers = {
          die1: num1,
          die2: num2,
          moves: num1 + num2
        };
        io.emit("rollDice", diceNumbers);
      }
    );
  },

  start: function(io, data) {
    var newOrder = this.newTurnOrder();
    var newBoardSpots = {
      spots: [
        {
          // 0
          hasPlayer: true,
          hasItem: false,
          validMoves: [1, 5],
          playerId: 1
        },
        {
          // 1
          hasPlayer: false,
          hasItem: true,
          validMoves: [0, 2, 6],
          playerId: 0
        },
        {
          // 2
          hasPlayer: false,
          hasItem: false,
          validMoves: [1, 3, 7],
          playerId: 0
        },
        {
          // 3
          hasPlayer: false,
          hasItem: false,
          validMoves: [2, 4, 8],
          playerId: 0
        },
        {
          // 4
          hasPlayer: true,
          hasItem: false,
          validMoves: [3, 9],
          playerId: 2
        },
        {
          // 5
          hasPlayer: false,
          hasItem: true,
          validMoves: [0, 10],
          playerId: 0
        },
        {
          // 6
          hasPlayer: false,
          hasItem: false,
          validMoves: [1, 11],
          playerId: 0
        },
        {
          // 7
          hasPlayer: false,
          hasItem: false,
          validMoves: [2, 12],
          playerId: 0
        },
        {
          // 8
          hasPlayer: false,
          hasItem: false,
          validMoves: [3, 9, 13],
          playerId: 0
        },
        {
          // 9
          hasPlayer: false,
          hasItem: false,
          validMoves: [4, 8, 14],
          playerId: 0
        },
        {
          // 10
          hasPlayer: false,
          hasItem: false,
          validMoves: [5, 15],
          playerId: 0
        },
        {
          // 11
          hasPlayer: false,
          hasItem: false,
          validMoves: [6, 16],
          playerId: 0
        },
        {
          // 12
          hasPlayer: false,
          hasItem: false,
          validMoves: [7, 17],
          playerId: 0
        },
        {
          // 13
          hasPlayer: false,
          hasItem: true,
          validMoves: [8, 14, 18],
          playerId: 0
        },
        {
          // 14
          hasPlayer: false,
          hasItem: false,
          validMoves: [9, 13, 19],
          playerId: 0
        },
        {
          // 15
          hasPlayer: false,
          hasItem: false,
          validMoves: [10, 20],
          playerId: 0
        },
        {
          // 16
          hasPlayer: false,
          hasItem: false,
          validMoves: [11, 21],
          playerId: 0
        },
        {
          // 17
          hasPlayer: false,
          hasItem: false,
          validMoves: [12, 22],
          playerId: 0
        },
        {
          // 18
          hasPlayer: false,
          hasItem: false,
          validMoves: [13, 19, 23],
          playerId: 0
        },
        {
          // 19
          hasPlayer: false,
          hasItem: false,
          validMoves: [14, 18, 24],
          playerId: 0
        },
        {
          // 20
          hasPlayer: true,
          hasItem: false,
          validMoves: [15, 21],
          playerId: 3
        },
        {
          // 21
          hasPlayer: false,
          hasItem: false,
          validMoves: [16, 20, 22],
          playerId: 0
        },
        {
          // 22
          hasPlayer: false,
          hasItem: true,
          validMoves: [17, 21, 23],
          playerId: 0
        },
        {
          // 23
          hasPlayer: false,
          hasItem: false,
          validMoves: [18, 22, 24],
          playerId: 0
        },
        {
          // 24
          hasPlayer: true,
          hasItem: false,
          validMoves: [19, 23],
          playerId: 4
        }
      ]
    };
    newBoardSpots = JSON.stringify(newBoardSpots);
    var newBoard = {
      turnOrder: newOrder,
      currentTurn: parseInt(newOrder[0]),
      boardSpots: newBoardSpots
    };
    data.push(newOrder);
    db.Board.create(newBoard).then(function() {
      Game.startTurnTimer(io, parseInt(newOrder[0]), 20);
      io.emit("startGame", data);
    });
  },

  startTurn: function(io, start) {
    io.emit("startTurn", start);
  },

  newTurnOrder: function() {
    var playerOrder = "";
    for (var i = 0; playerOrder.length < 4; i++) {
      var num = Math.floor(Math.random() * 4) + 1;
      if (!playerOrder.includes(num)) {
        playerOrder += num;
      }
    }

    return playerOrder;
  },

  playerMove: function(io, playerId) {
    var nextTurn = 1;
    if (playerId === 1) {
      nextTurn = 2;
    }
    io.emit("startTurn", playerId);
  },

  endTurn: function(io, turn) {
    db.Board.findAll({}).then(function(results) {
      var index = results[0].turnOrder.indexOf(results[0].currentTurn);
      var newTurn;

      if (results[0].currentTurn == turn) {
        if (results[0].turnOrder[index + 1]) {
          newTurn = parseInt(results[0].turnOrder[index + 1]);
        } else {
          newTurn = parseInt(results[0].turnOrder[0]);
        }

        db.Board.update({ currentTurn: newTurn }, { where: { id: 1 } }).then(
          function(data) {
            Game.updateTurnTimer();
            Game.startTurnTimer(io, newTurn, 20);
            io.emit("startTurn", newTurn);
          }
        );
      }
    });
  },

  startTurnTimer: function(io, turn, timerCount) {
    turnTimer = setTimeout(() => {
      timerCount--;
      io.emit("changeTimer", timerCount);
      if (timerCount <= 0) {
        timerCount = 0;
        Game.endTurn(io, turn);
      } else {
        this.startTurnTimer(io, turn, timerCount);
      }
    }, 1000);
  },

  updateTurnTimer: function() {
    clearTimeout(turnTimer);
  }
};

module.exports = Game;
