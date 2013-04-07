$(function() {
    $.ajax({
        url: 'https://userstream.twitter.com/1.1/user.json',
        dataType: 'jsonp',
        success: function(result) {
            alert('success');
        },
        error: function(err) {
            alert('err');
        }
    });
});