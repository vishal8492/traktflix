'use strict';

var Item = require('./item.js');

function ItemParser() {}

ItemParser.isReady = function checkPage() {
  var scrubber = document.querySelector('.ellipsize-text');
  return scrubber !== null;
};

ItemParser.parse = function parse(callback) {
  console.log("Parsing item");
  var item;
  var playerStatus = document.querySelector('.ellipsize-text');
  var type = playerStatus.children.length > 2 ? 'show' : 'movie';
  var mainTitle;
  console.log("Parsing item",playerStatus);
  if (type === 'show') {
    mainTitle = playerStatus.querySelector('h4').textContent;
    var episodeInfo = playerStatus.querySelectorAll('span');
    var episode = episodeInfo[0].textContent.match(/\d+/g);
    var season = episode[0];
    var number = episode[1];
    var title = episodeInfo[1].textContent;

    item = new Item({
      epTitle: title,
      title: mainTitle,
      season: season,
      episode: number,
      type: type
    });
  } else {
    mainTitle = playerStatus.textContent;
    item = new Item({ title: mainTitle, type: type });
  }

  callback.call(this, item);
};

ItemParser.start = function start(callback) {
  var readyTimeout;

  if (ItemParser.isReady()) {
    ItemParser.parse(callback);
  } else {
    readyTimeout = setTimeout(function() {
      if (ItemParser.isReady()) {
        clearTimeout(readyTimeout);
        ItemParser.parse(callback);
      } else {
        ItemParser.start(callback);
      }
    }, 500);
  }
};

module.exports = ItemParser;
