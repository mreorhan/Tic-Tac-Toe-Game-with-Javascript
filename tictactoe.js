let http = require('http').Server(function (res) {
    res.end();
});

let io = require('socket.io')(http);
let Table = require('./grid.js');

let waitingQueue = [];
let tableCount = 1;

setInterval(()=>{
    if (waitingQueue.length < 2)
        return;

    let index = Math.floor(Math.random() * waitingQueue.length);
    let playerX = waitingQueue[index];
    waitingQueue.splice(index, 1);

    index = Math.floor(Math.random() * waitingQueue.length);
    let playerO = waitingQueue[index];
    waitingQueue.splice(index, 1);

    let name = "Table" + tableCount++;
    let table = new Table(playerX, playerO);

    playerX.join(name);
    playerO.join(name);
    playerX.table = table;
    playerO.table = table;

    playerX.currentTable = name;
    playerO.currentTable = name;

    if (playerX.playerName == playerO.playerName) {
        playerO.playerName += "1";
        playerO.emit("renamed", playerO.playerName);
    }

    io.to(name).emit('join table', {
        playerX: playerX.playerName,
        playerO: playerO.playerName,
        currentTurn: table.getCurrentTurn()
    });
}, 2000);

io.on('connection', (socket)=>{
    console.log('Player (id: ' + socket.id + ') connected');

    socket.on("make a move", (data, fn)=> {
        console.log('Player (id: ' + socket.id + ') make a move at [' + data.x + ';' + data.y + ']');
		setTimeout(()=>{
			console.log("süresi doldu");
		},2000)
        let table = socket.table;
        let result = table.makeAMove(data.x, data.y);
        fn({ok: result.status >= 0});
        if (result.status >= 0) {
            io.to(socket.currentTable).emit('make a move', {
                x: data.x,
                y: data.y,
                value: table.getCurrentTurn(),
                nextTurn: table.nextTurn(),
                isWinningMove: {
                    status: result.status == 1,
                    data: result.data
                }
            });

            if (result.status == 1) {
                let playerX = table.getPlayerX();
                let playerO = table.getPlayerO();

                playerX.leave(socket.currentTable);
                playerO.leave(socket.currentTable);
                table = null;
                playerX.currentTable = null;
                playerO.currentTable = null;
                playerX.table = null;
                playerO.table = null;
            }

        }
    });

    socket.on("join queue", function (data) {
        console.log('Player (id: ' + socket.id + ') named ' + data);
        socket.playerName = data;
        socket.table = null;
        socket.currentTable = null;
        waitingQueue.push(socket);
    });

    socket.on("leave game", function (data) {
        leaveTable(socket);
    });

    socket.on('disconnect', function () {
        console.log('Player (id: ' + socket.id + ') disconnected');
        leaveTable(socket);
    });
});

let leaveTable = function (socket) {
    let index = waitingQueue.indexOf(socket);
    if (index != -1)
        waitingQueue.splice(index, 1);
    if (socket.table) {
        let table = socket.table;
        let winner;
        if (table.getPlayerX() == socket)
            winner = table.getPlayerO();
        else
            winner = table.getPlayerX();

        io.to(socket.currentTable).emit('opponent disconnected', winner == table.getPlayerX() ? "x" : "o");

        table = null;
        winner.table = null;
    }
};

http.listen(5000, function () {
    console.log('Port 5000');
});