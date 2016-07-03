var striptags = require('striptags');
var entities = require('entities');

module.exports = [
  {uri: "https://stratechery.com/feed/",
   include: function(item) {
     return item.categories.indexOf('Podcasts') === -1;
   }},
  {uri: "http://www.windytan.com/feeds/posts/default?alt=rss"}
];
