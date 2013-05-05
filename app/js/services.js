'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('bedManagement.services', []).
  value('version', '0.1').
  constant('SW_DELAI', 1000).
  constant('START_TIME', 1000).
  factory('stopwatch', function (SW_DELAI,START_TIME,$timeout) {
    var data = { 
            value: START_TIME,
            laps: []
        },
        stopwatch = null;
        
    var start = function (val) {;
        stopwatch = $timeout(function() {
        	data.value+=val;
            start(val);
        }, SW_DELAI);
    };

    var stop = function () {
        $timeout.cancel(stopwatch);
        stopwatch = null;
    };

    var reset = function () {
        stop()
        data.value = START_TIME;
        data.laps = [];
    };

    return {
        data: data,
        start: start,
        stop: stop,
        reset: reset
    };
});
