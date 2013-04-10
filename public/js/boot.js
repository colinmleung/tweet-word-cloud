require.config({
    paths: {
        jquery: '/js/libs/jquery',
        Underscore: '/js/libs/underscore',
        Backbone: '/js/libs/backbone',
        jqcloud: '/js/libs/jqcloud',
        text: '/js/libs/text',
        templates: '../templates',
        socketio: '../socket.io/socket.io'
    },
    
    shim: {
		'jquery': {
			'exports': '$'
		},
        'socketio': {
            'exports': 'io'
        },
		'jqcloud': ['jquery'],
        'Backbone': ['Underscore', 'jquery'],
        'TweetWordCloud': ['Backbone', 'jqcloud', 'socketio']
    }
});

require(['TweetWordCloud'], function (TweetWordCloud) {
    TweetWordCloud.initialize();
});