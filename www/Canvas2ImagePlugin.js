//
//  Canvas2ImagePlugin.js
//  Canvas2ImagePlugin PhoneGap/Cordova plugin
//
//  Created by Tommy-Carlos Williams on 29/03/12.
//  Copyright (c) 2012 Tommy-Carlos Williams. All rights reserved.
//	MIT Licensed
//


Canvas2ImagePlugin = function() {
	
}

Canvas2ImagePlugin.prototype.saveImageDataToLibrary = function(successCallback, failureCallback, canvasId) {
	// successCallback required
	if (typeof successCallback != "function") {
        console.log("Canvas2ImagePlugin Error: successCallback is not a function");
        return;
    }
	if (typeof failureCallback != "function") {
        console.log("Canvas2ImagePlugin Error: failureCallback is not a function");
        return;
    }
	var canvas = document.getElementById(canvasId);
	var imageData = canvas.toDataURL().replace(/data:image\/png;base64,/,'');
	if (typeof PhoneGap !== "undefined") {
		PhoneGap.exec(successCallback, failureCallback, "Canvas2ImagePlugin","saveImageDataToLibrary",[imageData]);
	}
	if (typeof Cordova !== "undefined") {
		Cordova.exec(successCallback, failureCallback, "Canvas2ImagePlugin","saveImageDataToLibrary",[imageData]);
	}
};

if (typeof PhoneGap !== "undefined") {
	PhoneGap.addConstructor(function(){
		if(!window.plugins) {
			window.plugins = {};
		}
		window.plugins.canvas2ImagePlugin = new Canvas2ImagePlugin();
	});
}
if (typeof Cordova !== "undefined") {
	Cordova.addConstructor(function(){
		if(!window.plugins) {
			window.plugins = {};
		}
		window.plugins.canvas2ImagePlugin = new Canvas2ImagePlugin();
	});
}