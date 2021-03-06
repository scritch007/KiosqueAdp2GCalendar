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
	var accordee = -1 != absence.childNodes[6].innerHTML.indexOf("Accord");
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
 	return d.getFullYear()+'-'
      	+ pad(d.getMonth()+1)+'-'
      	+ pad(d.getDate())+'T'
      	+ pad(d.getHours())+':'
      	+ pad(d.getMinutes())+':'
      	+ pad(d.getSeconds());
}

function UpdateCalendar(calendar){
	chrome.extension.sendRequest({"action": "list_events", calendarId:calendar.id, timeMin: ISODateString(new Date()) + "Z"}, function(elements){
		if (elements.error){
			toastr.error(elements.error);
			return;
		}
		//Todo check if this event has already been added
		for (var i = 0; i < absences.length; i++){
			var absence = absences[i];
			var startDate = new Date(absence.start);
			var stopDate  = new Date(absence.stop);
			var description = "Holidays " + dateToYMD(startDate) + "=>" + dateToYMD(stopDate) + "#kiosqueAdp2Calendar";
			var summary = "Out of the Office"
			var exists = false;
			for (var j=0; j < elements.items.length; j++){
				if (description == elements.items[j].description)
				{
					toastr.info("Event already inserted");
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
				stop: ISODateString(stopDate),
				description: description
			}
			chrome.extension.sendRequest({action: "create_event", event: hEvent, calendarId: calendar.id}, function(element){
				if (element.error){
					toastr.error(element.error);
					return;
				}
				toastr.success("Event created " + description);
			});

		}
		for (var i=0; i < elements.items.length; i++){
			var element = elements.items[i];
			if(!element.found){
				if (element.description && (-1 != element.description.indexOf("kiosqueAdp2Calendar")))
				{
					chrome.extension.sendRequest({action:"delete_event", eventId: element.id, calendarId: calendar.id}, function(res){
						if (res.error){
							toastr.error(res.error);
							return;
						}
						toastr.success("Event was removed " + element.description);
					});
				}
			}
		}
	});
}

function GetCalendars(user_email){
	chrome.extension.sendRequest({action:"list"}, function(e){
		if (e.error){
			toastr.error(e.error);
			return;
		}
		var calendar = null;
		for (var i=0; i < e.items.length; i++){
			//if (SUMMARY_KEY == e.items[i].summary){
			if (user_email == e.items[i].id){
				calendar = e.items[i];
				break;
			}
		}
		if (null == calendar){
			toastr.error("Couldn't find calendar");
		}else{
			UpdateCalendar(calendar);
		}
	});
}

chrome.extension.sendRequest({action:"current_user"}, function(user){
	if (user.error){
		toastr.error(user.error);
		return;
	}
	console.log("Welcome " + user.email);
	GetCalendars(user.email);
});
