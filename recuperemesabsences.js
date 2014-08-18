var SUMMARY_KEY = "kiosque2AdbCalendar"

function getDate(date){
	var parts = date.split("/");
	var dt = new Date(parseInt(parts[2], 10),
                  parseInt(parts[1], 10) - 1,
                  parseInt(parts[0], 10));
	return dt;
}

var elements = document.getElementsByClassName("liste liste_large")[1].childNodes[0].childNodes;
var absences = [];
for (var i=1; i < elements.length; i++){
	var absence = elements[i];
	var accordee = absence.childNodes[6].innerHTML.contains("Accord");
	if (!accordee){
		continue;
	}
	console.log(absence);
	absences.push({
		start: getDate(absence.childNodes[1].innerHTML),
		stop : getDate(absence.childNodes[2].innerHTML),
		matin: absence.childNodes[3].innerHTML == "X",
		aprem: absence.childNodes[4].innerHTML == "X"
	});
}

function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

function ISODateString(d){
 	function pad(n){return n<10 ? '0'+n : n}
 	return d.getUTCFullYear()+'-'
      	+ pad(d.getUTCMonth()+1)+'-'
      	+ pad(d.getUTCDate())+'T'
      	+ pad(d.getUTCHours())+':'
      	+ pad(d.getUTCMinutes())+':'
      	+ pad(d.getUTCSeconds());
}

function UpdateCalendar(calendar){
	chrome.extension.sendRequest({"action": "list_events", calendarId:calendar.id}, function(elements){
		console.log(elements);
		//Todo check if this event has already been added
		for (var i = 0; i < absences.length; i++){
			var absence = absences[i];
			var startDate = new Date(absence.start);
			var stopDate  = new Date(absence.stop);
			var summary = dateToYMD(startDate) + "=>" + dateToYMD(stopDate);
			var exists = false;
			for (var j=0; j < elements.items.length; j++){
				if (summary == elements.items[j].summary)
				{
					console.log("Event already inserted");
					elements.items[j].found = true;
					exists = true;
					break;
				}
			}
			if (exists)
				continue
			if (!absence.matin){
				startDate.setHours(13);
			}
			if (!absence.stop){
				stopDate.setHours(13);
			}else{
				stopDate.setHours(23);
			}
			var hEvent = {
				summary: summary,
				start: ISODateString(startDate),
				stop: ISODateString(stopDate)
			}
			chrome.extension.sendRequest({action: "create_event", event: hEvent, calendarId: calendar.id}, function(element){
				console.log("Event created " + element);
			});

		}
		for (var i=0; i < elements.items.length; i++){
			if(!elements.items[i].found){
				chrome.extension.sendRequest({action:"delete_event", eventId: elements.items[i].id, calendarId: calendar.id}, function(element){
					console.log("Event was removed " + elements.items[i].id);
				});
			}
		}
	});
}

chrome.extension.sendRequest({action:"list"}, function(e){
	console.log("Got the following calendars ", e);
	var calendar = null;
	for (var i=0; i < e.items.length; i++){
		if (SUMMARY_KEY == e.items[i].summary){
			console.log("Found a matching calendar");
			calendar = e.items[i];
			break;
		}
	}
	if (null == calendar){
		//TODO create a new calendar
		console.log("No calendar found creating a new one ");
		chrome.extension.sendRequest({action:"create", summary:"Calendar used to store holidays from kiosque adb", summary: SUMMARY_KEY}, function(e){
			UpdateCalendar(e);
		});
	}else{
		UpdateCalendar(calendar);
	}
});