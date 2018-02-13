'use strict';

var Request = require('../request.js');
var Settings = require('../settings.js');

function Search(options) {
  this.item = options.item;
  this.url = Settings.apiUri + '/search';
  this.showsUrl = Settings.apiUri + '/shows';
  this.episodeRaw = Settings.apiUri + '/search/episode?query='
};

Search.prototype = {
  getUrl: function() {
    //check if title contains year
    var title=this.item.title;
    var query= '?query=' + encodeURIComponent(title);
    var year=/\([0-9]{4}\)$/.test(this.item.title);
    if(year){
      var years=this.item.title.slice(this.item.title.length,this.item.title.length-4);
      title = title.substr(0,this.item.title.length-5);
      query='?query=' + encodeURIComponent(title) +'&years='+years
    }
    return this.url + '/' + this.item.type +query;
  },

  getEpisodeUrl: function(slug) {
    if (this.item.episode) {
      return this.showsUrl + '/' + slug + '/seasons/' + this.item.season
        + '/episodes/' + this.item.episode + '?extended=images';
    } else if(this.item.epTitle){
      return this.episodeRaw + encodeURIComponent(this.item.epTitle);
    }else{
      return this.showsUrl + '/' + slug + '/seasons/' + this.item.season
          + '?extended=images';
    }
  },

  findItem: function(options) {
    Request.send({
      method: 'GET',
      url: this.getUrl(),
      success: function(response) {
        console.log("response",response);
        var data = JSON.parse(response)[0];
        console.log("data",data);

        if (data == undefined) {
          options.error.call(this, 404);
        } else {
          options.success.call(this, data);
        }
      },
      error: function(status, response, opts) {
        options.error.call(this, status, response, opts);
      }
    });
  },

  findEpisodeByTitle: function(show, response, options) {
    var episodes = JSON.parse(response);
    var episode;

    for (var i = 0; i < episodes.length; i++) {
      if (this.item.epTitle && episodes[i].title && episodes[i].title.toLowerCase() === this.item.epTitle.toLowerCase()) {
        episode = episodes[i];
        break;
      }
    }

    if (episode) {
      options.success.call(this, Object.assign(episode, show));
    } else {
      options.error.call(this, 404, 'Episode not found.', {show: show, item: this.item});
    }
  },

  findEpisode: function(options) {
    this.findItem({
      success: function(response) {
        Request.send({
          method: 'GET',
          url: this.getEpisodeUrl(response['show']['ids']['slug']),
          success: function(resp) {
            console.log("find episode response",resp);
            if (this.item.episode) {
              options.success.call(this, Object.assign(JSON.parse(resp), response));
            } else if (this.item.epTitle){
              var episodes = JSON.parse(resp);
              console.log("parsed obj",episodes);
              var ep = episodes[0].episode;
              options.success.call(this, Object.assign(ep, response));
            }else{
              this.findEpisodeByTitle(response, resp, options);
            }
          }.bind(this),
          error: function(st, resp, opts) {
            options.error.call(this, st, resp, opts);
          }
        });
      }.bind(this),
      error: function(status, response, opts) {
        options.error.call(this, status, response, opts);
      }
    });
  },

  find: function(options) {
    if (this.item.type == 'show') {
      console.log("Searching episode");
      this.findEpisode(options);
    } else {
      console.log("Searching item");
      this.findItem(options);
    }
  }
};

module.exports = Search;
