var playerLoop = function(interval, statusUrl, serial) {
	var $ = jQuery;
	
	// get the status from the server
	$.ajax({
		url: statusUrl,
		dataType: 'json',
		success: function(response) {
			if (!serial) {
				// if we don't have a serial yet, get the latest from the server
				serial = response.serial;
				setTimeout(function() {
					playerLoop(interval, statusUrl, serial);
				}, interval);
			}
			else {
				// compare our serial to the response
				if (serial < response.serial) {
					// play the sound
					playerPlay(response);
					// renew the loop
					if ($.cookie('playerState') === 'on') {
						setTimeout(function() {
							playerLoop(interval, statusUrl, response.serial);
						}, interval);
					}
				}
				else {
					if ($.cookie('playerState') === 'on') {
						setTimeout(function() {
							playerLoop(interval, statusUrl, serial);
						}, interval);
					}
				}
			}
		},
		error: function(response) {
			setTimeout(function() {
				playerLoop(interval, statusUrl, serial);
			}, interval);
		}
	});
};

var playerPlay = function(sound) {
	var $ = jQuery;
	var audio = $('<audio autoplay>');
	$('.playerPlayer').empty()
		.append(audio);
	audio.attr('src', sound.url);
	$('.playerStatus').text('Last Played: ' + sound.title);
};

jQuery(document).ready(function() {
	var $ = jQuery;
	var content = $('#content').empty();
	
	// draw interface
	var playerContainer = $('<div class="playerContainer"></div>')
		.append('<div class="playerPlayer"></div>')
		.append('<div class="playerStatus">No sounds played yet</div>')
		.appendTo(content);
	var commandsContainer = $('<div class="commands"></div>').appendTo(content);

	// set player to off by default, unless a cookie says otherwise
	var player = playerContainer.find('.playerPlayer');
	var playerState = $.cookie('playerState');
	if (playerState === 'on') {
		// start the player
		player.addClass('on');
		playerLoop(1000, Drupal.settings.basePath + 'soundoff/status');
	}
	else {
		player.addClass('off');
	}
	player.bind('click', function() {
		var cookieOptions = {expires: 999};
		var playerState = $.cookie('playerState');
		if (playerState === 'on') {
			player.removeClass('on')
				.addClass('off');
			$.cookie('playerState', 'off', cookieOptions);
		}
		else {
			player.removeClass('off')
				.addClass('on');
			$.cookie('playerState', 'on', cookieOptions);
			playerLoop(1000, Drupal.settings.basePath + 'soundoff/status');
		}
	});
	
	
	// get all possible sounds
	$.get(Drupal.settings.basePath + 'soundoff/commands', function(response) {
		for (var i=0; i < response.commands.length; i++) {
			var command = response.commands[i];
			var commandDiv = $('<div class="command"></div>');
			commandDiv.text(command.title)
				.bind('click', command, function(e) {
					$.get(Drupal.settings.basePath + 'soundoff/commands/' + e.data.command);
					$('.playerStatus').text('Played: ' + e.data.title);
				})
				.appendTo('.commands');
		}
	}, 'json');

	// add link to extension
	content.append('<a href="' + Drupal.settings.basePath + 'sites/default/files/soundboard_controller.crx">Download the Chrome extension</a>');
});