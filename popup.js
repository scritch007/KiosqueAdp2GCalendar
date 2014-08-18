// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


var Logger = {
	DEBUG: function(text){
		chrome.extension.getBackgroundPage().console.log(text);
	}
}

document.addEventListener('DOMContentLoaded', function () {
	Logger.DEBUG(chrome.extension.getBackgroundPage().location);
	chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
    	console.log(tabs[0].url);
	});
});
