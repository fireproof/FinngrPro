
var cb_canvas = null;
var cb_ctx = null;
var comp_canvas = null;
var comp_ctx = null;
var ex_canvas = null;
var ex_ctx = null;
var cb_lastPoints = null;
var thickness = 1.2;
var size = 3; // thickness multiplier
var brushSize = 3;
var penSize = 1;
//console.log('start size: '+size);
var brush = "brush";
var previousColor = "black";
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
// initial colors for the right side of a gradient
var modifiedColorsArr = {"red": "212,69,3,0.95",
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

var rgbValue = "0,0,0,0.95";

function init() {
	cb_canvas = document.getElementById('cbook');
	cb_lastPoints = Array();

	if (cb_canvas.getContext) {
		cb_ctx = cb_canvas.getContext('2d');
		cb_ctx.lineWidth = thickness;
        cb_ctx.lineCap = 'round';
//        cb_ctx.globalCompositeOperation = "copy"; // turns strokes opaque; comment out to see dotty/better strokes. individual colors need lower alpha 
		cb_ctx.strokeStyle = 'rgba('+rgbValue+')';
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
    setColor("black");
    
    delete init;
}

function startDraw(e) {
    // close the brush size selection menu if it is open
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
    var curLength = parseInt(lineLength(sX, sY, eX, eY));

    if (brush == "pen") {
        // starts thick, gets thinner with speed. thickness 20
        if (cb_ctx.lineWidth <= (thickness * (penSize/2)) -1) { prevWidth = cb_ctx.lineWidth; }
        cb_ctx.lineWidth = (thickness * (penSize/2)) - (curLength * ((thickness * (penSize/2))/30));
        if (cb_ctx.lineWidth <  prevWidth - ((thickness * (penSize/2))/30) ) { cb_ctx.lineWidth = prevWidth - ((thickness * (penSize/2))/30 +1); }
        if (cb_ctx.lineWidth > prevWidth + ((thickness * (penSize/2))/30)) { cb_ctx.lineWidth = prevWidth + 1; }
        if (curLength == 1) { cb_ctx.lineWidth = cb_ctx.lineWidth + 2 ;}
        if (cb_ctx.lineWidth < 1){ cb_ctx.lineWidth = 1; } // limit stroke min
    }
    
    if (brush == "brush") {
        var brushthickness = brushSize/3;
        if (cb_ctx.lineWidth > (brushthickness * brushSize) /2) { prevWidth = cb_ctx.lineWidth; }
        else { prevWidth = (brushthickness * brushSize) /2; }
        cb_ctx.lineWidth = parseInt( lineLength(sX, sY, eX, eY) + (prevWidth * 0.3) );
        if (cb_ctx.lineWidth >  prevWidth * 2 ) { cb_ctx.lineWidth = prevWidth * 2; }
        if (cb_ctx.lineWidth > brushSize * 20){ cb_ctx.lineWidth = parseInt(brushSize * 20); } // limit stroke max
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

function showClearConfirm() {
    var actionSheet = window.plugins.actionSheet;
    // Select Source
    actionSheet.create('Clear Screen?', ['Yes', 'Save this image first', 'Cancel'], function(buttonValue, buttonIndex) {
                       
                       switch (arguments[1])
                       {
                       case 0:
                       clearCanvas();
                       break;
                       case 1:
                       saveCanvas('clear'); // 'persist' would skip the clearCanvas() step.
//                       clearCanvas(saveCanvas());
                       break;
                       default:
                       console.log('cancel New Page');
                       }
                       
                       }, {cancelButtonIndex: 2});
    
}
// No ActionSheet plugin required
//function checkClearCanvas() {
//    // show overlay - no: closeClearMessage, yes: clearCanvas
//    $("#clearMessage").fadeIn(300, function() {
//                              $("clearPopup").fadeIn(500);
//                              console.log('clearMessage showing open');
//                              });
//}
//
//function closeClearMessage() {
//    $("#clearMessage").fadeOut(100);
//}

function clearCanvas() {
    comp_ctx.clearRect (0, 0,  comp_canvas.width,  comp_canvas.height); // composite
    // change background paper image
    var key = Math.floor((Math.random()* bgImageArr.length)+1);
    cssImage = "url("+bgImageArr[key]+") repeat-y fixed 0 0";
    $("body").css({"background":cssImage});
    bgImage = bgImageArr[key];
    
    clearTracingImage();
//    closeClearMessage();
}
// may want to call this by itself at some point?
function clearTracingImage() {
    var canvas = document.getElementById("tracingImage");
    var ctx = canvas.getContext("2d");
    ctx.clearRect (0, 0,  canvas.width,  canvas.height);
}

function brushPopup() {
    // if current tool is pen, switch to brush and vice versa
    if (brush == 'pen'){
        brush = 'brush';
        thickness = '0.125';
        var bg = 'url(icons/2/toolbar_brush.png) no-repeat 5px';
        $("#brushButton").css({'background': bg});
        var bg = 'url(icons/2/toolbar_brush_size'+brushSize+'.png) no-repeat 5px';
        $("#sizeButton").css({'background': bg});
        if (brushSize == 5) { $("#sizePlus").addClass('sizeDisabled'); } else { $("#sizePlus").removeClass('sizeDisabled'); }
        if (brushSize == 1) { $("#sizeMinus").addClass('sizeDisabled'); } else { $("#sizeMinus").removeClass('sizeDisabled'); }
    }
    else if (brush == 'brush'){
        brush = 'pen';
        thickness = '11';
        var bg = 'url(icons/2/toolbar_pen.png) no-repeat 5px';
        $("#brushButton").css({'background': bg});
        var bg = 'url(icons/2/toolbar_brush_size'+penSize+'.png) no-repeat 5px';
        $("#sizeButton").css({'background': bg});
        if (penSize == 5) { $("#sizePlus").addClass('sizeDisabled'); } else { $("#sizePlus").removeClass('sizeDisabled'); }
        if (penSize == 1) { $("#sizeMinus").addClass('sizeDisabled'); } else { $("#sizeMinus").removeClass('sizeDisabled'); }
    }
}

function sizePopup() {
    
    if($("#sizeSelect").hasClass('sizeOpen')) {
       // remove the sizeOpen class, close the popup
       $("#sizeSelect").animate({
                                opacity: 0
                                }, 500, function() {
                                // Animation complete.
                                $("#sizeSelect").removeClass('sizeOpen');
                                $("#sizeSelect").css({'visibility':'hidden'});
                                console.log('Size popup closed');
                                });
       }
    else {
       // open the popup, add the sizeOpen class
        $("#sizeSelect").css({'visibility':'visible'});
        $("#sizeSelect").css({'opacity':'1', 'width':'0px', 'left': toolBarWidth+8 }).animate({
                                                                                           width: '95px'
                                                                                           }, 200, function() {
                                                                                             console.log('sizePopup');
                                                                                             $("#sizeSelect").addClass('sizeOpen');
                                                                                          });
       }
}

function sizeChange(change) {
    if (brush == 'brush') { size = brushSize; }
    if (brush == 'pen') { size = penSize; }
    if ((change == 'plus') && (size < 5)){ size = size + 1;}
    if ((change == 'minus') && (size >= 2)){ size = size - 1; }
    if (brush == 'brush') { brushSize = size; }
    if (brush == 'pen') { penSize = size; }
    if (size == 5) { $("#sizePlus").addClass('sizeDisabled'); } else { $("#sizePlus").removeClass('sizeDisabled'); }
    if (size == 1) { $("#sizeMinus").addClass('sizeDisabled'); } else { $("#sizeMinus").removeClass('sizeDisabled'); }
    var bg = 'url(icons/2/toolbar_brush_size'+size+'.png) no-repeat 5px';
    $("#sizeButton").css({'background': bg}); 
}

function setColor(color) {

    // remove selectedColor from ALL color swatches
    $('.color').removeClass('selectedColor'); 
    // add selectedColor class to current color swatch
    var colorID = '#'+color;
    $(colorID).addClass('selectedColor');
    
    if (previousColor === color) {
        // CLEAN COLOR
        // color swatch has been tapped twice in a row, so set color for painting using rgb value from intial array
        var newGradient = '-webkit-radial-gradient(20% 50%, circle farthest-corner, rgba('+initColorsArr[color]+'), rgba('+initColorsArr[color]+') 90%)';
        $(colorID).css({'background':newGradient});
        cb_ctx.strokeStyle = 'rgba('+initColorsArr[color]+')';
    }
    else {
        // MUDDY COLOR
        // mix the modified color with the current brush color, then mix that result with the swatch color
        var tempRGBa = rgbMidpoint(modifiedColorsArr[color], rgbValue);
        var rightRGBa = rgbMidpoint(initColorsArr[color], tempRGBa);
        
        // update array with modified "right-side" rgba value for color swatch.
        modifiedColorsArr[color] = rightRGBa;
        
        var newGradient = '-webkit-radial-gradient(20% 50%, circle farthest-corner, rgba('+initColorsArr[color]+'), rgba('+rightRGBa+') 90%)';
        $(colorID).css({'background':newGradient});
        
        // rgbValue should actually be midway between the main color and the new rightRGBa.
        rgbValue = rgbMidpoint(initColorsArr[color], rightRGBa);
        cb_ctx.strokeStyle = 'rgba('+rgbValue+')';
    }
    previousColor = color;
}

function rgbMidpoint(first,second) {
    // create a string 'rgba' that is average of two rgba values
    var firstRGBarr = first.split(',');
    var secondRGBarr = second.split(',');
    var midpointRGBa = parseInt( (parseFloat(firstRGBarr[0]) + parseFloat(secondRGBarr[0]))/2 ).toString() + ','
                     + parseInt( (parseFloat(firstRGBarr[1]) + parseFloat(secondRGBarr[1]))/2 ).toString() + ','
                     + parseInt( (parseFloat(firstRGBarr[2]) + parseFloat(secondRGBarr[2]))/2 ).toString() + ','
                     + parseFloat( (parseFloat(firstRGBarr[3]) + parseFloat(secondRGBarr[3]))/2 ).toString();
    return midpointRGBa;
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

function saveCanvas(retention) {
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
                                                                                        if (retention != 'persist'){
                                                                                        clearCanvas();
                                                                                        }
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

/* Tracing Image Functions */

// Photo is successfully retrieved, draw to tracingImage div
function setTracingImage(imageURI) {
    clearTracingImage();
    var canvas = document.getElementById("tracingImage");
    var ctx = canvas.getContext("2d");
    var image = new Image();
    
    image.onload = function(){
        var newWidth;
        var newHeight;
        var newX;
        var newY;
        if (image.width > image.height){
            var mult = canvas.width / image.width;
            newX = '0';
            newY = parseInt((canvas.height / 2) - ((image.height * mult) / 2));
            newHeight = parseInt(image.height * mult);
            newWidth = parseInt(image.width * mult);
        }
        else {
            var mult = canvas.height / image.height;
            newX = parseInt((canvas.width / 2) - ((image.width * mult) / 2));
            newY = '0';
            newHeight = parseInt(image.height * mult);
            newWidth = parseInt(image.width * mult);
        }
        ctx.drawImage(image, newX,newY, newWidth, newHeight);
    }
    image.src = imageURI;
}


//// No ActionSheet plugin needed
//function showTracingConfirm() {
//    navigator.notification.confirm(
//                                   'Select Image Source',  // message
//                                   capturePhoto,              // callback to invoke with index of button pressed
//                                   'Tracing Image',            // title
//                                   'Camera,Photo Library,Cancel'          // buttonLabels
//                                   );
//}
//
//function capturePhoto(imageSource) {
//    console.log(imageSource);
//    if (imageSource == '1'){
//    navigator.camera.getPicture(setTracingImage, onFail, {
//                                quality: 50,
//                                correctOrientation: 1,
//                                saveToPhotoAlbum: 0
//                                });
//    }
//    else if (imageSource == '2') {
//    navigator.camera.getPicture(setTracingImage, onFail, {
//                                quality: 50,
//                                correctOrientation: 1,
//                                destinationType: navigator.camera.DestinationType.FILE_URI,
//                                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
//                                });
//    }
//    else { console.log('cancel tracing image'); }
//}

function onFail() {
    console.log('camera FAIL');
}

function showTracingConfirm() {
    var actionSheet = window.plugins.actionSheet;
    // Select Source
    actionSheet.create('Select Tracing Image Source', ['Camera', 'Photo Library', 'Cancel'], function(buttonValue, buttonIndex) {

                       switch (arguments[1])
                       {
                       case 0:
                       navigator.camera.getPicture(setTracingImage, onFail, {
                                                   quality: 50,
                                                   correctOrientation: 1,
                                                   saveToPhotoAlbum: 0
                                                   });
                       break;
                       case 1:
                       navigator.camera.getPicture(setTracingImage, onFail, {
                                                   quality: 50,
                                                   correctOrientation: 1,
                                                   destinationType: navigator.camera.DestinationType.FILE_URI,
                                                   sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
                                                   });
                       break;
                       default:
                       console.log('cancel Tracing Image selection');
                       }

                       }, {cancelButtonIndex: 2});

}
