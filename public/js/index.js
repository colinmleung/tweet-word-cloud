var socket = io.connect('http://localhost');
socket.emit('join hashtagcloud');

$(function () {
    loadCloud(hashtagcounts, '#content');
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
    if ($('div span').length === 0) {
        loadCloud(hashtagcounts, '#content');
    } else {
        loadCloud(hashtagcounts, '#contentupdate');
        //$('#content').quicksand($('#contentupdate span'));
    }
});

socket.on('no tags', function () {
    printNoTagsMsg();
});

var colorLookupTable = [ "#0000ff", "#1F00DF", "#3F00BF", "#5F009F", "#7F007F", "#9F005F", "#BF003F", "#DF001F", "#ff0000" ];
var fontSizeLookupTable = [ "100%", "150%", "200%", "250%", "300%", "350%", "400%", "450%", "500%", "550%" ];

/*function updateCloud(datasource) {
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
    console.log('max_count: ' + max_count);
    console.log('min_count: ' + min_count);
    //console.log('max_count_change: '+max_count_change);
    //console.log('min_count_change: '+min_count_change);
    
    // calculate and change to destination colors and sizes
    var cloud_elements = $('div span')
    var cloud_count = $('div span').length;
    
    var dest_color, dest_weight;
    console.log('START NEW ');
    var found;
    for (var i = 0; i < cloud_count; i++) {
        found = false;
        for (var j = 0; j < datasource.length; j++) {
            if (datasource[j].hashtag == $(cloud_elements[i]).attr('rel')) {
                //console.log('datasource['+j+'].count: '+datasource[j].count);
                //console.log('datasource['+j+'].count_change: '+datasource[j].count_change);
                dest_weight = Math.round((datasource[j].count - min_count) / (max_count - min_count) * 9.0) + 1;
                //console.log('dest_weight: '+dest_weight);
                if (datasource[j].count_change > 0) {
                    if (max_count_change !== 0) {
                        dest_color = 4 + Math.round(datasource[j].count_change / max_count_change * 4);
                    } else {
                        dest_color = 4;
                    }
                } else {
                    if (min_count_change !== 0) {
                        dest_color = 4 - Math.round(datasource[j].count_change / min_count_change * 4);
                    } else {
                        dest_color = 4;
                    }
                }
                //console.log('datasource['+j+'].hashtag: '+datasource[j].hashtag);
                changeColorAndSize(datasource[j].hashtag, dest_color, dest_weight);
                
                // eliminate data from datasource
                datasource.splice(j, 1);
                found = true;
            }
        }
        if (found == false) {
            $(cloud_elements[i]).addClass('replace');
            console.log($(cloud_elements[i]).attr('rel') + ' marked for replacement');
        }
    }
    
    // replace these words with new ones
    for (var i = 0; i < datasource.length; i++) {
        //change text and rel
        console.log($('div span.replace').first().attr('rel') + " getting replaced with " + datasource[i].hashtag);
        $('div span.replace').first().attr('rel', datasource[i].hashtag).removeClass('replace').empty();
        // add link
        $("span:textEquals('" + datasource[i].hashtag + "')").append('<a href="/'+ datasource[i].hashtag +'">'+ datasource[i].hashtag +'</a>');
        
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
        
        changeColorAndSize(datasource[i].hashtag, dest_color, dest_weight);
    }
    
    function changeColorAndSize(hashtag, dest_color, dest_weight) {
        $("span:textEquals('" + hashtag + "')").animate({ fontSize: fontSizeLookupTable[dest_weight-1], color: colorLookupTable[dest_color] }, 1000);
    }
}*/

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