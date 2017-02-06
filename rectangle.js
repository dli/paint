var Rectangle = (function () {

    function Rectangle (left, bottom, width, height) {
        this.left = left;
        this.bottom = bottom;
        this.width = width;
        this.height = height;
    }

    Rectangle.prototype.getRight = function () {
        return this.left + this.width;
    };

    Rectangle.prototype.getTop = function () {
        return this.bottom + this.height;
    };

    Rectangle.prototype.setRight = function (right) {
        this.width = right - this.left;

        return this;
    };

    Rectangle.prototype.setTop = function (top) {
        this.height = top - this.bottom;

        return this;
    };

    Rectangle.prototype.clone = function () {
        return new Rectangle(this.left, this.bottom, this.width, this.height);
    };


    Rectangle.prototype.includeRectangle = function (rectangle) {
        var newRight = Math.max(this.getRight(), rectangle.getRight());
        var newTop = Math.max(this.getTop(), rectangle.getTop());

        this.left = Math.min(this.left, rectangle.left);
        this.bottom = Math.min(this.bottom, rectangle.bottom);

        this.setRight(newRight);
        this.setTop(newTop);

        return this;
    };

    Rectangle.prototype.intersectRectangle = function (rectangle) {
        var newRight = Math.min(this.getRight(), rectangle.getRight());
        var newTop = Math.min(this.getTop(), rectangle.getTop());

        this.left = Math.max(this.left, rectangle.left);
        this.bottom = Math.max(this.bottom, rectangle.bottom);

        this.setRight(newRight);
        this.setTop(newTop);

        return this;
    };

    Rectangle.prototype.translate = function (x, y) {
        this.left += x;
        this.bottom += y;

        return this;
    };

    Rectangle.prototype.scale = function (x, y) {
        this.left *= x;
        this.bottom *= y;

        this.width *= x;
        this.height *= y;

        return this;
    };

    Rectangle.prototype.round = function () {
        this.left = Math.round(this.left);
        this.bottom = Math.round(this.bottom);

        this.width = Math.round(this.width);
        this.height = Math.round(this.height);
    };

    Rectangle.prototype.getArea = function () {
        return this.width * this.height;
    };

    return Rectangle;
}());
