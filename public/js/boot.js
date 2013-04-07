require.config({
    paths: {
        jquery: '/js/libs/jquery',
        Underscore: '/js/libs/underscore',
        Backbone: '/js/libs/backbone',
        models: 'models',
        jqcloud: '/js/libs/jqcloud',
        text: '/js/libs/text',
        templates: '../templates',
		Sockets: '/js/libs/socket.io/socket.io'
    },
    
    shim: {
		'jquery': {
			'exports': '$'
		},
		'jqcloud': ['jquery'],
        'Backbone': ['Underscore', 'jquery'],
        'TweetWordCloud': ['Backbone', 'jqcloud']
    }
});

require(['TweetWordCloud'], function (TweetWordCloud) {
    TweetWordCloud.initialize();
});