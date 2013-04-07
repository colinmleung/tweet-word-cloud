define(['text!templates/index.html'], function(indexTemplate) {
    var indexView = Backbone.View.extend({
        initialize: function () {
            //this.model.bind('change', this.render, this);
        },
        
        el: $('#content'),
        
        render: function () {
            this.$el.html(indexTemplate);
        }
    });
    
    return indexView;
});