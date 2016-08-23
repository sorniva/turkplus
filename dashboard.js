var dashboard = {};

chrome.storage.onChanged.addListener( function (changes) {
  for (var key in changes) {
    if (key === 'dash_popup') {
      _dashboard();
    }
    if (key === 'tpe') {
      var new_tpe = changes[key].newValue;
      $('#tpe').text('$' + new_tpe.toFixed(2));
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  _get_tpe();
  _dashboard();
  _get_dashboard();
});

function _get_tpe () {
  chrome.storage.local.get('tpe', function (data) {
    var stored = data.tpe || 0;
    $('#tpe').text('$' + stored.toFixed(2));
  });
}

function _dashboard () {
  chrome.storage.local.get('dash_popup', function (data) {
    dashboard = data.dash_popup || {};
    
    for (var a in dashboard) {
      if (dashboard.hasOwnProperty(a)) {
        $('.dash').eq(a).html(dashboard[a]);
      }
    }
  });
}

function _get_dashboard () {
  $.get('https://www.mturk.com/mturk/dashboard', function (data) {
    var _ = $(data);
    var err = _.find('.error_title:contains(You have exceeded the maximum allowed page request rate for this website.)').length;

    if (err) {
      setTimeout(function () { _get_dashboard(); }, 3000);
    }
    else {
      var aa = 4, bb = 5, $elem = _.find('a[href^="/mturk/statusdetail?encodedDate"]').parents('tr');

      var dash_popup = {
        // Total Earnings
        0 : _.find('#approved_hits_earnings_amount').text(),
        1 : _.find('#bonus_earnings_amount'        ).text(),
        2 : _.find('#total_earnings_amount'        ).text(),
        3 : _.find('#transfer_earnings'            ).text(),
        
        // HIT Totals
        4 : _.find('td.metrics-table-first-value:contains(HITs Submitted)').next().text(),
        5 : _.find('td.metrics-table-first-value:contains(... Approved)'  ).next().text(),
        7 : _.find('td.metrics-table-first-value:contains(... Rejected)'  ).next().text(),
        9 : _.find('td.metrics-table-first-value:contains(... Pending)'   ).next().text(),
        6 : _.find('td.metrics-table-first-value:contains(... Approved)'  ).next().next().text(),
        8 : _.find('td.metrics-table-first-value:contains(... Rejected)'  ).next().next().text(),
      };
      
      // HIT Status
      for (var i = 10; i < ($elem.length * 5) + 10; i ++) { 
        var cc = ++ bb % 6;
        dash_popup[i] = $elem.eq(aa).children().eq(cc).text().trim();
        aa = cc === 5 ? aa - 1 : aa; 
      }

      chrome.storage.local.set({'dash_popup': dash_popup});
    }
  });
}