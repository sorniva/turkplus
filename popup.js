var dashboard = {};

chrome.storage.onChanged.addListener( function (changes) {
  for (var key in changes) {
    if (key === 'dash_popup') {
      _dashboard();
    }
  }
});

chrome.runtime.onMessage.addListener( function (request, sender, sendResponse) {
  if (request.msg == 'status') {
    console.log('Updating Page ' + request.page + ' . . .');
    sendResponse({msg: 'Status received!'});
  }
  if (request.msg == 'update') {
    _tpe();
    sendResponse({msg: 'Update received!'});
    console.log('Update received!');
  }
});

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get('dash_popup', function (data) {
    dashboard = data.dash_popup || {};

    _dashboard();
    _get_dashboard();
  });
});

$('html').on('click', '.dashboard, .all, .breakdown', function() {
    if (!$(this).hasClass('active')) {
    var classis = $(this).prop('class');
    
    $('.dashboard, .all, .breakdown').removeClass('active');
    $(this).addClass('active');
	$('.navi').removeClass('hidden').addClass('hidden');
    $('.navi-' + classis).removeClass('hidden');
    }
});

$('html').on('click', '.sync-todays', function() {
  chrome.runtime.sendMessage({msg: 'sync'}, function (response) {
    console.log(response);
  });
});




_tpe();

function _tpe () {
	var html_1 = '', html_2 = '', count_1 = 0, count_2 = 0, tpe_export = '';

	chrome.storage.local.get('_hits', function (data) {
		var _hits_1 = data._hits, _hits_2 = {};

		for (var key in _hits_1) {
			if (_hits_1[key].status.match(/(Submitted|Paid|Approved|Pending)/)) {
				var ckey = _hits_1[key].reqid;

				if (!_hits_2[ckey]) {
					_hits_2[ckey] = {
						req       : _hits_1[key].req,
						submitted : 1,
						reward    : Number(_hits_1[key].reward.replace(/[^0-9.]/g, ''))
					};
				}
				else {
					_hits_2[ckey].submitted += 1;
					_hits_2[ckey].reward    += Number(_hits_1[key].reward.replace(/[^0-9.]/g, ''));
				}
				count_2 ++;
			}
		}

		var _sort_1 = Object.keys(_hits_1).sort( function (a, b) {
			return _hits_1[a].idx - _hits_1[b].idx;
		});

		var _sort_2 = Object.keys(_hits_2).sort( function(a, b) {
			return _hits_2[a].reward - _hits_2[b].reward;
		});

		for (var i = 0; i < _sort_1.length; i ++) {
			var key_1 = _sort_1[i];
			var color = '', source = '';
			if      (_hits_1[key_1].status.match(/Paid|Approved/))     { color = 'green';  }
			else if (_hits_1[key_1].status.match(/Pending|Submitted/)) { color = 'orange'; }
			else if (_hits_1[key_1].status.match(/Rejected/))          { color = 'red';    }

            if (_hits_1[key_1].src) {
                source = '<a href="' + _hits_1[key_1].src + '" target="_blank" style="text-decoration: none;">🗗</a> ';
            }
            
			html_1 +=
				'<tr>' +
				'    <td><div>' + source + _hits_1[key_1].req +'</div></td>' +
				'    <td>' + _hits_1[key_1].title + '</td>' +
				'    <td>' + _hits_1[key_1].reward + '</td>' +
				'    <td title="' + _hits_1[key_1].hitid + '" style="color: ' + color + '">' + _hits_1[key_1].status.split(/\s/)[0] + '</td>' +
				'</tr>'
			;
			count_1 ++;
		}

		for (var j = _sort_2.length - 1; j > -1; j --) {
			var key_2 = _sort_2[j];

			html_2 +=
				'<tr>' +
				'    <td>' + _hits_2[key_2].req + '</td>' +
				'    <td style="width: 50px; text-align: right;">' + _hits_2[key_2].submitted + '</td>' +
				'    <td style="width: 50px; text-align: right;">$' + _hits_2[key_2].reward.toFixed(2) + '</td>' +
				'</tr>'
			;
		}

		$('#all').html(html_1);
		$('#breakdown').html(html_2);
	});
}

function _dashboard () {
  for (var i in dashboard) {
    if(dashboard.hasOwnProperty(i)) {
      $('.dash').eq(i).html(dashboard[i]);
    }
  }
}

function _get_dashboard () {
  $.get('https://www.mturk.com/mturk/dashboard', function (data) {
    var _ = $(data);
    var err   = _.find('.error_title:contains(You have exceeded the maximum allowed page request rate for this website.)').length;

    if (!err) {
      var dash_popup = {
        // Total Earnings
        0 : _.find('#approved_hits_earnings_amount').text(),
        1 : _.find('#bonus_earnings_amount'        ).text(),
        2 : _.find('#total_earnings_amount'        ).text(),
        3 : _.find('#transfer_earnings'            ).text(),
        
        // HIT Totals
        4 : _.find('td.metrics-table-first-value:contains(HITs Submitted)').next().text(),
        5 : _.find('td.metrics-table-first-value:contains(... Approved)'  ).next().text(),
        6 : _.find('td.metrics-table-first-value:contains(... Rejected)'  ).next().text(),
        9 : _.find('td.metrics-table-first-value:contains(... Pending)'   ).next().text(),
        7 : _.find('td.metrics-table-first-value:contains(... Approved)'  ).next().next().text(),
        8 : _.find('td.metrics-table-first-value:contains(... Rejected)'  ).next().next().text(),
        
        // Today
        10 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(0).parent().text(),
        11 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(0).parent().next().text(),
        12 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(0).parent().next().next().text(),
        13 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(0).parent().next().next().next().text(),
        14 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(0).parent().next().next().next().next().text(),
        15 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(0).parent().next().next().next().next().next().text(),
        
        // Day 2
        16 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(1).parent().text(),
        17 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(1).parent().next().text(),
        18 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(1).parent().next().next().text(),
        19 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(1).parent().next().next().next().text(),
        20 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(1).parent().next().next().next().next().text(),
        21 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(1).parent().next().next().next().next().next().text(),

        // Day 3
        22 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(2).parent().text(),
        23 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(2).parent().next().text(),
        24 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(2).parent().next().next().text(),
        25 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(2).parent().next().next().next().text(),
        26 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(2).parent().next().next().next().next().text(),
        27 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(2).parent().next().next().next().next().next().text(),

        // Day 4
        28 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(3).parent().text(),
        29 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(3).parent().next().text(),
        30 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(3).parent().next().next().text(),
        31 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(3).parent().next().next().next().text(),
        32 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(3).parent().next().next().next().next().text(),
        33 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(3).parent().next().next().next().next().next().text(),

        // Day 5
        34 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(4).parent().text(),
        35 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(4).parent().next().text(),
        36 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(4).parent().next().next().text(),
        37 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(4).parent().next().next().next().text(),
        38 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(4).parent().next().next().next().next().text(),
        39 : _.find("a[href^='/mturk/statusdetail?encodedDate']").eq(4).parent().next().next().next().next().next().text(),
      };

      chrome.storage.local.set({'dash_popup': dash_popup});
    }
    else {
      _get_dashboard();
    }
  });
}