var today =
	$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).prop('href')
;
var earnings_hits =
	Number($('#approved_hits_earnings_amount').text().replace(/[^0-9.]/g, ''))
;
var earnings_bonus =
	Number($('#bonus_earnings_amount').text().replace(/[^0-9.]/g, ''))
;
var earnings_total =
	Number($('#total_earnings_amount').text().replace(/[^0-9.]/g, ''))
;
var earnings_transfer =
	Number($('#transfer_earnings').text().replace(/[^0-9.]/g, ''))
;
var hits_submitted =
	Number($("td.metrics-table-first-value:contains(HITs Submitted)").next().text())
;
var hits_approved =
	Number($("td.metrics-table-first-value:contains(... Approved)").next().text())
;
var hits_rejected =
	Number($('td.metrics-table-first-value:contains(... Rejected)').next().text())
;
var hits_pending =
	Number($("td.metrics-table-first-value:contains(... Pending)").next().text())
;
var today_submitted = 
	Number($("a[href^='/mturk/statusdetail?encodedDate']:contains(Today)").eq(0).parent().next().text())
;
var today_approved =
	Number($("a[href^='/mturk/statusdetail?encodedDate']:contains(Today)").eq(0).parent().next().next().text())
;
var today_rejected =
	Number($("a[href^='/mturk/statusdetail?encodedDate']:contains(Today)").eq(0).parent().next().next().next().text())
;
var today_pending =
	Number($("a[href^='/mturk/statusdetail?encodedDate']:contains(Today)").eq(0).parent().next().next().next().next().text())
;
var approval_rating =
	(Math.round(((hits_approved) / (hits_approved + hits_rejected)) * 1000000) / 10000).toFixed(4) + '%'
;
var rejection_rating =
	(Math.round(((hits_rejected) / (hits_approved + hits_rejected)) * 1000000) / 10000).toFixed(4) + '%'
;
var under_99 =
	Math.round((hits_rejected - ((1.0 - 99 / 100) * hits_submitted)) / ((1.0 - 99 / 100) - 1))
;
var under_95 =
	Math.round((hits_rejected - ((1.0 - 95/100) * hits_submitted)) / ((1.0 - 95 / 100) - 1))
;
var best_case_scenario =
	(Math.round(((hits_submitted - hits_rejected) / hits_submitted) * 1000000) / 10000).toFixed(4) + '%'
;
var worst_case_scenario =
	(Math.round(hits_approved / (hits_approved + hits_rejected + hits_pending) * 1000000)/10000).toFixed(4) + '%'
;

var dash_popup = {
    earnings_hits     : $('#approved_hits_earnings_amount') .text(),
    earnings_bonus    : $('#bonus_earnings_amount')         .text(),
    earnings_total    : $('#total_earnings_amount')         .text(),
    earnings_transfer : $('#transfer_earnings')             .text(),
    hits_submitted    : $('td.metrics-table-first-value:contains(HITs Submitted)') .next() .text(),
    hits_approved     : $('td.metrics-table-first-value:contains(... Approved)')   .next() .text(),
    hits_rejected     : $('td.metrics-table-first-value:contains(... Rejected)')   .next() .text(),
    hits_pending      : $('td.metrics-table-first-value:contains(... Pending)')    .next() .text(),
    hits_approved_per : $('td.metrics-table-first-value:contains(... Approved)')   .next() .next() .text(),
    hits_rejected_per : $('td.metrics-table-first-value:contains(... Rejected)')   .next() .next() .text()  
}

chrome.storage.local.set({'dash_popup': dash_popup});

function _changes_storage () {
	chrome.storage.local.get('earnings_hits', function (data) {
		var stored = data.earnings_hits || 0;

		if (stored !== earnings_hits) {
			$('#approved_hits_earnings_amount').prev().append(
				'<span style="float:right;">+$' +
				(Math.round((earnings_hits - stored) * 100) / 100).toFixed(2) +
				'</span>'
			);
			chrome.storage.local.set({'earnings_hits': earnings_hits});
		}
	});

	chrome.storage.local.get('earnings_bonus', function (data) {
		var stored = data.earnings_bonus || 0;

		if (stored !== earnings_bonus) {
			$('#bonus_earnings_amount').prev().append(
				'<span style="float:right;">+$' +
				(Math.round((earnings_bonus - stored) * 100) / 100).toFixed(2) +
				'</span>'
			);
			chrome.storage.local.set({'earnings_bonus': earnings_bonus});
		}
	});

	chrome.storage.local.get('earnings_total', function (data) {
		var stored = data.earnings_total || 0;

		if (stored !== earnings_total) {
			$('#total_earnings_amount').prev().append(
				'<span style="float:right;">+$' +
				(Math.round((earnings_total - stored) * 100) / 100).toFixed(2) +
				'</span>'
			);
			chrome.storage.local.set({'earnings_total': earnings_total});
		}
	});

	chrome.storage.local.get('earnings_transfer', function (data) {
		var stored = data.earnings_transfer || 0;

		if (stored !== earnings_transfer) {
			if (stored < earnings_transfer) {
				$('#transfer_earnings').prev().append(
					'<span style="float:right;">+$' +
					(Math.round((earnings_transfer - stored) * 100) / 100).toFixed(2) +
					'</span>'
				);
			}
			else {
				$('#transfer_earnings').prev().append(
					'<span style="float:right;">-$' +
					(Math.round((stored - earnings_transfer) * 100) / 100).toFixed(2) +
					'</span>'
				);
			}
			chrome.storage.local.set({'earnings_transfer': earnings_transfer});
		}
	});

	chrome.storage.local.get('hits_submitted', function (data) {
		var stored = data.hits_submitted || 0;

		if (stored !== hits_submitted) {
			$('td.metrics-table-first-value:contains(HITs Submitted)').append(
				'<span style="float:right;">+' +
				(hits_submitted - stored) +
				'</span>'
			);
			chrome.storage.local.set({'hits_submitted': hits_submitted});
		}
	});

	chrome.storage.local.get('hits_approved', function (data) {
		var stored = data.hits_approved || 0;

		if (stored !== hits_approved) {
			$('td.metrics-table-first-value:contains(... Approved)').append(
				'<span style="float:right;">+' +
				(hits_approved - stored) +
				'</span>'
			);
			chrome.storage.local.set({'hits_approved': hits_approved});
		}
	});

	chrome.storage.local.get('hits_rejected', function (data) {
		var stored = data.hits_rejected || 0;

		if (stored !== hits_rejected) {
			if (stored < hits_rejected) {
				$('td.metrics-table-first-value:contains(... Rejected)').append(
					'<span style="float:right;">+' +
					(hits_rejected - stored) +
					'</span>'
				);
			}
			else {
				$('td.metrics-table-first-value:contains(... Rejected)').append(
					'<span style="float:right;">-' +
					(stored - hits_rejected) +
					'</span>'
				); 
			}
			chrome.storage.local.set({'hits_rejected': hits_rejected});
		}
	});

	chrome.storage.local.get('hits_pending', function (data) {
		var stored = data.hits_pending || 0;

		if (stored !== hits_pending) {
			if (stored < hits_pending) {
				$('td.metrics-table-first-value:contains(... Pending)').append(
					'<span style="float:right;">+' +
					(hits_pending - stored) +
					'</span>'
				);
			}
			else {
				$('td.metrics-table-first-value:contains(... Pending)').append(
					'<span style="float:right;">-' +
					(stored - hits_pending) +
					'</span>'
				); 
			}
			chrome.storage.local.set({'hits_pending': hits_pending});
		}
	});


	chrome.storage.local.get('today_submitted', function (data) {
		var stored = data.today_submitted || 0;

		if (stored !== today_submitted) {
			$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).parent().next().append(
				'<span style="float:left;">+' +
				(today_submitted - stored) +
				'</span>'
			);
			chrome.storage.local.set({'today_submitted': today_submitted});
		}
	});

	chrome.storage.local.get('today_approved', function (data) {
		var stored = data.today_approved || 0;

		if (stored !== today_approved) {
			$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).parent().next().next().append(
				'<span style="float:left;">+' +
				(today_approved - stored) +
				'</span>'
			);
			chrome.storage.local.set({'today_approved': today_approved});
		}
	});

	chrome.storage.local.get('today_rejected', function (data) {
		var stored = data.today_rejected || 0;

		if (stored !== today_rejected) {
			if (stored < today_rejected) {
				$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).parent().next().next().next().append(
					'<span style="float:left;">+' +
					(today_rejected - stored) +
					'</span>'
				);
			}
			else {
				$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).parent().next().next().next().append(
					'<span style="float:left;">-' +
					(stored - today_rejected) +
					'</span>'
				); 
			}
			chrome.storage.local.set({'today_rejected': today_rejected});
		}
	});

	chrome.storage.local.get('today_pending', function (data) {
		var stored = data.today_pending || 0;

		if (stored !== today_pending) {
			if (stored < today_pending) {
				$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).parent().next().next().next().next().append(
					'<span style="float:left;">+' +
					(today_pending - stored) +
					'</span>'
				);
			}
			else {
				$('a[href^="/mturk/statusdetail?encodedDate"]:contains(Today)').eq(0).parent().next().next().next().next().append(
					'<span style="float:left;">-' +
					(stored - today_pending) +
					'</span>'
				);
			}
			chrome.storage.local.set({'today_pending': today_pending});
		}
	});
}


chrome.storage.local.get('date', function (data) {
	var stored = data.date || 'date';

	if (today) {
		var date = today.split('encodedDate=')[1];

		if (stored !== date) {
			chrome.storage.local.set({'date': date});
			chrome.storage.local.set({'today_submitted': 0});
			chrome.storage.local.set({'today_approved': 0});
			chrome.storage.local.set({'today_rejected': 0});
			chrome.storage.local.set({'today_pending': 0});
		}
	}
	_changes_storage();
});


$("td.metrics-table-first-value:contains(... Approved)").next().next().text(
	approval_rating
);
$("td.metrics-table-first-value:contains(... Rejected)").next().next().text(
	rejection_rating
);

$("td.metrics-table-first-value:contains(... Pending)").append(
	'<span style="color: #FFA500;" title="The number of rejections you need to drop your approval rating below 99%."> (' +
	under_99 +
	' ≥ 99%)</span>' +
	'<span style="color: #FF0000;" title="The number of rejections you need to drop your approval rating below 95%."> (' +
	under_95 +
	' ≥ 95%)</span>'
);

$("td.metrics-table-first-value:contains(... Pending)").next().next().replaceWith(
	'<td>' +
	'<div style="color: #008000;" title="Your approval rating if all of your pending HITs get approved.">' +
	best_case_scenario +
	'</div>' +
	'<div style="color: #FF0000;" title="Your approval rating if all of your pending HITs get rejected.">' +
	worst_case_scenario +
	'</div>' +
	'</td>'
);

//***** Creates "Total Earnings By Year" for the current year *****//
var $rewards =
    $('#table_yearly_earnings').find('span.reward')
;
var thisyear =
    earnings_total
;

for (var i = 0; i < $rewards.length; i ++) {
    thisyear -= Number($rewards.eq(i).text().replace(/[^0-9.]/g, ''));
}

$('#table_yearly_earnings').find('tr.metrics-table-header-row').after(
    '<tr class="odd">' +
        '<td class="metrics-table-first-value">2016</td>' +
        '<td id="yearly_earnings_amount">' +
            '<span class="reward">' +
                '$' + 
                Number(thisyear.toFixed(2)).toLocaleString('en') +
            '</span>' +
        '</td>' +
    '</tr>'
);