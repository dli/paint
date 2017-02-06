var Utilities = (function () {
    'use strict';

    return {
        swap: function (object, a, b) {
            var temp = object[a];
            object[a] = object[b];
            object[b] = temp;
        },

        clamp: function (x, min, max) {
            return Math.max(min, Math.min(max, x));
        },

        getMousePosition: function (event, element) {
            var boundingRect = element.getBoundingClientRect();
            return {
                x: event.clientX - boundingRect.left,
                y: event.clientY - boundingRect.top
            };
        }
    };
}());
