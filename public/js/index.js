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
        mod_hashtagcounts[i].afterWordRender = function loadColors() {
            var changeClass;
            var count = datasource.length;
            for (var i = 0; i < count; i++) {
                if (datasource[i].hashtag == this.attr('rel')) {
                    if (datasource[i].count_change > 0) {
                        changeClass = 4 + Math.round(datasource[i].count_change / max_positive * 4);
                    } else {
                        changeClass = 4 - Math.round(datasource[i].count_change / max_negative * 4);
                    }
                    this.addClass('change'+changeClass);
                }
            }
        };
    });
    
    var max_positive = 0;
    var max_negative = 0;
    (function countChangeNormalization(datasource) {
        var count = datasource.length;
        for (var i = 0; i < count; i++) {
            if (datasource[i].count_change > max_positive) {
                max_positive = datasource[i].count_change;
            }
            if (datasource[i].count_change < max_negative) {
                max_negative = datasource[i].count_change;
            }
        }
    })(datasource);
    
    $("#content1").jQCloud(mod_hashtagcounts, { width: $(window).width()*0.95, height: $(window).height()*0.95});
}

function blink(selector) {
    var orig_color;
    switch ($(selector).attr('class').slice(-1)) {
        case "0":
            orig_color = "#0000ff";
            break;
        case "1":
            orig_color = "#1F00DF";
            break;
        case "2":
            orig_color = "#3F00BF";
            break;
        case "3":
            orig_color = "#5F009F";
            break;
        case "4":
            orig_color = "#7F007F";
            break;
        case "5":
            orig_color = "#9F005F";
            break;
        case "6":
            orig_color = "#BF003F";
            break;
        case "7":
            orig_color = "#DF001F";
            break;
        case "8":
            orig_color = "#ff0000";
            break;
    }
    $(selector).animate({
        color: "#fff"
    }, 500);
    $(selector).animate({
        color: orig_color
    }, 500);
}

loadCloud(hashtagcounts);