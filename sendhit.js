var timeis = Date.now();

document.addEventListener('DOMContentLoaded', function () {

  if (document.getElementsByClassName('popup-header').length) {
    var req      = document.getElementsByName('prevRequester').length ? document.getElementsByName('prevRequester')[0].value : 'error';
    var reqid    = document.getElementsByName('requesterId').length ? document.getElementsByName('requesterId')[0].value : req;
    var title    = document.getElementsByClassName('capsulelink_bold').length ? document.getElementsByClassName('capsulelink_bold')[0].textContent.trim() : 'error';
    var reward   = document.getElementsByName('prevReward').length ? document.getElementsByName('prevReward')[0].value.replace(/USD/, '$') : 'error';
    var autoapp  = document.getElementsByName('hitAutoAppDelayInSeconds').length ? document.getElementsByName('hitAutoAppDelayInSeconds')[0].value.replace(/USD/, '$') : null;
  
    var hitid    = document.querySelectorAll('[class="popup-header"] > [name="hitId"]')        [0].value;
    var assignid = document.querySelectorAll('[class="popup-header"] > [name="assignmentId"]') [0].value;
    var state    = document.querySelectorAll('[class="popup-header"] > [name="isAccepted"]')   [0].value === 'true' ? 'Accepted' : 'Previewed';

    var timer    = document.getElementById('theTime').textContent.trim();
    var accepted = _accepted_when(timer);
    var date     = _amz_date(accepted);

    var src = document.querySelectorAll('iframe').length ? document.querySelectorAll('iframe')[0].src : null;

    var data = {
      idx      : 9999,
      req      : req,
      reqid    : reqid,
      title    : title,
      reward   : reward,
      hitid    : hitid,
      assignid : assignid,
      status   : state,
      date     : date,
      src      : src, 
      aa       : autoapp,
      sub      : null
    };

      chrome.runtime.sendMessage({msg: 'hit', data: data}, function (response) {
        console.log(response.msg);
        console.log(response.data);
      });
    console.log(data);
  }
  
});

// Get the date string for when the HIT was accepted
function _accepted_when (time) {
	var days = 0, hours = 0, minutes = 0, seconds = 0, milli = 0;
	var split = time.split(/:| /);
	if (split.length == 3) {
		hours   = parseInt(split[0], 10);
		minutes = parseInt(split[1], 10);
		seconds = parseInt(split[2], 10);
	}
	if (split.length == 4) {
		days    = parseInt(split[0], 10);
		hours   = parseInt(split[1], 10);
		minutes = parseInt(split[2], 10);
		seconds = parseInt(split[3], 10);
	}
	milli = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1000;
	var accepted = timeis - milli;
	return accepted;
}

// Get the date in PST
function _amz_date (time) {
	var given    = new Date(time);
	var utc      = given.getTime() + (given.getTimezoneOffset() * 60000);
	var offset   = _dst() === true ? '-7' : '-8';
	var amz      = new Date(utc + (3600000 * offset));
	var day      = (amz.getDate()) < 10 ? '0' + (amz.getDate()).toString() : (amz.getDate()).toString();
	var month    = (amz.getMonth() + 1) < 10 ? '0' + (amz.getMonth() + 1).toString() : ((amz.getMonth() + 1)).toString();
	var year     = (amz.getFullYear()).toString();
	return month + day + year;
}

// Check if DST
function _dst () {
	var today     = new Date();
	var year      = today.getFullYear();
	var dst_start = new Date('March 14, ' + year + ' 02:00:00');
	var dst_end   = new Date('November 07, ' + year + ' 02:00:00');
	var day       = dst_start.getDay();
	dst_start.setDate(14 - day);
	day = dst_end.getDay();
	dst_end.setDate(7 - day);
	return (today >= dst_start && today < dst_end) ? true : false;
}