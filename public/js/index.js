var socket = io.connect('http://realtimetagcloud.com');
socket.emit('join hashtagcloud');

$(function () {
    loadCloud(hashtagcounts, '#content', function () {
        $('div span').fadeTo('slow', 1);
    });
});

var eligible_elements;
socket.on('hashtag tweet', function (data) {
    eligible_elements = $("span:textEquals('" + data.hashtag + "')");
    var length = eligible_elements.length;
    for (var i = 0; i < length; i++) {
        blink($(eligible_elements[i]));
    }
});

$.expr[':'].textEquals = function(a, i, m) { 
    return $(a).text().match("^" + m[3] + "$");
};

socket.on('update cloud', function (data) {
    hashtagcounts = data.hashtagcounts;
    if ($('div span').length === 0) {
        loadCloud(hashtagcounts, '#content');
    } else {
        $('#content').fadeTo('slow', 0, function () {
            $('#content').empty();
            $('#content').css({opacity: 1});
            if ($('div span').length === 0) {
                loadCloud(hashtagcounts, '#content', function () {
                    $('div span').fadeTo('slow', 1);
                });
            }
        });
    }
});

socket.on('no tags', function () {
    printNoTagsMsg();
});

var colorLookupTable = [ "#0000ff", "#1F00DF", "#3F00BF", "#5F009F", "#7F007F", "#9F005F", "#BF003F", "#DF001F", "#ff0000" ];
var fontSizeLookupTable = [ "100%", "150%", "200%", "250%", "300%", "350%", "400%", "450%", "500%", "550%" ];

function loadCloud(datasource, target_sel, callback) {
    var mod_hashtagcounts = [];

    $.map(datasource, function(val, i) {
        mod_hashtagcounts[i] = {};
        mod_hashtagcounts[i].text = val.hashtag;
        mod_hashtagcounts[i].weight = val.count;
        mod_hashtagcounts[i].link = window.location.pathname + val.hashtag;
        mod_hashtagcounts[i].html = { "data-id": val.hashtag, style: "opacity: 0;" };
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
    
    $(target_sel).jQCloud(mod_hashtagcounts, { width: $(window).width()*0.95, height: $(window).height()*0.95, afterCloudRender: callback});
}

function blink(selector) {
    $(selector).animate({
        color: "#ffffff"
    }, 500);    
    if (!($(selector).attr('class'))) {
        console.log("BAD SELECTOR: " + selector);
    }
    $(selector).animate({
        color: colorLookupTable[$(selector).attr('class').slice(-1)]
    }, 500);
}

function printNoTagsMsg() {
    $('content').empty().append('Waiting on tweets...');
}