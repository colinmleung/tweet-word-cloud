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
    updateCloud(data.hashtagcounts);
});

function updateCloud(datasource) {
    // calculate range of counts and count changes
    var max_count = 0,
        min_count = 0,
        max_count_change = 0,
        min_count_change = 0;
    var count = datasource.length;
    for (var i = 0; i < count; i++) {
        if (datasource[i].count > max_count) {
            max_count = datasource[i].count;
        }
        if (datasource[i].count < min_count) {
            min_count = datasource[i].count;
        }
        if (datasource[i].count_change > max_count_change) {
            max_count_change = datasource[i].count_change;
        }
        if (datasource[i].count_change < min_count_change) {
            min_count_change = datasource[i].count_change;
        }
    }
    /*console.log('max_count: ' + max_count);
    console.log('min_count: ' + min_count);*/
    console.log('max_count_change: '+max_count_change);
    console.log('min_count_change: '+min_count_change);
    
    // calculate and change to destination colors and sizes
    var dest_color, dest_weight;
    for (var i = 0; i < count; i++) {
        console.log('datasource['+i+'].count: '+datasource[i].count);
        console.log('datasource['+i+'].count_change: '+datasource[i].count_change);
        dest_weight = Math.round((datasource[i].count - min_count) / (max_count - min_count) * 9.0) + 1;
        //console.log('dest_weight: '+dest_weight);
        if (datasource[i].count_change > 0) {
            if (max_count_change !== 0) {
                dest_color = 4 + Math.round(datasource[i].count_change / max_count_change * 4);
            } else {
                dest_color = 4;
            }
        } else {
            if (min_count_change !== 0) {
                dest_color = 4 - Math.round(datasource[i].count_change / min_count_change * 4);
            } else {
                dest_color = 4;
            }
        }
        console.log('datasource['+i+'].hashtag: '+datasource[i].hashtag);
        changeColorAndSize("span[rel='" + datasource[i].hashtag + "'] a", dest_color, dest_weight);
    }
    
    function changeColorAndSize(selector, dest_color, dest_weight) {
        var color;
        switch (dest_color) {
            case 0:
                color = "#0000ff";
                break;
            case 1:
                color = "#1F00DF";
                break;
            case 2:
                color = "#3F00BF";
                break;
            case 3:
                color = "#5F009F";
                break;
            case 4:
                color = "#7F007F";
                break;
            case 5:
                color = "#9F005F";
                break;
            case 6:
                color = "#BF003F";
                break;
            case 7:
                color = "#DF001F";
                break;
            case 8:
                color = "#ff0000";
                break;
        }
        var weight;
        switch (dest_weight) {
            case 1:
                weight = "100%";
                break;
            case 2:
                weight = "150%";
                break;
            case 3:
                weight = "200%";
                break;
            case 4:
                weight = "250%";
                break;
            case 5:
                weight = "300%";
                break;
            case 6:
                weight = "350%";
                break;
            case 7:
                weight = "400%";
                break;
            case 8:
                weight = "450%";
                break;
            case 9:
                weight = "500%";
                break;
            case 10:
                weight = "550%";
                break;
        }
        $(selector).animate({ fontSize: weight, color: color }, 500);
    }
}

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
        color: "#ffffff"
    }, 500);
    $(selector).animate({
        color: orig_color
    }, 500);
}

$(function () {
    loadCloud(hashtagcounts);
});