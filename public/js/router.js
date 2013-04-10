define(['views/index'], ['views/tweetfeed'], function (IndexView, TweetfeedView) {
    var TweetWordCloudRouter = Backbone.Router.extend({
        currentView: null,
        
        socketEvents: _.extend({}, Backbone.Events),
        
        routes: {
            "index": "index",
            "tweetfeed": "tweetfeed"
        },
        
        changeView: function (view) {
            if (null != this.currentView ) {
                this.currentView.undelegateEvents();
            }
            this.currentView = view;
            this.currentView.render();
        },
        
        index: function () {
            this.changeView(new IndexView({socketEvents: this.socketEvents}));
        },
		
		tweetfeed: function () {
			this.changeView(new TweetfeedView({socketEvents: this.socketEvents}));
		}
    });
    
    return new TweetWordCloudRouter();
});