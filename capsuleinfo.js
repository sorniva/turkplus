document.addEventListener('DOMContentLoaded', function () {

if (document.getElementsByName('hitForm').length) {
	var reqid, reqname, autoapp, days, hours, mins, secs, autoapptime, html1, html2;

	reqid   = document.getElementsByName('requesterId').length ? document.getElementsByName('requesterId')[0].value : null;
	reqname = document.getElementsByName('prevRequester').length ? document.getElementsByName('prevRequester')[0].value : null;
	autoapp = document.getElementsByName('hitAutoAppDelayInSeconds').length ? document.getElementsByName('hitAutoAppDelayInSeconds')[0].value : null;

	if (autoapp !== '0') {
		dd = Math.floor((autoapp / (60 * 60 * 24)));
		hh = Math.floor((autoapp / (60 * 60)) % 24);
		mm = Math.floor((autoapp / (60)) % 60);
		ss = autoapp % 60;

		autoapptime =
			(dd === 0 ? '' : dd + (dd > 1 ? ' days '    : ' day '))    +
			(hh === 0 ? '' : hh + (hh > 1 ? ' hours '   : ' hour '))   +
			(mm === 0 ? '' : mm + (mm > 1 ? ' minutes ' : ' minute ')) +
			(ss === 0 ? '' : ss + (ss > 1 ? ' seconds ' : ' second '))
		;
	}
	else {
		autoapptime = '0 seconds';
	}

	if (reqid) {
		html1 = '<td align="left" valign="top" nowrap="" class="capsule_field_text" width="100%"><a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&requesterId=' + reqid + '" title="Search mturk by requester ID." target="_blank">' + reqname + '</a><span>&nbsp;&nbsp;</span><a href="https://turkopticon.ucsd.edu/' + reqid + '" title="Average of all Turkopticon ratings" target="_blank">TO</a><span>&nbsp;&nbsp;</span><a href="https://www.mturk.com/mturk/contact?requesterId=' + reqid + '" title="Contact the requester." target="_blank">Contact</a></td>';
	}
	else {
		html1 = '<td align="left" valign="top" nowrap="" class="capsule_field_text" width="100%"><a href="https://www.mturk.com/mturk/searchbar?selectedSearchType=hitgroups&searchWords=' + reqname + '" title="Search mturk by requester name." target="_blank">' + reqname + '</a></td>';
	}

	if (autoapp) {
		html2 = '<td><img src="/media/spacer.gif" width="25" height="1" border="0"></td><td align="right" valign="top" nowrap="" class="capsule_field_title">AA:&nbsp;&nbsp;</td><td align="left" valign="top" nowrap="" class="capsule_field_text">' + autoapptime + '</td>';
	}

	document.getElementsByClassName('capsule_field_text')[0].innerHTML = html1;
	document.getElementsByClassName('capsule_field_title')[0].parentNode.insertAdjacentHTML('beforeend', html2);
}

});