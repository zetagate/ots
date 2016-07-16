
checkBrowser();

var COOKIE_NAME = "v2016001";

var WIDTH = 80;
var WIDTH_AX = 80; //axis
var HEIGHT = 30;
var HEIGHT_AX = 40; //axis
var MGN = 2;

var DAY_TIME = {"월":0, "화":100, "수":200, "목":300, "금":400, "토":500};
var AB_TIME = {"A":0, "B":1};
var COLOR_SET = ["#42baff","#00dc6d","#f1be5b","#ffa6e9","#ffab6e","#fffd66","#e191ff","#a4a4a4","#85e4ff","#ff7f32"];

var db = SUBJECT_OBJDATA;

var canvas;
var ctx;
var grid1;
var grid2;
var cartList = [];

var immed = false;
var softLoaderInterval;


function isIE()
{
  var agent = navigator.userAgent.toLowerCase();
  if (navigator.userAgent.indexOf("Trident")!=-1 || agent.indexOf("msie")!=-1 || navigator.userAgent.indexOf("Edge")!=-1) {
    return true;
  }
  return false;
}


function checkBrowser()
{
  if(isIE()) {
    alert("브라우저 안내\nIE6, IE7, IE8 : 미지원\nIE9 : 저장, 로드기능 사용불가\nIE10, IE11 : 저장기능 사용불가\n엣지 브라우저 : 저장기능 사용불가\n\n크롬, 파이어폭스 등의 브라우저로 사용해 주세요!");
  }
}

//add row to the dhtmlxgrid
function addRow(grid, i)
{
  var note = "";
  if(db[i].eng == "Y") note += "영";
  if(db[i].elr == "Y") note += "e";
  grid.addRow(i+1,[db[i].cod, db[i].ttk, db[i].cls, db[i].prf, db[i].tar
                  ,db[i].crd, db[i].dsg, note, db[i].cap, db[i].dep]);
}

//시간표 canvas 표시할 때, 30분단위로 나와있는
//연속된 시간정보를 하나로 묶기 위해 사용
//example
//input : [100, 101. 102. 200, 300, 301]
//output : [100, 3, 200, 1, 300, 2]
function mergeNum(arr)
{
  if(arr.length == 0) return [];
  var result = [[arr[0],1]];
  var prev = arr[0];
  for(var i=1; i<arr.length; i++) {
    if(arr[i]-prev == 1)
    ++result[result.length-1][1];
    else
    result.push([arr[i], 1]);
    prev = arr[i];
  }
  return result;
}


//searching method
function filterList(keyword, args)
{

  grid1.clearAll();

  /* need stabilizing*/
  clearInterval(softLoaderInterval);
  var k=0;
  function softLoader() {
    if(k*100>=db.length) {
      clearInterval(softLoaderInterval);
      return;
    }
    for(var i=k*100; i<(k+1)*100 && i<db.length; i++) {
      for(var j=0; j<args.length; j++) {
        if(db[i][args[j]].toUpperCase().indexOf(keyword.toUpperCase()) != -1) {
          addRow(grid1, i);
          break;
        }
      }
    }
    ++k;
  }
  softLoaderInterval = setInterval(softLoader, 2);

}


function onFilterChange()
{
  $("#selDvi")[0].selectedIndex = 0;
  $("#selDep")[0].selectedIndex = 0;
  filterList($("#filter")[0].value, ["ttk", "prf", "cod"]);
}

//immed : 빠른검색 옵션
function onFilterInput()
{
  if(immed) onFilterChange();
}

function onEnterClick()
{
  onFilterChange();
}

//빠른검색 옵션
function toggleImmed()
{
  immed = !immed;
  if(immed) filterList($("#filter")[0].value, ["ttk", "prf", "cod"]);
}


function onHelpClick()
{
  openPopup("info.html");
}
function onHistoryClick()
{
  openPopup("history.html");
}

function onDepSelect(e)
{
  filterList(e.target.value, ["dep"]);
  $("#selDvi")[0].selectedIndex = 0;
}

function onDviSelect(e)
{
  filterList(e.target.value, ["dvi"]);
  $("#selDep")[0].selectedIndex = 0;
}

//uncart subject
function onOutClick()
{
  unCartTo();
}

function onOutAllClick()
{
  cartList = [];
  grid2.clearAll();
  redraw();
  document.cookie=COOKIE_NAME+"=;";
}

//cart subject
function onInClick()
{
  cartTo(grid1.getSelectedId()-1);
  redraw();
}

function onSaveClick()
{
  if(isIE()) {
    window.alert("인터넷 익스플로러와 엣지는 파일 저장기능을 지원하지 않습니다.\n크롬이나 파이어폭스 등의 브라우저를 사용해 주세요.");
    return;
  }
  download("timetable.txt", "db1"+cartList.toString());
}

function onLoadClick()
{

  loadData(this.files[0]);
  $("#fileInput")[0].value = "";
}

function onCanvasClick()
{
  ctx.clearRect(0,0, canvas.width, canvas.height);
  drawFrame();
  drawCartList();
}

function onLoad()
{
  canvas = $("#canvas1")[0];
  ctx = canvas.getContext("2d");

  grid1 = new dhtmlXGridObject("gridbox");
  initGrid(grid1);

  var k=0;
  clearInterval(softLoaderInterval);
  function softLoader() {
    if(k*100>=db.length) {
      clearInterval(softLoaderInterval);
      return;
    }
    for(var i=k*100; i<(k+1)*100 && i<db.length; i++) {
      addRow(grid1, i);
    }
    ++k;
  }
  softLoaderInterval = setInterval(softLoader, 80);

  grid2 = new dhtmlXGridObject("gridbox2");
  initGrid(grid2);

  grid1.attachEvent("onRowSelect", onRowSelect);
  grid1.attachEvent("onRowDblClicked", onRowDblClicked);
  grid2.attachEvent("onRowDblClicked", onCartDblClicked);

  $("#filter").on("input", onFilterInput);
  $("#filter").change(onFilterChange);
  $("#btnEnter").click(onEnterClick);
  $("#chkImmed").change(toggleImmed);
  $("#btnHelp").click(onHelpClick);
  $("#btnHistory").click(onHistoryClick);
  $("#selDep").change(onDepSelect);
  $("#selDvi").change(onDviSelect);
  $("#btnOut").click(onOutClick);
  $("#btnOutAll").click(onOutAllClick);
  $("#btnIn").click(onInClick);
  $("#btnSave").click(onSaveClick);
  $("#btnLoad").click(onLoadClick);
  $("#canvas1").click(onCanvasClick);

  $("#btnInput").click(function(e) {
      e.preventDefault();
      $("#fileInput").click();
  })
  $("#fileInput").change(onLoadClick);

  setSizes();
  grid1.setSizes();
  grid2.setSizes();

  drawFrame();

  //read cookie
  var cookieArr = document.cookie.split(";");
  for(var i=0; i<cookieArr.length; i++) {
    if(cookieArr[i].indexOf(COOKIE_NAME) != -1) {
      //cookieArr can has 2 cases.
      //["target=value", " not=value"] //not include space
      //["not=value", " target=value"] //incpude space
      var cookieStr = cookieArr[i].substr(cookieArr[i].indexOf(COOKIE_NAME)+COOKIE_NAME.length+1);
      if(cookieStr.length>0) {
        var cookieData = cookieStr.split(",");
        for(var j=0; j<cookieData.length; j++) {
          cartTo(parseInt(cookieData[j]));
        }
        redraw();
      }
    }
  }

}

function onRowSelect(id, ind)
{
  //id is index+1
  //should use id-1
  var i;

  ctx.clearRect(0,0, canvas.width, canvas.height);
  drawFrame();
  drawCartList();
  drawSelection(mergeNum(db[id-1].tm), 5);

  i = id-2;
  //search other classes for same lecture
  while(i>=0) {
    if(db[i].cod == db[id-1].cod) {
      drawSelection(mergeNum(db[i].tm),2);
    }
    else break;
    --i;
  }
  i = id;
  while(i<db.length) {
    if(db[i].cod == db[id-1].cod) {
      drawSelection(mergeNum(db[i].tm),2);
    }
    else break;
    ++i;
  }

}


function onRowDblClicked(id, ind)
{
  cartTo(id-1);
  redraw();
}

function onCartDblClicked(id, ind)
{
  unCartTo();
}


//cart subject
function cartTo(idx)
{
  if(idx<0 || idx>=db.length) {
    window.alert("유효하지 않은 데이터");
  }
  for(var i=0; i<cartList.length; i++) {
    for(var j=0; j<db[cartList[i]].tm.length; j++) {
      for(var k=0; k<db[idx].tm.length; k++) {
        if(db[cartList[i]].tm[j] == db[idx].tm[k]) {
          window.alert("시간 중복");
          return;
        }
      }
    }
  }
  addRow(grid2, idx);
  cartList.push(idx);
  document.cookie=COOKIE_NAME+"="+cartList.toString();
}

function unCartTo()
{
  var idx = grid2.getSelectedId()-1;
  for(var i=0; i<cartList.length; i++) {
    if(cartList[i] == idx) {
      cartList.splice(i,1);
    }
  }
  grid2.deleteSelectedRows();
  redraw();
  document.cookie=COOKIE_NAME+"="+cartList.toString();
}


window.onresize = function()
{
  setSizes();
}

function initGrid(grid)
{
  grid.setImagePath("dhtmlx/skins/web/imgs/dhxgrid_web/");
  grid.setHeader("코드,과목명,분반,교수,대상,학점,설계,비고,정원,개설학부");
  grid.setInitWidths("55,150,40,60,70,40,40,40,40,100");
  grid.setColAlign("left,left,left,left,left,left,left,left,left");
  grid.setColTypes("txt,txt,txt,txt,txt,txt,txt,txt,txt,txt");
  grid.setColSorting("str,str,str,str,str,str,str,str,str,str");
  grid.setEditable(false);
  dhtmlxEvent(window, "resize", function () {grid.setSizes();});
  grid.init();
}

function setSizes()
{
  var docuWidth = $(document).width();
  var size = docuWidth-(canvas.width+20);
  if(size>230) {
    $(wrapper).width(docuWidth-(canvas.width+30));
  }
  else {
    $(wrapper).width(docuWidth-20);
  }
}

function redraw()
{
  ctx.clearRect(0,0, canvas.width, canvas.height);
  drawFrame();
  drawCartList();
}

function drawTextBox(text, x, y, fieldWidth) {
  var line = "";
  for(var i=0; i<text.length; i++) {
    var tempLine = line + text[i];
    var tempWidth = ctx.measureText(tempLine).width;
    if (tempWidth < fieldWidth && text[i] != "\n") {
      line = tempLine;
    }
    else {
      ctx.fillText(line, x, y);
      line = text[i];
      y += 15;
    }
  }
  ctx.fillText(line, x, y);
}

function drawFrame()
{
  var timeName = ["01A","01B","02A","02B","03A","03B","04A","04B","05A","05B","06A","06B","07A","07B","08A","08B","09A","09B"];
  var clockName = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
  var weekName = ["월요일", "화요일", "수요일", "목요일", "금요일"];
  var xs;
  var ys;





  ctx.beginPath();

  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 1;
  ctx.strokeStyle="#000000";
  ctx.fillStyle="#000000";
  ctx.font="13px dotum";
  ctx.rect(MGN, MGN, canvas.width-MGN*2, canvas.height-MGN*2);


  ctx.rect(MGN, MGN, WIDTH_AX, HEIGHT_AX);
  for(var i=0; i<18; i++) {
    xs = MGN;
    ys = MGN+i*HEIGHT+HEIGHT_AX;
    var divWidth = 38;
    ctx.rect(xs, ys, divWidth, HEIGHT);
    ctx.rect(xs+divWidth, ys, WIDTH_AX-divWidth, HEIGHT);
    ctx.fillText(timeName[i],xs+8,ys+18);
    ctx.fillText(clockName[i],xs+4+WIDTH_AX/2,ys+18);
  }
  ctx.rect(xs, ys+HEIGHT, WIDTH_AX, HEIGHT*2);
  ctx.fillText("이후",xs+6,ys+HEIGHT+32);


  ctx.lineWidth=0.7;
  for(var j=0; j<weekName.length; j++) {
    ctx.rect(MGN+j*WIDTH+WIDTH_AX, MGN, WIDTH, HEIGHT_AX);
    ctx.fillText(weekName[j],MGN+j*WIDTH+WIDTH_AX+25,MGN+25);
    for(var i=0; i<18; i++) {
      xs = MGN+j*WIDTH+WIDTH_AX;
      ys = MGN+i*HEIGHT+HEIGHT_AX;
      ctx.rect(xs, ys, WIDTH, HEIGHT);
    }
    ctx.rect(xs, ys+HEIGHT, WIDTH, HEIGHT*2);
  }


  ctx.stroke();
}

function drawSelection(times, lineWidth)
{

  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle="#FF0000";

  var xs;
  var ys;

  if(times.length == 0) return;
  for(var i=0; i<times.length; i++) {
    var tgt = times[i][0];
    if(tgt%100<17) {
      xs = MGN + WIDTH_AX + Math.floor(tgt/100)*WIDTH;
      ys = MGN + HEIGHT_AX + (tgt%100)*HEIGHT;
      ctx.rect(xs, ys, WIDTH, HEIGHT*times[i][1]);
    }
    else {
      xs = MGN + WIDTH_AX + Math.floor(tgt/100)*WIDTH;
      ys = MGN + HEIGHT_AX + 18*HEIGHT;
      ctx.rect(xs, ys, WIDTH, HEIGHT*2);
    }
  }
  ctx.stroke();
}

function drawCartList()
{
  ctx.lineWidth = 2;
  ctx.strokeStyle="#000000";
  ctx.fillStyle="#000000";
  ctx.font="12px Nanum Gothic";

  var totalCredits = 0;

  for(var i=0; i<cartList.length; i++) {
    var sbj = db[cartList[i]];
    totalCredits += parseInt(sbj.crd);
    var times = mergeNum(sbj.tm);
    for(var j=0; j<times.length; j++) {
      var xs;
      var ys;
      var height;
      var tgt = times[j][0];
      xs = MGN + WIDTH_AX + Math.floor(tgt/100)*WIDTH;
      if(tgt%100<17) {
        ys = MGN + HEIGHT_AX + (tgt%100)*HEIGHT;
        height = HEIGHT*times[j][1];
      }
      else {
        ys = MGN + HEIGHT_AX + 18*HEIGHT;
        height = HEIGHT*2;
        //ctx.rect(xs, ys, WIDTH, HEIGHT*2);
      }
      ctx.fillStyle=COLOR_SET[i%COLOR_SET.length];
      ctx.fillRect(xs, ys, WIDTH, HEIGHT*times[j][1]);
      ctx.fillStyle="#000000";
      ctx.strokeStyle="#000000";
      ctx.lineWidth=2;
      ctx.strokeRect(xs, ys, WIDTH, HEIGHT*times[j][1]);
      var text = sbj.ttk + "\n" + sbj.cls + " " + sbj.prf;
      drawTextBox(text,xs+2,ys+20,WIDTH-4);
    }
    //drawTextBox("aa",20,20,WIDTH);
  }
  $("#totalCredits")[0].innerHTML = "수강학점 : " + totalCredits;

}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function loadData(file)
{
  var size = file.size;
  if(size>96) {
    window.alert("파일이 너무 큽니다.");
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var data = reader.result;

    //savefile version
    if(data.substr(0,3) == "db1") {
      cartList = [];
      grid2.clearAll();
      data = data.substr(3);
      var arr = data.split(",");
      for(var i=0; i<arr.length; i++) {
        cartTo(parseInt(arr[i]));
      }
      redraw();
    }
    else {
      //window.alert("구버전 저장파일입니다. 페이지 하단의 '구버전 저장파일' 링크를 눌러서 열 수 있습니다.");
      window.alert("저장파일 버전 오류");
    }
  }
  reader.onerror = function(evt) {
    console.log(evt.target.error.code);
  }
  reader.readAsText(file);
}

function openPopup(url) {
  window.open(url,"","height=520,width=480,left=20,top=20,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=no");
}
