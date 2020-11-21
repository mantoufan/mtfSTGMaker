/*!
 * Javascript Plugin：mtfstgmaker.js 1.0.0
 * https://github.com/mantoufan/mtfSTGMaker
 *
 * Copyright 2020, 吴小宇 Shon Ng
 * https://github.com/mantoufan
 * 
 * Date: 2020-09-20T18:02Z
 */
var mtfSTGMaker = (function() {
    /**
     * 原型：可移动对象
     */
    function MovableObject(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * 移动
     * @param {String<left|right|up|down>} direction 移动方向 
     * @param {Number} step 移动速度
     */
    MovableObject.prototype.move = function(direction, step) {
        switch (direction) {
            case 'left':
                this.x -= step;
                break;
            case 'right':
                this.x += step;
                break;
            case 'up':
                this.y -= step;
                break;
            case 'down':
                this.y += step;
                break;
            default:
                break;
        }
    }

    /**
     * 原型：可射击对象
     */
    function ShootingObject(x, y) {
        MovableObject.call(this, x, y)
    }
    return {

    }
})();