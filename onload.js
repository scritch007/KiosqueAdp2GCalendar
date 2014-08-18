function listCalendars(request, sender, sendResponse){
   	chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
   		console.log("Got this token " + token);
   		var url = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
   		var xhr = new XMLHttpRequest();
   		xhr.open("GET", url)
   		xhr.setRequestHeader("Authorization", "Bearer " + token);
   		xhr.onload = function(e){
   			if (xhr.status == 200 || xhr.status == 204){
   				sendResponse(JSON.parse(xhr.response));
   			}else{
   				console.log('Failed');
   			}
   		}
   		try{
   			xhr.send();
   		}catch(err){
   			console.log("Failed");
   		}
   });
}

function createCalendar(request, sender, sendResponse){
	chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
		function onCalendarCreated(e){
			var url = "https://www.googleapis.com/calendar/v3/users/me/calendarList";
   			var xhr = new XMLHttpRequest();
   			xhr.open("POST", url);
   			xhr.setRequestHeader("Authorization", "Bearer " + token);
   			xhr.setRequestHeader("Content-Type", "application/json");
   			var data = {
   				kind: "calendar#calendarListEntry",
   				id: e.id
   			}
   			xhr.onload = function(e){
   				if (xhr.status == 200 || xhr.status == 204){
   					sendResponse(JSON.parse(xhr.response));
   				}else{
   					console.log('Failed');
   				}
   			}
   			try{
   				xhr.send(JSON.stringify(data));
   			}catch(err){
   				console.log("Failed");
   			}
		}
		var url = "https://www.googleapis.com/calendar/v3/calendars";
		var xhr = new XMLHttpRequest();
		xhr.open("POST", url);
		xhr.setRequestHeader("Authorization", "Bearer " + token);
		xhr.setRequestHeader("Content-Type", "application/json");
		var data = {
			summary: request.summary
		}
		xhr.onload = function(e){
			if (xhr.status == 200 || xhr.status == 204){
				onCalendarCreated(JSON.parse(xhr.response));
			}else{
				console.log("Failed");
			}
		}
		try{
			xhr.send(JSON.stringify(data));
		}catch(err){
			console.log("Failed");
		}
	});
}
function listEvents(request, sender, sendResponse){
	chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
		var url = "https://www.googleapis.com/calendar/v3/calendars/"+ request.calendarId + "/events";
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url)
		xhr.setRequestHeader("Authorization", "Bearer " + token);
		xhr.onload = function(e){
			if (xhr.status == 200 || xhr.status == 204){
				sendResponse(JSON.parse(xhr.response));
			}else{
				console.log('Failed');
			}
		}
		try{
			xhr.send();
		}catch(err){
			console.log("Failed");
		}
	});
}
function createEvent(request, sender, sendResponse){
	chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
		var url = "https://www.googleapis.com/calendar/v3/calendars/"+ request.calendarId + "/events";
		var xhr = new XMLHttpRequest();
   		xhr.open("POST", url)
   		xhr.setRequestHeader("Authorization", "Bearer " + token);
   		xhr.setRequestHeader("Content-Type", "application/json");
   		var data = {
			end:{
				dateTime: request.event.stop,
				timeZone: "Europe/London"
			},
			start:{
				dateTime: request.event.start,
				timeZone: "Europe/London"
			},
			summary: request.event.summary,
         description: request.event.description
		};
   		xhr.onload = function(e){
   			if (xhr.status == 200 || xhr.status == 204){
   				sendResponse(JSON.parse(xhr.response));
   			}else{
   				console.log('Failed');
   			}
   		}
   		try{
   			xhr.send(JSON.stringify(data));
   		}catch(err){
   			console.log("Failed");
   		}
	});
}

function deleteEvent(request, sender, sendResponse){
   chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      var url = "https://www.googleapis.com/calendar/v3/calendars/"+ request.calendarId + "/events/" + request.eventId;
      var xhr = new XMLHttpRequest();
      xhr.open("DELETE", url);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function(e){
         if (xhr.status == 200 || xhr.status == 204){
            sendResponse(JSON.parse(xhr.response));
         }else{
            console.log('Failed');
         }
      }
      try{
         xhr.send();
      }catch(err){
         console.log("Failed");
      }
   });
}
function getCurrentUser(sendResponse){
   chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
      var url = "https://www.googleapis.com/oauth2/v2/userinfo";
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function(e){
         if (xhr.status == 200 || xhr.status == 204){
            sendResponse(JSON.parse(xhr.response));
         }else{
            console.log('Failed');
         }
      }
      try{
         xhr.send();
      }catch(err){
         console.log("Failed");
      }
   });
}

window.addEventListener("load", function(){
	chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {

      if (request.action == "current_user"){
         getCurrentUser(sendResponse);
      }else if (request.action == "list"){
			listCalendars(request, sender, sendResponse);
	    }else if (request.action == "create"){
	    	createCalendar(request, sender, sendResponse);
	    }else if (request.action == "list_events"){
	    	listEvents(request, sender, sendResponse);
	    }else if (request.action == "create_event"){
	    	createEvent(request, sender, sendResponse);
	    }else if (request.action == "delete_event"){
         deleteEvent(request, sender, sendResponse);
       }
	});
});