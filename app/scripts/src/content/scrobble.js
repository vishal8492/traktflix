'use strict';

var Request = require('../request.js');
var Settings = require('../settings.js');

function Scrobble(options) {
  if (options.type === 'show') {
    this.item = { episode: options.response };
  } else {
    var movie = options.response.movie || {};
    movie.type = 'movie';
    this.item = { movie: movie };
  }

  this.onProgressChange();
  this.url = Settings.apiUri + '/scrobble';
  this.success = options.success;
  this.error = options.error;
  this.startProgressTimeout();
};

Scrobble.prototype = {
  startProgressTimeout: function() {
    this.progressChangeInterval = setTimeout(function() {
      this.onProgressChange();
      clearTimeout(this.progressChangeInterval);
      this.startProgressTimeout();
    }.bind(this), 3000);
  },

  stopProgressTimeout: function() {
    clearInterval(this.progressChangeInterval);
  },

  onProgressChange: function() {
    this.webScrubber();
  },

  webScrubber: function() {
    var scrubber = document.querySelector('.player-scrubber-progress-completed');
    this.progress = parseFloat(scrubber.style.width);
    console.log("progress scrobble",this.progress);
  },

  getRemainingTime: function() {
    var timeLabel = document.querySelector('time');
    if (timeLabel) {
      return parseInt(timeLabel.textContent.replace(':', '').replace(':', ''));
    }
  },

  _sendScrobble: function(options) {
    var params = this.item;
    params.progress = this.progress;

    Request.send({
      method: 'POST',
      url: this.url + options.path,
      params: params,
      success: this.success,
      error: this.error
    });
  },

  start: function() {
    this._sendScrobble({ path: '/start' });
  },

  pause: function() {
    this._sendScrobble({ path: '/pause' });
  },

  stop: function() {
    this._sendScrobble({ path: '/stop' });
    this.stopProgressTimeout();
  }
};

module.exports = Scrobble;
