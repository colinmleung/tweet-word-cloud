$(function () {
  
  (function pulse() {
    $('header').delay(1000).fadeOut('slow').delay(50).fadeIn('slow', function () {
        if (tweet_container.tweet_array.length === 0) {
            pulse();
        }
    });
  })();
  
  var tweet_container = {
    tweet_array: [],
    
    push: function (tweet) {
      this.tweet_array.unshift(tweet);
      this.render();
    },
    
    render: function () {
      if (this.tweet_array.length > 5) {
        $('div.tweetbox').first().fadeOut('slow', function () {
            this.remove();
        });
        this.tweet_array.pop();
      }
      $('div#content').append('<div class="tweetbox">' + this.tweet_array[0] + '</div>');
      $('div.tweetbox').last().fadeIn('slow');
    }
  };
  
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
        tweet_container.push(data.tweet);
    //}
  });
});