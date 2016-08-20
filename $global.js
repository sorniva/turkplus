chrome.storage.local.get('tpe', function (data) {
	var stored = data.tpe || 0;

	$('#subtabs_and_searchbar').prepend(
		'<b style="position: absolute; right: 8px; margin-top: -15px; color: #CC6600;">' +
		'Today\'s Projected Earnings: ' +
		'<span id="helper_earnings" style="color: #008000; cursor: pointer;">' +
		'$' +
		stored.toFixed(2) +
		'<span>' +
		'</b>'
	);
});

// Listen for storage change events.
chrome.storage.onChanged.addListener( function (changes) {
	for (var key in changes) {
		if (key === 'tpe') {
			var new_tpe = changes[key].newValue;
			$('#helper_earnings').text('$' + new_tpe.toFixed(2));
		}
	}
});