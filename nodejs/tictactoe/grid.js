//Oyun değişken tanımlamaları
let CELL_ROWS = 3, CELL_COLS = 3;
let _playerX;
let _playerO;
let _currentTurn;

let _grid;

function Table(playerX, playerO) {
    _playerX = playerX;
    _playerO = playerO;
    _grid = [];
    _currentTurn = Math.floor(Math.random() * 2) + 1 === 2 ? "x" : "o";
    _createNewGrid();
};

//Oyun alanını yarat
function _createNewGrid() {
    for (let i = 0; i < CELL_ROWS; i++) {
        _grid.push([]);
        for (let j = 0; j < CELL_COLS; j++) {
            _grid[i].push({
                value: null
            });
        }
    }
};

function _isWinningMove(x, y, value) {
    let n_s = _N_SCheck(x, y, value);
    let ne_sw = _NE_SWCheck(x, y, value);
    let e_w = _E_WCheck(x, y, value);
    let se_nw = _SE_NWCheck(x, y, value);

    let result = [];
    if (n_s.status)
        result.push(n_s.data);
    if (ne_sw.status)
        result.push(ne_sw.data);
    if (e_w.status)
        result.push(e_w.data);
    if (se_nw.status)
        result.push(se_nw.data);

    return {status: result.length > 0, data: result};
};

//Üst-alt kontrolü
function _N_SCheck(x, y, value) {
    let pos = [
        {x: x, y: y},
        {x: x, y: y}
    ];
    let counter = 1;

    for (let i = 1; i <= 3; i++) {
        let _y = y - i;
        if (_y < 0 || _grid[_y][x].value !== value)
            break;
        pos[1].x = x;
        pos[1].y = _y
        counter++;
    }
    if (counter >= 3) {
        return {status: true, data: pos};
    }
    for (let i = 1; i <= 3; i++) {
        let _y = y + i;
        if (_y >= CELL_ROWS || _grid[_y][x].value !== value)
            break;
        pos[0].x = x;
        pos[0].y = _y
        counter++;
    }
    return {status: counter >=3, data: pos};

};

//Sol-sağ kontrolü
function _E_WCheck(x, y, value) {
    let pos = [
        {x: x, y: y},
        {x: x, y: y}
    ];
    let counter = 1;

    for (let i = 1; i < 3; i++) {
        let _x = x - i;
        if (_x < 0 || _grid[y][_x].value !== value)
            break;
        pos[1].x = _x;
        pos[1].y = y
        counter++;
    }
    if (counter >= 3) {
        return {status: true, data: pos};
    }
    for (let i = 1; i < 3; i++) {
        let _x = x + i;
        if (_x >= CELL_COLS || _grid[y][_x].value !== value)
            break;
        pos[0].x = _x;
        pos[0].y = y
        counter++;
    }
    return {status: counter >=3, data: pos};

};

//Sağ alt çapraz(diagonal) kontrolü
function _NE_SWCheck(x, y, value) {
    let pos = [
        {x: x, y: y},
        {x: x, y: y}
    ];
    let counter = 1;

    for (let i = 1; i <= 3; i++) {
        let _y = y - i;
        let _x = x - i;
        if (_x < 0 || _y < 0 || _grid[_y][_x].value !== value)
            break;
        pos[1].x = _x;
        pos[1].y = _y
        counter++;
    }
    if (counter >= 3) {
        return {status: true, data: pos};
    }
    for (let i = 1; i <= 3; i++) {
        let _y = y + i;
        let _x = x + i;
        if (_x >= CELL_COLS || _y >= CELL_ROWS || _grid[_y][_x].value !== value)
            break;
        pos[0].x = _x;
        pos[0].y = _y
        counter++;
    }
    return {status: counter >=3, data: pos};

};

//Sol Alt Çapraz (diagonal) kontrolü
function _SE_NWCheck(x, y, value) {
    let pos = [
        {x: x, y: y},
        {x: x, y: y}
    ];
    let counter = 1;

    for (let i = 1; i <= 3; i++) {
        let _y = y + i;
        let _x = x - i;
        if (_x < 0 || _y >= CELL_ROWS || _grid[_y][_x].value !== value)
            break;
        pos[1].x = _x;
        pos[1].y = _y
        counter++;
    }
    if (counter >= 3) {
        return {status: true, data: pos};
    }
    for (let i = 1; i <= 3; i++) {
        let _y = y - i;
        let _x = x + i;
        if (_x >= CELL_COLS || _y < 0 || _grid[_y][_x].value !== value)
            break;
        pos[0].x = _x;
        pos[0].y = _y
        counter++;
    }
    return {status: counter >=3, data: pos};

};
//Hareketi algılama: 1 dönerse kazandı, 0 dönerse adım doğru, -1 dönerse adım hatalı
Table.prototype.makeAMove = function (x, y) {
    let cell = _grid[y][x];
    if (cell.value == null) {
        cell.value = _currentTurn;
        let isWinningMove = _isWinningMove(x, y, _currentTurn);
        if (isWinningMove.status)
            return {status: 1, data: isWinningMove.data};
        return {status: 0, data: null};
    }
    return {status: -1, data: null};
};

Table.prototype.getPlayerX = function () {
    return _playerX;
}

Table.prototype.getPlayerO = function () {
    return _playerO;
}

Table.prototype.nextTurn = function () {
    _currentTurn = _currentTurn === "x" ? "o" : "x";
    return _currentTurn;
};

Table.prototype.getCurrentTurn = function () {
    return _currentTurn;
};

module.exports = Table;