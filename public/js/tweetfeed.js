$(function () {
  
  (function pulse() {
    $('header').delay(500).fadeTo('slow', 0).delay(500).fadeTo('slow', 1, function () {
        if ($('div.tweetbox').length === 0) {
            pulse();
        }
    });
  })();
  
  function remove() { // calls itself until tweet_array is empty
    console.log('tweetbox length: '+$('div.tweetbox').length);
    if ($('div.tweetbox').length >= 5) {
      console.log('removing: ' + $('div.tweetbox').first());
      $('div.tweetbox').first().fadeOut(1000, function() {
            this.remove();
            add();
      });
      
    } else {
      add();
    }
  };
  
  function add () {
    var tweet = tweet_array[0];
      $('div#content').append('<div class="tweetbox">' + tweet + '</div>');
      $('div.tweetbox').last().fadeIn(1000, function() {
        tweet_array.shift();
        console.log('Add called');
        if (tweet_array.length > 0) {
          remove();
        }
      });
  }
  
  var tweet_array = [];
  var socket = io.connect('http://localhost');
  socket.emit('join tweetfeed', { hashtag: hashtag_name });
  socket.on('tweet', function(data) {
    /*console.log(data.tweet);
    var word_array = data.tweet.split(' ');
    var count = word_array.length;
    for (var i = 0; i < count; i++) {
        if (word_array[i].indexOf('#') >= 0 || word_array[i].indexOf('@') >= 0 || word_array[i] === "RT") {
            word_array[i] = "";
        }
    }
    word_array = $.trim(word_array.join(''));
    if (word_array !== "") {*/
        tweet_array.push(data.tweet); // to take out is shift
        console.log('Tweet_array count @ push: '+tweet_array.length);
        if (tweet_array.length == 1) {
          console.log('Remove called');
          remove();
        }
    //}
  });
});