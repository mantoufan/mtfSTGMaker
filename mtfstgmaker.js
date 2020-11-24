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
     * @param {Integer} opt.width 宽
     * @param {Integer} opt.height 高
     * @param {Integer} opt.speed 速度
     */
    function MovableObject(opt) {
        opt = opt || Object.create(null)
        this.x = opt.x
        this.y = opt.y
        this.width = opt.width
        this.height = opt.height
        this.speed = opt.speed
        this.status = 0 // 实例状态：0 活（默认） -1 应回收 >= 0 状态与图标索引对应
        MovableObject.load.call(this)
    }
    /**
     * 静态方法：读取imgSrc引用的图片
     */
    MovableObject.load = function() {
        if (!this.constructor.icons && this.constructor.iconSrcs) {
            var _this = this
            this.constructor.icons = []
            this.constructor.iconSrcs.forEach(function(src) {
                var icon = new Image()
                icon.src = src
                icon.onload = function() {
                    _this.constructor.icons.push(icon)
                }
            })
        }
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
     * 方法：绘制
     */
    MovableObject.prototype.draw = function() {
        // 绘制前调用
        this.constructor.beforeDraw && this.constructor.beforeDraw.call(this)
        if (this.constructor.icons && this.status > -1 && this.constructor.icons[this.status]) {
            context.drawImage(this.constructor.icons[this.status], this.x, this.y, this.width, this.height)
        } else {
            context.fillRect(this.x, this.y, this.width, this.height)
        }
    }
    /**
     * 原型：可射击对象
     * @param {Object} opt 对象属性
     * @param {Integer} opt.x 横坐标
     * @param {Integer} opt.y 纵坐标
     * @param {Integer} opt.width 宽
     * @param {Integer} opt.height 高
     * @param {Integer} opt.speed 速度
     * @param {Constructor} opt.Bullet 子弹的构造函数
     */
    function ShootingObject(opt) {
        opt = opt || Object.create(null)
        MovableObject.call(this, opt)
        this.Bullet = opt.Bullet
        this.bullets = []
    }
    inherit(ShootingObject, MovableObject)
    ShootingObject.prototype.shoot = function() {
        if (this.Bullet) {
            this.bullets.push(new this.Bullet())
        }
    }
    /**
     * 原型：飞机
     * @param {Object} opt 对象属性
     * @param {Integer} opt.x 横坐标
     * @param {Integer} opt.y 纵坐标
     * @param {Integer} opt.width 宽
     * @param {Integer} opt.height 高
     * @param {Integer} opt.speed 速度
     */
    function Plane(opt) {
        opt = opt || Object.create(null)
        Plane.iconSrcs = [CONF.planeIcon]
        opt.Bullet = PlaneBullet
        ShootingObject.call(this, opt)
    }
    inherit(Plane, ShootingObject)
    /**
     * 原型：飞机子弹
     * @param {Object} opt 对象属性
     * @param {Integer} opt.x 横坐标
     * @param {Integer} opt.y 纵坐标
     * @param {Integer} opt.width 宽
     * @param {Integer} opt.height 高
     * @param {Integer} opt.speed 速度
     */
    function PlaneBullet(opt) {
        MovableObject.call(this, opt)
    }
    /**
     * 静态方法：绘制前，子弹向上移动
     */
    PlaneBullet.beforeDraw = function() {
        if (this.y > canvas.height - CONF.canvasPadding) {
            this.move(0, -this.speed)
        } else {
            this.status = -1
        }
    }
    inherit(Plane, ShootingObject)
    /**
     * 方法：绘制飞机子弹
     */
    PlaneBullet.prototype.draw = function() {
        context.moveTo(this.x, this.y)
        context.lineTo(this.x, this.y - this.height)
        context.strokeStyle = '#fff'
        context.stroke()
    }
    /**
     * 原型：敌人
     * @param {Object} opt 对象属性
     * @param {Integer} opt.x 横坐标
     * @param {Integer} opt.y 纵坐标
     * @param {Integer} opt.size 大小
     * @param {Integer} opt.speed 速度
     */
    function Enemy(opt) {
        Enemy.iconSrcs = [CONF.enemyIcon, CONF.enemyBoomIcon]
        MovableObject.call(this, opt)
    }
    /**
     * 静态方法：绘制前，敌人水平往复，遇边界下移
     */
    Enemy.beforeDraw = function() {
        if (this.enemyDirection !== Enemy.enemyDirection) {
            this.move(0, this.speed)
            this.enemyDirection = Enemy.enemyDirection
        }
        this.move(Enemy.enemyDirection === 'right' ? this.speed : -this.speed , 0)
        if (!Enemy.enemyDirectionLock) {
            if (this.x <= CONF.canvasPadding || this.x >= canvas.width - CONF.canvasPadding - this.width) {
                Enemy.enemyDirectionLock = true
                // 帧任务队列：下一帧更新敌人移动方向
                FrameQueue.push(function() {
                    Enemy.enemyDirectionLock = false
                    Enemy.enemyDirection = Enemy.enemyDirection === 'right' ? 'left' : 'right'
                })
            }
        }
    }
    inherit(Enemy, MovableObject)

    // 全局配置
    var CONF = {
        status: 'start', // 游戏开始默认为开始中
        level: 10, // 游戏默认等级
        totalLevel: 6, // 总共6关
        numPerLine: 10, // 游戏默认每行多少个怪兽
        canvasPadding: 30, // 默认画布的内边距
        bulletSize: 10, // 默认子弹长度
        bulletSpeed: 10, // 默认子弹的移动速度
        enemySpeed: 5, // 默认敌人移动距离
        enemySize: 50, // 默认敌人的尺寸
        enemyGap: 10,  // 默认敌人之间的间距
        enemyIcon: './img/enemy.png', // 怪兽的图像
        enemyBoomIcon: './img/boom.png', // 怪兽死亡的图像
        enemyDirection: 'right', // 默认敌人一开始往右移动
        planeSpeed: 5, // 默认飞机每一步移动的距离
        planeSize: {
          width: 60,
          height: 100
        }, // 默认飞机的尺寸,
        planeIcon: './img/plane.png',
    }, canvas, context
    /**
     * 帧任务队列：每一帧时执行队列中的任务，并清空队列
     */
    var FrameQueue = []
    /**
     * 运行
     */
    var run = function() {
        var enemies = [], gap = CONF.enemySize + CONF.enemyGap,
        plane = new Plane({ // 飞机
            x: canvas.width - CONF.planeSize.width >> 1,
            y: canvas.height - CONF.canvasPadding - CONF.planeSize.height,
            width: CONF.planeSize.width,
            height: CONF.planeSize.height,
            speed: CONF.planeSpeed
        })
        for (var i = 0; i < CONF.level; i++) { // 敌人
            for (var j = 0, levelGap = gap * i; j < CONF.numPerLine; j++) {
                enemies.push(new Enemy({
                    x: CONF.canvasPadding + gap * j,
                    y: CONF.canvasPadding + levelGap,
                    width: CONF.enemySize,
                    height: CONF.enemySize,
                    speed: CONF.enemySpeed
                }))
            }
        }
         // 渲染
        function draw () {
            // 执行并清空任务 帧任务队列
            FrameQueue.forEach(function(cb) {
                cb()
            })
            FrameQueue.length = 0
            // 清空画布
            context.clearRect(CONF.canvasPadding, CONF.canvasPadding, canvas.width - CONF.canvasPadding, canvas.height - CONF.canvasPadding)
            enemies.forEach(function(enemy) {
                enemy.draw()
            })
            plane.bullets.forEach(function(bullet) {
                bullet.draw()
            })
            plane.draw()
            ;(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
                window.setTimeout(f, 1000 / 60)
            })(draw)
        }
        draw()
    }
    /**
     * 初始化
     */
    var init = function(_canvas, conf) {
        conf && Object.assign(CONF, conf)
        // 静态属性：敌人移动方向
        Enemy.enemyDirection = CONF.enemyDirection
        canvas = _canvas
        context = canvas.getContext('2d')
        run()
    }
    return {
        init: init
    }
})();