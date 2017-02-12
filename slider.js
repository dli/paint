var Slider = (function () {
    'use strict';

    var SLIDER_THICKNESS = 2;
    var LEFT_COLOR = 'white';
    var RIGHT_COLOR = '#666666';
    var HANDLE_COLOR = 'white';

    function Slider (element, initialValue, minValue, maxValue, changeCallback) {
        var div = element;

        var height = element.offsetHeight;
        var length = element.offsetWidth;

        var sliderLeftDiv = document.createElement('div');
        sliderLeftDiv.style.position = 'absolute';
        sliderLeftDiv.style.width = length + 'px';
        sliderLeftDiv.style.height = SLIDER_THICKNESS.toFixed(0) + 'px';
        sliderLeftDiv.style.backgroundColor = LEFT_COLOR;
        sliderLeftDiv.style.top = (height / 2 - 1) + 'px';
        sliderLeftDiv.style.zIndex = 999;
        div.appendChild(sliderLeftDiv);

        var sliderRightDiv = document.createElement('div');
        sliderRightDiv.style.position = 'absolute';
        sliderRightDiv.style.width = length + 'px';
        sliderRightDiv.style.height = SLIDER_THICKNESS.toFixed(0) + 'px';
        sliderRightDiv.style.backgroundColor = RIGHT_COLOR;
        sliderRightDiv.style.top = (height / 2 - 1) + 'px';

        div.appendChild(sliderRightDiv);

        var handleDiv = document.createElement('div');
        handleDiv.style.position = 'absolute';
        handleDiv.style.width = height + 'px';
        handleDiv.style.height = height + 'px';
        handleDiv.style.borderRadius = height * 0.5 + 'px';
        handleDiv.style.cursor = 'ew-resize';
        handleDiv.style.background = HANDLE_COLOR;
        div.appendChild(handleDiv);

        var value = initialValue; 

        var redraw = function () {
            var fraction = (value - minValue) / (maxValue - minValue);

            sliderLeftDiv.style.width = fraction * length + 'px';
            sliderRightDiv.style.width = (1.0 - fraction) * length + 'px';
            sliderRightDiv.style.left = Math.floor(fraction * length) + 'px';
            handleDiv.style.left = (Math.floor(fraction * length) - div.offsetHeight / 2) + 'px';
            sliderRightDiv.width = (1.0 - fraction) * length + 'px';
        };

        var onChange = function (event) {
            var mouseX = Utilities.getMousePosition(event, div).x;

            value = Utilities.clamp((mouseX / length) * (maxValue - minValue) + minValue, minValue, maxValue);

            changeCallback(value);

            redraw();
        };

        var mousePressed = false;

        div.addEventListener('mousedown', function (event) {
            mousePressed = true;
            onChange(event);
        });

        document.addEventListener('mouseup', function (event) {
            mousePressed = false;
        });

        document.addEventListener('mousemove', function (event) {
            if (mousePressed) {
                onChange(event);
            }
        });

        div.addEventListener('touchstart', function (event) {
            event.preventDefault();

            var firstTouch = event.targetTouches[0];
            onChange(firstTouch);
        });

        div.addEventListener('touchmove', function (event) {
            event.preventDefault();

            var firstTouch = event.targetTouches[0];
            onChange(firstTouch);
        });

        this.setValue = function (newValue) {
            value = newValue;

            redraw();
        };

        this.getValue = function () {
            return value;
        };

        redraw();
    }

    return Slider;

}());
