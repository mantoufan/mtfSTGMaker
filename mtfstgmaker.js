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
     * 函数：子类仅继承父类原型链上的方法，构造函数正确
     * @param {Constructor} subType 
     * @param {Constructor} superType 
     */
    function inherit(subType, superType) {
        var prototype = Object.create(superType.prototype)
            prototype.constructor = subType
            subType.prototype = prototype
    }
    /**
     * 原型：可移动对象
     * @param {Object} opt 对象属性
     * @param {Integer} opt.x 横坐标
     * @param {Integer} opt.y 纵坐标
     * @param {Integer} opt.size 大小
     * @param {Integer} opt.speed 速度
     */
    function MovableObject(opt) {
        this.x = opt.x || 0
        this.y = opt.y || 0
        this.size = opt.size || 0
        this.speed = opt.speed || 0
    }
    /**
     * 方法：移动
     * @param {Integer} x 水平偏移量
     * @param {Integer} y 竖直偏移量
     */
    MovableObject.prototype.move = function(offsetX, offsetY) {
        this.x += offsetX
        this.y += offsetY
    }
    /**
     * 原型：可射击对象
     * @param {Integer} x 水平偏移量
     * @param {Integer} y 竖直偏移量
     */
    function ShootingObject(x, y) {
        MovableObject.call(this, x, y)
    }
    inherit(ShootingObject, MovableObject)
    ShootingObject.prototype.shoot = function() {

    }
    return {

    }
})();