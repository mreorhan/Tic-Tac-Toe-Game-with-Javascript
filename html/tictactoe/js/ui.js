//Socket.io Bağlantısı
let socket = io('http://localhost:8181');

let oyuncuAdi = "Player";
let oyuncuTipi;

//XOX Alanı Ayarları
let Hucre_genisligi = 100;
let Hucre_boslugu = 1;
let Hucre_satiri = 3,Hucre_sutunu = 3;
let canvas_genisligi = 304,canvas_yuksekligi = 304;

let stage;
let overlayContainter = null;

let grid;
let currentTurn;
let lastMove; // Oyuncunun son hareketi
let canMove;

// Başlangıçtaki canvas alanı ile ilgili ayarlar
function init() {
    initGrid();
    canMove = true;
    currentTurn = null;
    oyuncuTipi = null;

    $('#canvasOyunAlani').attr({width: canvas_genisligi, height: canvas_yuksekligi}).css({width: canvas_genisligi, height: canvas_yuksekligi});

    stage = new createjs.Stage("canvasOyunAlani");
    let bg = new createjs.Shape();
    bg.graphics.beginFill("#e8eaeb").drawRect(0, 0, canvas_genisligi, canvas_yuksekligi);
    stage.addChild(bg);

    let startX = Hucre_boslugu, startY = Hucre_boslugu;

    for (let i = 0; i < Hucre_satiri; i++) {
        for (let j = 0; j < Hucre_sutunu; j++)
        {
            let cell = new createjs.Shape();
            cell.graphics.beginFill("#EEEEEE").drawRect(startX, startY, Hucre_genisligi, Hucre_genisligi);
            cell.on("click", evtCellClicked);

            cell.value = null;
            cell.pos = {
                x: j,
                y: i
            };
            cell.txt = new createjs.Text("", "bold " + (Hucre_genisligi + 5) + "px Segoe UI", "#fff");
            cell.txt.textBaseline = "alphabetic";
            cell.txt.x = startX + Hucre_genisligi / 8;
            cell.txt.y = startY + 4 / 5 * Hucre_genisligi;

            grid[i].push(cell);
            stage.addChild(cell);
            stage.addChild(cell.txt);
            startX += Hucre_genisligi + Hucre_boslugu;
        }
        startX = Hucre_boslugu;
        startY += Hucre_genisligi + Hucre_boslugu;
    }

    addOverlay("Diğer oyuncu bekleniyor...");

    stage.update();
}

let addOverlay = function (title) {
    overlayContainter = new createjs.Container();
    let bg = new createjs.Shape();
    bg.graphics.beginFill("#000").drawRect(0, 0, canvas_genisligi, canvas_yuksekligi);
    let text = new createjs.Text(title, "13px Segoe UI", "#FFF");
    text.textBaseline = "alphabetic";
    text.x = (canvas_genisligi / 2) - text.getMeasuredWidth() / 2;
    text.y = (canvas_yuksekligi / 2) - text.getMeasuredHeight() / 2;
    overlayContainter.addChild(bg, text);
    stage.addChild(overlayContainter);
    stage.update();
};

let removeOverlay = function () {
    stage.removeChild(overlayContainter);
    overlayContainter = null;
    stage.update();
};

let initGrid = function () {
    grid = [];
    for (let i = 0; i < Hucre_satiri; i++)
        grid.push([]);
};

let evtCellClicked = function (event) {
    //return if there is an overlay panel
    if (overlayContainter != null || currentTurn !== oyuncuTipi || !canMove)
        return false;

    let cell = event.target;
    if (cell.value !== null)
        return;
    
    canMove = false;
    makeAMove(cell.pos.x, cell.pos.y);
};

let setValue = function (x, y, value) {
    if (lastMove) {
        lastMove.graphics.clear().beginFill("#eeeeee").drawRect(Hucre_boslugu + lastMove.pos.x*(Hucre_boslugu + Hucre_genisligi), Hucre_boslugu + lastMove.pos.y*(Hucre_boslugu + Hucre_genisligi), Hucre_genisligi, Hucre_genisligi).endFill();
    }
    let cell = grid[y][x];
    let text = cell.txt;
    cell.value = value;
    text.text = value;
    text.color = value === "x" ? "#e04141" : "#0073cf";
    cell.graphics.clear().beginFill("#b6b6b6").drawRect(Hucre_boslugu + cell.pos.x*(Hucre_boslugu + Hucre_genisligi), Hucre_boslugu + cell.pos.y*(Hucre_boslugu + Hucre_genisligi), Hucre_genisligi, Hucre_genisligi).endFill();
    lastMove = cell;
    stage.update();
};

let drawResultLine = function (data) {
    for (let i = 0; i < data.length; i++) {
        let pos = data[i];
        let line = new createjs.Shape();
        line.graphics.setStrokeStyle(3);
        line.graphics.beginStroke("#555555");
        line.graphics.moveTo(Hucre_boslugu + pos[0].x * (Hucre_boslugu + Hucre_genisligi) + Hucre_genisligi * 0.5, Hucre_boslugu + pos[0].y * (Hucre_boslugu + Hucre_genisligi) + Hucre_genisligi * 0.5);
        line.graphics.lineTo(Hucre_boslugu + pos[1].x * (Hucre_boslugu + Hucre_genisligi) + Hucre_genisligi * 0.5, Hucre_boslugu + pos[1].y * (Hucre_boslugu + Hucre_genisligi) + Hucre_genisligi * 0.5);
        line.graphics.endStroke();
        stage.addChild(line);
    }
    stage.update();
};

// Socket Ayarları
socket.on('renamed', function (msg) {
    oyuncuAdi = msg;
});

socket.on('opponent disconnected', function (msg) {
    endGame(msg);
});

var timeleft=0;
downloadTimer =  function (msg){
	setInterval(()=>{
	  $('#example2').progress('increment');
	  if(timeleft >= 10)
		clearInterval(downloadTimer);

	  else if(timeleft==9)
		endGame(msg.value);
	timeleft++;
	},1000);
}
socket.on('make a move', function (msg) {
	
	
	
	$('#example2')
  .progress({
    duration : 1000,
    total    : 10,
  })
;
    setValue(msg.x, msg.y, msg.value);
	
    if (msg.isWinningMove.status) {
        drawResultLine(msg.isWinningMove.data);
        setTimeout(function () {
            endGame(msg.value);
        }, 500);
		
        return;
    }downloadTimer(msg);
    currentTurn = msg.nextTurn;
    currentTurnStyle();
    canMove = true;
});

socket.on('join table', function (msg) {
    currentTurn = msg.currentTurn;
    oyuncuTipi = msg.playerX === oyuncuAdi ? "x" : "o";
    $("#playerX").text("[X] " + msg.playerX);
    $("#playerO").text("[O] " + msg.playerO);
    $("#player" + currentTurn.toUpperCase()).addClass("current");
    $("ul").first().show();
    $("#leaveBtn").show();
    $("#loadingTxt").hide();
    removeOverlay();
});

$(document).ready(function () {
    $("#joinBtn").on("click", function (e) {
        var name = $("#nameTxt").val();
        var $this = $(this);
        socket.emit('join queue', name);
        oyuncuAdi = name;
        $("#loadingTxt").show();
        $this.parents("div").first().hide();
    });

    $("#leaveBtn").on("click", function (e) {
        if (overlayContainter !== null)
            return;
        socket.emit("leave game", null);
    });

    $("#sendBtn").on("click", function (e) {
        sendMessage();
    });
});

var sidebarInit = function () {
    //side bar (re)init
    $("#loadingTxt").show();
    $("#logPanel").val("");
    $("ul").first().hide();
    $("#leaveBtn").hide();
    $(".current").first().removeClass("current");
};

var endGame = function (value) {
	
$(".description").text(value === oyuncuTipi ? " KAZANDIN!" : "KAYBETTİN!");
	$('.ui.modal')
	.modal('show');
		socket.emit('join queue', oyuncuAdi);
		stage.clear();
		stage.removeAllChildren();
		sidebarInit();
		init();
};

var makeAMove = function (x, y) {
	
    socket.emit('make a move', {x: x, y: y}, function (msg) {
        if (!msg.ok) {
            alert('Hata oluştu');
            canMove = true;
        }
    });
};

var currentTurnStyle = function () {
    $("#playerX").toggleClass("current");
    $("#playerO").toggleClass("current");
	timeleft = 0;
	$('#example2').progress('reset');
	downloadTimer=null;
};