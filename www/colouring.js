
var cb_canvas = null;
var cb_ctx = null;
var comp_canvas = null;
var comp_ctx = null;
var ex_canvas = null;
var ex_ctx = null;
var cb_lastPoints = null;
var thickness = 4;
var size = 3; // thickness multiplier 
//console.log('start size: '+size);
var brush = "brush";
var compGlobalAlpha = 0.99; // initial compositing transparency

var bgImageArr = ["pages/Old_Grunger_Paper_Texture_09_by_fudgegraphics.jpg",
                  "pages/Old_Grunger_Paper_Texture_01_by_fudgegraphics.jpg",
                  "pages/Old_Grunger_Paper_Texture_02_by_fudgegraphics.jpg",
                  "pages/Old_Grunger_Paper_Texture_08_by_fudgegraphics.jpg",
                  "pages/018.jpg",
                  "pages/019.jpg",
                  "pages/021.jpg" ];
// set default background image
var bgImage = "pages/Old_Grunger_Paper_Texture_09_by_fudgegraphics.jpg";

var initColorsArr = {"red": "212,69,3,0.95",
                     "green": "141,172,94,0.95",
                     "yellow": "235,200,36,0.95",
                     "blue": "85,129,151,0.95",
                     "purple": "182,135,193,0.95",
                     "pink": "237,185,217,0.95",
                     "black": "0,0,0,0.95",
                     "gray": "181,192,192,0.98",
                     "white": "255,255,255,0.95",
                     "brown": "161,105,82,0.95"
                     };

function init() {
	cb_canvas = document.getElementById('cbook');
	cb_lastPoints = Array();

	if (cb_canvas.getContext) {
		cb_ctx = cb_canvas.getContext('2d');
		cb_ctx.lineWidth = thickness;
        cb_ctx.lineCap = 'round';
        cb_ctx.globalCompositeOperation = "copy"; // turns strokes opaque; comment out to see dotty/better strokes. individual colors need lower alpha 
		cb_ctx.strokeStyle = "rgba(0, 0, 0, 0.95)";
		cb_ctx.beginPath();

		cb_canvas.ontouchstart = startDraw;
		cb_canvas.ontouchend = stopDraw;
		cb_canvas.ontouchmove = drawMouse;
	}
    
    ex_canvas = document.getElementById('export');
	if (ex_canvas.getContext) {
		ex_ctx = ex_canvas.getContext('2d');
		ex_ctx.beginPath();
	}
    
    comp_canvas = document.getElementById('compositing');
	if (comp_canvas.getContext) {
		comp_ctx = comp_canvas.getContext('2d');
		comp_ctx.beginPath();
	}
    
    for (var color in initColorsArr) {
        // initialize list, add touchstart to each list item
        var listItem = $('<li class="color" id="'+color+'"></li>');
        listItem.data('lstColor', color); // associate array color with list item
        $("#toolBarList").append(listItem);
    }
    // bind setColor function to each individual list item with associated color
    $('.color').bind('touchstart', function() {
                          setColor($(this).data('lstColor'));
                          });
    
    
    delete init;
}

function startDraw(e) {
    if($("#sizeSelect").hasClass('sizeOpen')) {
        sizePopup();
    }
		for (var i = 1; i <= e.touches.length; i++) {
			cb_lastPoints[i] = getCoords(e.touches[i - 1]); // Get info for finger #1
		}
	return false;
}

// Called whenever cursor position changes after drawing has started
function stopDraw(e) {
    cb_ctx.lineWidth = thickness;
	e.preventDefault();
    compositeCanvas();
	cb_canvas.onmousemove = null;
}

function drawMouse(e) {
    for (var i = 1; i <= e.touches.length; i++) {
        var p = getCoords(e.touches[i - 1]); // Get info for finger i
        cb_lastPoints[i] = drawLine(cb_lastPoints[i].x, cb_lastPoints[i].y, p.x, p.y);
    }
	cb_ctx.stroke();
	cb_ctx.closePath();
	cb_ctx.beginPath();
	return false;
}

// Draw a line on the canvas from (s)tart to (e)nd
function drawLine(sX, sY, eX, eY) {
    // Set width of stroke 
    var prevWidth;
    var curLength = lineLength(sX, sY, eX, eY);

    if (brush == "pen") {
        // starts thick, gets thinner with speed. thickness 20
        if (cb_ctx.lineWidth <= (thickness * size) -1) { prevWidth = cb_ctx.lineWidth; }
        cb_ctx.lineWidth = (thickness * size) - (curLength * ((thickness * size)/20));
        if (cb_ctx.lineWidth <  prevWidth - ((thickness * size)/20) ) { cb_ctx.lineWidth = prevWidth - ((thickness * size)/20 +1); }
        if (cb_ctx.lineWidth > prevWidth + ((thickness * size)/20)) { cb_ctx.lineWidth = prevWidth + 1; }
        if (curLength == 1) { cb_ctx.lineWidth = cb_ctx.lineWidth + 2 ;}
        if (cb_ctx.lineWidth < 1){ cb_ctx.lineWidth = 1; } // limit stroke min
    }
    
    if (brush == "brush") {
//        console.log('linewidth: '+cb_ctx.lineWidth);
//        console.log('thickness*size: '+thickness * size);
        // standard, with thickness 4
        if (cb_ctx.lineWidth > (thickness * size) /2) { prevWidth = cb_ctx.lineWidth; }
        else { prevWidth = (thickness * size) /2; }
        cb_ctx.lineWidth = lineLength(sX, sY, eX, eY) + (prevWidth * 0.3); 
        if (cb_ctx.lineWidth >  prevWidth * 2 ) { cb_ctx.lineWidth = prevWidth * 2; }
        if (cb_ctx.lineWidth > size * 20){ cb_ctx.lineWidth = size * 20; } // limit stroke max
    }

    prevWidth = 0;
    
    // Actual drawing of line
	cb_ctx.moveTo(sX, sY);
	cb_ctx.lineTo(eX, eY);
	return { x: eX, y: eY };
}

// Get the coordinates for a mouse or touch event
function getCoords(e) {
	if (e.offsetX) {
		return { x: e.offsetX, y: e.offsetY };
	}
	else if (e.layerX) {
		return { x: e.layerX, y: e.layerY };
	}
	else {
		return { x: e.pageX - cb_canvas.offsetLeft, y: e.pageY - cb_canvas.offsetTop };
	}
}

function checkClearCanvas() {
    // show overlay - no: closeClearMessage, yes: clearCanvas
    $("#clearMessage").fadeIn(300, function() {
                              $("clearPopup").fadeIn(500);
                              console.log('clearMessage showing open');
                              });
}

function closeClearMessage() {
    $("#clearMessage").fadeOut(100);
}

function clearCanvas() {
    comp_ctx.clearRect (0, 0,  comp_canvas.width,  comp_canvas.height); // composite
    // change background paper image
    var key = Math.floor((Math.random()* bgImageArr.length)+1);
    cssImage = "url("+bgImageArr[key]+") repeat-y fixed 0 0";
    $("body").css({"background":cssImage});
    bgImage = bgImageArr[key];
    
    closeClearMessage();
}

function brushPopup() {
    $("#brushSelect").css({'opacity':'1', 'width':'0px', 'left': toolBarWidth+8 }).animate({
                                                                                           width: '100px'
                                                                                           }, 200, function() {
                                                                                           console.log('brushPopup');
                                                                                           });
}

function selectBrush(kind){
    brush = kind;
    if (kind == 'brush'){
        thickness = '0.125'; 
        var bg = 'url(icons/brush_64.png) no-repeat 5px'; 
        $("#brushButton").css({'background': bg}); 
        $("span#brush").addClass('selectedTool'); 
        $("span#pen").removeClass('selectedTool');}
    
    if (kind == 'pen'){
        thickness = '11'; 
        var bg = 'url(icons/pencil_64.png) no-repeat 5px'; 
        $("#brushButton").css({'background': bg}); 
        $("span#pen").addClass('selectedTool'); 
        $("span#brush").removeClass('selectedTool');}
    
    $("#brushSelect").animate({
                              opacity: 0,
                              width: '0px'
                              }, 500, function() {
                              // Animation complete.
                              console.log('brush popup closed');
                              });
}

function sizePopup() {
    
    if($("#sizeSelect").hasClass('sizeOpen')) {
       // remove the sizeOpen class, close the popup
       $("#sizeSelect").animate({
                                opacity: 0
                                }, 500, function() {
                                // Animation complete.
                                $("#sizeSelect").removeClass('sizeOpen');
                                console.log('size popup closed');
                                });

       }
       else {
       // open the popup, add the sizeOpen class
       $("#sizeSelect").css({'opacity':'1', 'width':'0px', 'left': toolBarWidth+8 }).animate({
                                                                                           width: '95px'
                                                                                           }, 200, function() {
                                                                                             console.log('sizePopup');
                                                                                             $("#sizeSelect").addClass('sizeOpen');
                                                                                          });
       }
}

function sizeChange(change) {
    if ((change == 'plus') && (size < 5)){ size = size + 1;}
    if ((change == 'minus') && (size >= 2)){ size = size - 1; }
    
    if (size == 5) { $("#sizePlus").addClass('sizeDisabled'); } else { $("#sizePlus").removeClass('sizeDisabled'); }
    if (size == 1) { $("#sizeMinus").addClass('sizeDisabled'); } else { $("#sizeMinus").removeClass('sizeDisabled'); }
    var bg = 'url(icons/brush_size'+size+'.png) no-repeat 5px';
    $("#sizeButton").css({'background': bg}); 
}

function setColor(color) {
//    console.log('setColor clicked: '+color);
    $('.color').removeClass('selectedColor');
    var colorID = '#'+color;
    $(colorID).addClass('selectedColor');
    rgbValue = 'rgba('+initColorsArr[color]+')';
    // set context stroke style
    cb_ctx.strokeStyle = rgbValue;
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/line-length [v1.0]
function lineLength( x, y, x0, y0 ){
	return Math.sqrt( ( x -= x0 ) * x + ( y -= y0 ) * y );
}

function compositeCanvas() {
    // draw contents of cbook to composition canvas
    // used when creating smoother, opaque strokes and need to composite
    // them after each brush stroke.
    comp_ctx.globalCompositeOperation = "source-over";
    comp_ctx.globalAlpha = compGlobalAlpha;
    comp_ctx.drawImage(cb_canvas, 0,0);
    
    // clear cb_canvas, ready for next stroke
    cb_ctx.clearRect(0, 0, cb_canvas.width, cb_canvas.height);
}

function saveCanvas() {
    // Export image to Photo Library
    // Show message
    $("#savedMessage").html('<span>Saving</span><br />to Photo Library').css({'opacity':'1', 'width':'0px', 'left': toolBarWidth+8 }).animate({
                                                                   width: '120px'
                                                                   }, 1000, function() {
                                                                   // Animation complete.
                                                                   console.log('Saving');
                                                                   });
    // Copy drawing to hidden canvas with solid background.
    // set globalCompositeOperation to overwrite.
    ex_ctx.globalCompositeOperation = "source-over";
    
    // draw background image, then composite canvas onto export canvas.
    var img = new Image();
    img.onload = function() {
        ex_ctx.drawImage(img, 0,0);
        ex_ctx.drawImage(comp_canvas, 0,0);
        
        // export image to Photo Library, then hide "Saving" message
        var canvas2ImagePlugin = window.plugins.canvas2ImagePlugin;
        canvas2ImagePlugin.saveImageDataToLibrary(
                                                  function(msg){
                                                  $("#savedMessage").html('<span>Saved</span><br />to Photo Library');
                                                  $("#savedMessage span").css({'color':'#fff'});
                                                  $("#savedMessage").delay(800).animate({
                                                                                        opacity: 0,
                                                                                        width: '0px'
                                                                                        }, 500, function() {
                                                                                        // Animation complete.
                                                                                        console.log('Saved');
                                                                                        });
                                                  
                                                  }, 
                                                  function(err){
                                                  alert(err);
                                                  }, 
                                                  'export'
                                                  );
    }
    img.src = bgImage;
}

