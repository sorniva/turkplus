document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementsByClassName('popup-header').length) {
        var req     = document.querySelectorAll('[name="prevRequester"]')            [0].value || 'err';
        var reqid   = document.querySelectorAll('[name="requesterId"]')              [0].value ||  req ;
        var title   = document.querySelectorAll('[class="capsulelink_bold"]')        [0].value || 'err';
        var reward  = document.querySelectorAll('[name="prevReward"]')               [0].value || 'err';
        var autoapp = document.querySelectorAll('[name="hitAutoAppDelayInSeconds"]') [0].value || 'err';
        
        var hitid    = document.querySelectorAll('[class="popup-header"] > [name="hitId"]')        [0].value || 'err';
        var assignid = document.querySelectorAll('[class="popup-header"] > [name="assignmentId"]') [0].value || 'err';
        var state    = document.querySelectorAll('[class="popup-header"] > [name="isAccepted"]')   [0].value === 'true' ? 'Accepted' : 'Previewed';

        var timer    = document.getElementById('theTime').textContent.trim();
        var accepted = _accepted_when(timer);
        var date     = _amz_date(accepted);

        // Save HIT
        var data = {
            idx      : 9999,
            req      : req,
            reqid    : reqid,
            title    : title,
            reward   : reward,
            hitid    : hitid,
            assignid : assignid,
            status   : state,
            date     : date
        };

        chrome.runtime.sendMessage({msg: 'hit', data: data}, function (response) {
            console.log(response.msg);
            console.log(response.data);
        });
        console.log(data);
        
        
        // Capsule Info
        if (autoapp !== '0') {
            var dd = Math.floor((autoapp / (60 * 60 * 24)));
            var hh = Math.floor((autoapp / (60 * 60)) % 24);
            var mm = Math.floor((autoapp / (60)) % 60);
            var ss = autoapp % 60;

            var autoapptime =
                (dd === 0 ? '' : dd + (dd > 1 ? ' days '    : ' day '))    +
                (hh === 0 ? '' : hh + (hh > 1 ? ' hours '   : ' hour '))   +
                (mm === 0 ? '' : mm + (mm > 1 ? ' minutes ' : ' minute ')) +
                (ss === 0 ? '' : ss + (ss > 1 ? ' seconds ' : ' second '))
            ;
        }
        else {
            var autoapptime = '0 seconds';
        }

	   if (reqid) {
           var html1 = '<td align="left" valign="top" nowrap="" class="capsule_field_text" width="100%"><a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=' + reqid + '" title="Search mturk by requester ID." target="_blank">' + req + '</a><span>&nbsp;&nbsp;</span><a href="https://turkopticon.ucsd.edu/' + reqid + '" title="Average of all Turkopticon ratings" target="_blank">TO</a><span>&nbsp;&nbsp;</span><a href="https://www.mturk.com/mturk/contact?requesterId=' + reqid + '" title="Contact the requester." target="_blank">Contact</a></td>';
       }
	   else {
           var html1 = '<td align="left" valign="top" nowrap="" class="capsule_field_text" width="100%"><a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=' + req + '" title="Search mturk by requester name." target="_blank">' + req + '</a></td>';
       }

        if (autoapp) {
            var html2 = '<td><img src="/media/spacer.gif" width="25" height="1" border="0"></td><td align="right" valign="top" nowrap="" class="capsule_field_title">AA:&nbsp;&nbsp;</td><td align="left" valign="top" nowrap="" class="capsule_field_text">' + autoapptime + '</td>';
        }

	   document.getElementsByClassName('capsule_field_text')[0].innerHTML = html1;
	   document.getElementsByClassName('capsule_field_title')[0].parentNode.insertAdjacentHTML('beforeend', html2);
    }
});
var timeis = Date.now();

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
	return timeis - milli;
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