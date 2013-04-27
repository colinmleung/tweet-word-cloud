var socket = io.connect('http://localhost');
socket.emit('join hashtagcloud');

$(function () {
    loadCloud(hashtagcounts, '#content');
});

var eligible_elements;
socket.on('hashtag tweet', function (data) {
    eligible_elements = $("span[rel='" + data.hashtag + "']");
    var length = eligible_elements.length;
    for (var i = 0; i < length; i++) {
        blink($(eligible_elements[i]));
    }
});

socket.on('update cloud', function (data) {
    // do the quicksand transition
    loadCloud(hashtagcounts, '#contentupdate');
    $('#content').quicksand($('#contentupdate span'));
});

var colorLookupTable = [ "#0000ff", "#1F00DF", "#3F00BF", "#5F009F", "#7F007F", "#9F005F", "#BF003F", "#DF001F", "#ff0000" ];

function loadCloud(datasource, target_sel) {
    var mod_hashtagcounts = [];

    $.map(datasource, function(val, i) {
        mod_hashtagcounts[i] = {};
        mod_hashtagcounts[i].text = val.hashtag;
        mod_hashtagcounts[i].weight = val.count;
        mod_hashtagcounts[i].link = window.location.pathname + val.hashtag;
        mod_hashtagcounts[i].html = { "data-id": val.hashtag };
        mod_hashtagcounts[i].afterWordRender = function loadColors() {
            var changeClass;
            var count = datasource.length;
            for (var i = 0; i < count; i++) {
                if (datasource[i].hashtag == this.attr('data-id')) {
                    if (datasource[i].count_change > 0) {
                        if (max_positive !== 0) {
                            changeClass = 4 + Math.round(datasource[i].count_change / max_positive * 4);
                        } else {
                            changeClass = 4;
                        }
                    } else {
                        if (max_negative !== 0) {
                            changeClass = 4 - Math.round(datasource[i].count_change / max_negative * 4);
                        } else {
                            changeClass = 4;
                        }
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
    
    $(target_sel).jQCloud(mod_hashtagcounts, { width: $(window).width()*0.95, height: $(window).height()*0.95});
}

function blink(selector) {
    $(selector).animate({
        color: "#ffffff"
    }, 500);
    $(selector).animate({
        color: colorLookupTable[$(selector).attr('class').slice(-1)]
    }, 500);
}

$.expr[':'].textEquals = function(a, i, m) {
	return $(a).text().match("^" + m[3] + "$");
};