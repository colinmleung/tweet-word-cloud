define(['router'], function(router) {
    var initialize = function () 
    {
        window.location.hash = 'index';
        Backbone.history.start();
    };
    
    return {
        initialize: initialize
    };
});