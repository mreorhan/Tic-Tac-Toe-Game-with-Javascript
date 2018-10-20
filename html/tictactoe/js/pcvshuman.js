
      //Oyun başlangıç ayarları
      var player = 'X', computer = 'O'; 
      var turn = player;
      var xwins = 0, owins = 0;
      
      /* =============================== */
      /* Oyun navigasyon ayarları */

      function iterateCols(func) {
        return findInGrid(true, func);
      }
      function iterateRows(func) {
        return findInGrid(false, func);
      }
      function findInGrid(isRow, func) {
        for (var i=0; i<3; i++) {
          var a = isRow ? val(i,0) : val(0,i);
          var b = isRow ? val(i,1) : val(1,i);
          var c = isRow ? val(i,2) : val(2,i);
          if (func(a,b,c,i)) return i;
        }
        return -1;
      }
      function iterateDiags(func) {
        if (func(val(0,0), val(1,1), val(2,2),0)) return 0;
        else if (func(val(2,0), val(1,1), val(0,2),2)) return 2;
        else return -1;
      }
      function convertDiag(iterateVal, ix) {
        if (iterateVal==0) {
          if (ix==0) return [0,0];
          if (ix==1) return [1,1];
          if (ix==2) return [2,2];
        }
        else {
          if (ix==0) return [2,0];
          if (ix==1) return [1,1];
          if (ix==2) return [0,2];
        }
      }
  
      // x,y koordinat bilgilerini alıyoruz
      function val(x,y,newVal) {
        if (typeof newVal == 'undefined') {
          return $("#s"+x+""+y+" span").text();
        } 
        else {
          $("#s"+x+""+y).html("<span>"+newVal+"</span>");
        }
      }

      function init() {
        // document.ready ile oyunu sayfa yenilemesi ile başlatıyoruz
        $(document).ready(function() {
          $("#board div").click(function() {
            if (turn==player) {
              if (!$(this).find("span").length>0) {
                $(this).html("<span>"+player+"</span>");
                processTurn();
              }
            }
          });
        });
      }
      
      // Yapılan işlemleri değiştir pc/human
      function processTurn() {
        // Kazanmak için 3 alan da boşluksuz olmalıdır
        var winnerTest = function(a,b,c) {
          return a==b & a==c && a!='';
        };
        // Çapraz kazanma kontrolü
        var y = iterateCols(winnerTest);
        if (y > -1) {
          endGame(val(y,0), [[y,0],[y,1],[y,2]]);
          return;
        }
        // Yukarıdan aşağıya kazanma kontrolü
        var x = iterateRows(winnerTest);
        if (x > -1) {
          endGame(val(0,x), [[0,x],[1,x],[2,x]]);
          return;
        }
        // check diagonals
        var d = iterateDiags(winnerTest);
        if (d == 0) {
          endGame(val(0,0), [[0,0],[1,1],[2,2]]);
          return;
        } 
        else if (d == 2) {
          endGame(val(2,0), [[2,0],[1,1],[0,2]]);
          return;
        }

        // Eğer alan kalmadıysa berabere bitir
        if (iterateCols(function(a,b,c) { return a=='' || b=='' || c==''; }) == -1) {
          endGame();
        }

        // Oyuncu değişimi pc-human
        else {
          if (turn==computer) {
            turn = player;
          }
          else if (turn==player) {
            turn = computer;
            computerTurn();
            processTurn();
          }
        }
      }
      
      function gameStrategy() {
        var blanks = [];
        for (var x=0; x<3; x++) {
          for (var y=0; y<3; y++) {
            if (val(x,y)=='') blanks.push([x,y]);
          }
        }
        //Dizideki boşluklara random sayı atar
        if (blanks.length>0) {
          var r = Math.floor((Math.random()*blanks.length));
          return blanks[r];
        } 
        else return false;
      }
      
      // Bilgisayarın yaptığı oyun hamlesi
      function computerTurn() {
        var strategies = [];
        strategies.push(gameStrategy);
        for (var i=0; i<strategies.length; i++) {
          var turn = strategies[i]();
          if (!turn) continue;
          val(turn[0], turn[1], computer);
          break;
        }
      }
  
      // Kazandığında hücrelerin renklerini değiştiren fonk.
      function highlightWinner(a) {
        for (var i=0; i<a.length; i++) {
          var coord = a[i];
          var x = coord[0], y = coord[1];
          var sel = "#s"+''+x+''+y;
          $(sel).addClass('winner');
        }
      }
  
      // Sonuçları gösterme
      function endGame(p, highlight) {
        if (typeof p != 'undefined') {
           let sonuc = p == "X" ? "Sen kazandın!": "Bilgisayar kazandı!";
           $(".description").text(sonuc);
          
        }
        else {
          $(".description").text('Oyun berabere bitti!');
        }
        $('.ui.modal').modal('show');
        turn = '';
        if (typeof highlight != 'undefined') {
          highlightWinner(highlight);
        }
        if (p=='X') xwins++;
        else if (p=='O') owins++;
        $("#xwins").text(xwins);
        $("#owins").text(owins);
      }
      
      // Yeni oyun oluşturma
      function newGame() {
        $("#board div").find("span").remove();
        $(".winner").removeClass("winner");
        turn = player;
      }

      // Dizi elemanlarının sayısını verir
      function matches(a, func) {
        var c = 0;
        for (var i=0; i<a.length; i++) {
          if (func(a[i])) c++;
        }
        return c;
      }
      
      // Eşleşen dizi numarasını verir
      function findInArray(a, func) {
        for (var i=0; i<a.length; i++) {
          if (func(a[i])) return i;
        }
        return -1;
      }
      
          
      init();
      