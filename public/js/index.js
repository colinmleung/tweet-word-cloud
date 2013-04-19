var socket = io.connect('http://localhost');
socket.emit('join hashtagcloud');

var eligible_elements;
socket.on('hashtag tweet', function (data) {
    eligible_elements = $("span[rel='" + data.hashtag + "']");
    var length = eligible_elements.length;
    for (var i = 0; i < length; i++) {
        blink($(eligible_elements[i]));
    }
});
socket.on('update cloud', function (data) {
    $('#content1').empty();
    loadCloud(data.hashtagcounts);
});

function loadCloud(datasource) {
    var mod_hashtagcounts = [];

    $.map(datasource, function(val, i) {
        mod_hashtagcounts[i] = {};
        mod_hashtagcounts[i].text = val.hashtag;
        mod_hashtagcounts[i].weight = val.count;
        mod_hashtagcounts[i].link = window.location.pathname + val.hashtag;
        mod_hashtagcounts[i].html = { rel: val.hashtag };
    });
    
    $("#content1").jQCloud(mod_hashtagcounts, { width: $(window).width()*0.95, height: $(window).height()*0.95});
    
    function loadColors(datasource)
    {
        var count = datasource.length;
        for (var i = 0; i < count; i++) {
            datasource[i].count_change; // NOT FINISHED
        }
    }
}



function blink(selector) {
    var orig_color;
    switch ($(selector).attr("class")) {
        case "w1":
            orig_color = "#aab5f0";
            break;
        case "w2":
            orig_color = "#99ccee";
            break;
        case "w3":
            orig_color = "#a0ddff";
            break;
        case "w4":
            orig_color = "#90c5f0";
            break;
        case "w5":
            orig_color = "#90a0dd";
            break;
        case "w6":
            orig_color = "#90c5f0";
            break;
        case "w7":
            orig_color = "#39d";
            break;
        case "w8":
            orig_color = "#0cf";
            break;
        case "w9":
            orig_color = "#0cf";
            break;
        case "w10":
            orig_color = "#0cf";
            break;
    };
    $(selector).animate({
        color: "#fff"
    }, 500);
    $(selector).animate({
        color: orig_color
    }, 500);
}

loadCloud(hashtagcounts);