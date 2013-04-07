define(['text!templates/tweetfeed.html'], function (tweetfeedTemplate) {
	var tweetfeedView = Backbone.View.extend({
		el: $('#content'),
		
		render: function () {
			this.$el.html(tweetfeedTemplate);
		}
	});
	
	return tweetfeedView;
});