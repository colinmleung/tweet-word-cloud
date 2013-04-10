define(['text!templates/tweetfeed.html'], function (tweetfeedTemplate) {
	var tweetfeedView = Backbone.View.extend({
		el: $('#content'),
        
        events: {
        },
        
        initialize: function(options) {
            this.socketEvents = options.socketEvents;
        },
		
		render: function () {
			this.$el.html(tweetfeedTemplate);
		}
	});
	
	return tweetfeedView;
});