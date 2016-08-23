chrome.storage.onChanged.addListener( function (changes) {
  for (var key in changes) {
    if (key === '__quals') {
      _show_quals();
    }
    if (key === 'tpe') {
      var new_tpe = changes[key].newValue;
      $('#tpe').text('$' + new_tpe.toFixed(2));
    }
  }
});

chrome.runtime.onMessage.addListener( function (request) {
  if (request.msg == 'sync_quals_status') { _status(request.data); }
});

document.addEventListener('DOMContentLoaded', function () {
  _get_tpe();
  _show_quals();
  _get_number();
});

$('html').on('click', '#qualsync', function() {
  chrome.runtime.sendMessage({msg: 'sync_quals'});
  $('#tbody').html('<tr><th>Syncing...</th></tr>');
});

function _get_tpe () {
  chrome.storage.local.get('tpe', function (data) {
    var stored = data.tpe || 0;
    $('#tpe').text('$' + stored.toFixed(2));
  });
}

function _status (status) {
  var html = '<tr><th>' + status + '</th></tr>';
  $('#tbody').html(html);
}

function _show_quals () {
  chrome.storage.local.get('__quals', function (data) {
    var q1 = data.__quals || {}, html = 'No qualifications were found.'

    var s1 = Object.keys(q1).sort( function (a, b) {
      return q1[a].title.toLowerCase().localeCompare(q1[b].title.toLowerCase());
    });

    for (var i = 0; i < s1.length; i ++) {
      var k1 = s1[i];
      
     html +=
       '<tr width="100%">' +
       '  <td>' + q1[k1].assigned +'</td>' +
       '  <td>' + q1[k1].title +'</td>' +
       '  <td>' + q1[k1].author + '</td>' +
       '  <td>' + q1[k1].value + '</td>' +
       '</tr>'
     ;
    }
    $('#tbody').html(html);
  });
}

function _get_number () {
  chrome.storage.local.get('qcount', function (data) {
    var count = data.qcount || 0, html = '<span>'+ count +'</span>';
    $('#count').html(html);
    _scrape();
    function _scrape () {
      $.get('https://www.mturk.com/mturk/findquals?earned=true&requestable=false', function (data) {
        var _ = $(data);
        var pre = _.find('td[class="error_title"]:contains(You have exceeded the maximum allowed page request rate for this website.)').length;
        var qcount, $qcount = _.find('td.title_orange_text').eq(0)
      
        if ($qcount.length) {
          qcount = parseInt($qcount.text().trim().split(' ')[2]);
        }
        
        if (qcount !== count) {
          if (qcount > count) {
            html = '<span>'+ qcount +'</span><span style="color: green"> (+' + (qcount - count) + ')</span>';
          }
          else {
            html = '<span>'+ qcount +'</span><span style="color: red"> (-' + (count - qcount) + ')</span>';
          }
          $('#count').html(html);
          chrome.storage.local.set({'qcount': qcount});
        }
      });
    }
  });
}