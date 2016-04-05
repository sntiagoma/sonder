"use strict";
module.exports = function(app){
app.filter('msToMin', function() {
    return function(milliseconds, withHour) {
        var seconds = parseInt((milliseconds / 1000) % 60);
        var minutes = parseInt((milliseconds / (100060)) % 60);
        var hours = parseInt((milliseconds / (100060 * 60)) % 24);
        var out = "";
        if (withHour) {
            hours = (hours < 10) ? "0" + hours : hours;
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            out = hours + ":" + minutes + ":" + seconds;
        } else {
            minutes = (parseInt(minutes) + (60 * parseInt(hours)));
            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;
            out = minutes + ":" + seconds;
        }
        return out;
    };
});

}