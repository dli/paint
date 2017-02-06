var Buttons = (function () {
    'use strict';

    var Buttons = function (element, buttonNames, initialActiveIndex, changeCallback) {

        var elements = [];
        for (var i = 0; i < buttonNames.length; ++i) {
            var button = document.createElement('div');
            button.innerHTML = buttonNames[i];
            element.appendChild(button);
            elements.push(button);
        }

        var activeElement = elements[initialActiveIndex];

        var refresh = function () {
            for (var i = 0; i < elements.length; ++i) {
                if (elements[i] === activeElement) {
                    elements[i].className = 'quality-selected';
                } else {
                    elements[i].className = 'quality-unselected';
                }
            }
        };

        for (var i = 0; i < elements.length; ++i) {
            (function () { //create closure to store index
                var index = i;
                var clickedElement = elements[i];
                elements[i].addEventListener('click', function () {
                    if (activeElement !== clickedElement) {
                        activeElement = clickedElement;

                        changeCallback(index);

                        refresh();
                    }

                });
            }());
        }

        refresh();
    };

    return Buttons;
}());
