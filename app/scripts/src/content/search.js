'use strict';

var Request = require('../request.js');
var Settings = require('../settings.js');

function Search(options) {
  this.item = options.item;
  this.url = Settings.apiUri + '/search';
  this.showsUrl = Settings.apiUri + '/shows';
};

Search.prototype = {
  getUrl: function() {
    return this.url + '?type=' + this.item.type + '&query=' + this.item.title;
  },

  getEpisodeUrl: function(slug) {
    return this.showsUrl + '/' + slug + '/seasons/' + this.item.season
      + '/episodes/' + this.item.episode + '?extended=images';
  },

  findMovie: function(options) {
    Request.send({
      method: 'GET',
      url: this.getUrl(),
      success: function(response) {
        var data = JSON.parse(response)[0];
        options.success.call(this, data);
      },
      error: function(status, response) {
        options.error.call(this, status, response);
      }
    });
  },

  findEpisode: function(options) {
    Request.send({
      method: 'GET',
      url: this.getUrl(),
      success: function(response) {
        var data = JSON.parse(response)[0];

        /* House of Cards has an 1990 version, with same title
        I need to priorize the 2013 version
        Unfortunately, i couldn't figure out a better way to this by now */
        if (this.item.title === 'House of Cards') {
          JSON.parse(response).map(function(item) {
            if (item.show.year === 2013) {
              data = item;
            }
          });
        }

        Request.send({
          method: 'GET',
          url: this.getEpisodeUrl(data['show']['ids']['slug']),
          success: function(resp) {
            options.success.call(this, JSON.parse(resp));
          },
          error: function(st, resp) {
            options.error.call(this, st, resp);
          }
        });
      }.bind(this),
      error: function(status, response) {
        options.error.call(this, status, response);
      }
    });
  },

  find: function(options) {
    if (this.item.type == 'show') {
      this.findEpisode(options);
    } else {
      this.findMovie(options);
    }
  }
};

module.exports = Search;