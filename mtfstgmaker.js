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
        this.constructor.beforeDraw && this.constructor.beforeDraw.call(this) // 绘制前调用
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
     * @param {Constructor} opt.bullet.constructor 子弹类型
     * @param {Constructor} opt.bullet.opt 子弹配置
     * @param {Integer} opt.bullet.opt.x 子弹横坐标
     * @param {Integer} opt.bullet.opt.y 子弹纵坐标
     * @param {Function(new ShootingObject)} opt.bullet.opt.setX 子弹横坐标：传入发射子弹实例
     * @param {Function(new ShootingObject)} opt.bullet.opt.setY 子弹纵坐标：传入发射子弹实例
     * @param {Integer} opt.bullet.opt.width 子弹宽度
     * @param {Integer} opt.bullet.opt.height 子弹高度
     * @param {Integer} opt.bullet.opt.speed 子弹速度
     */
    function ShootingObject(opt) {
        opt = opt || Object.create(null)
        MovableObject.call(this, opt)
        this.bullet = opt.bullet
        this.bullets = []
    }
    inherit(ShootingObject, MovableObject)
    ShootingObject.prototype.shoot = function() {
        if (this.bullet) {
            
            this.bullet.opt = this.bullet.opt || Object.create(null)
            if (this.bullet.opt.setX) {
                this.bullet.opt.x = this.bullet.opt.setX(this)
            }
            if (this.bullet.opt.setY) {
                this.bullet.opt.y = this.bullet.opt.setY(this)
            }
            this.bullets.push(new this.bullet.constructor(
                this.bullet.opt
            ))
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
     * @param {Constructor} opt.bullet.constructor 子弹类型
     * @param {Constructor} opt.bullet.opt 子弹配置
     * @param {Integer} opt.bullet.opt.x 子弹横坐标
     * @param {Integer} opt.bullet.opt.y 子弹纵坐标
     * @param {Function(new ShootingObject)} opt.bullet.opt.setX 子弹横坐标：传入发射子弹实例
     * @param {Function(new ShootingObject)} opt.bullet.opt.setY 子弹纵坐标：传入发射子弹实例
     * @param {Integer} opt.bullet.opt.width 子弹宽度
     * @param {Integer} opt.bullet.opt.height 子弹高度
     * @param {Integer} opt.bullet.opt.speed 子弹速度
     */
    function Plane(opt) {
        opt = opt || Object.create(null)
        Plane.iconSrcs = [CONF.planeIcon]
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
        if (Utils.yIsOver(this.y - this.speed - this.height, this.height)) {
            this.status = -1
        } else {
            this.move(0, -this.speed)
        }
    }
    inherit(PlaneBullet, MovableObject)
    /**
     * 方法：绘制飞机子弹
     */
    PlaneBullet.prototype.draw = function() {
        this.constructor.beforeDraw && this.constructor.beforeDraw.call(this) // 绘制前调用
        context.beginPath()
        context.moveTo(this.x, this.y)
        context.lineTo(this.x, this.y - this.height)
        context.strokeStyle = '#fff'
        context.stroke()
        context.closePath()
    }
    /**
     * 原型：敌人
     * @param {Object} opt 对象属性
     * @param {Integer} opt.x 横坐标
     * @param {Integer} opt.y 纵坐标
     * @param {Integer} opt.size 大小
     * @param {Integer} opt.speed 速度
     * @param {String} opt.enemyDirection 移动方向
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
            if (Utils.xIsOver(this.x, this.width)) {
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
    /**
     * 帧任务队列：每一帧时执行队列中的任务，并清空队列
     */
    var FrameQueue = []

    // 全局配置
    var CONF = {
        status: 'start', // 游戏开始默认为开始中
        level: 10, // 游戏默认等级
        totalLevel: 6, // 总共6关
        numPerLine: 0, // 游戏默认每行多少个怪兽
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
        planeIcon: './img/plane.png',// 飞机的图像
        control: {// 自定义按键
            up: 'ArrowUp',
            right: 'ArrowRight',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            shoot: 'Space',
            autoShoot: true // 自动射击（移动端自动开启）
        }
    }, canvas, context

    /**
     * 控制对象
     */
    var Control = (function(CONF) {
        var up = false, right = false, down = false, left = false, shoot = false
        function processKey (e, eventName) {
            var b = eventName === 'keydown'
            switch(e.code) {
                case CONF.control.up:
                    up = b
                break;
                case CONF.control.right:
                    right = b
                break;
                case CONF.control.down:
                    down = b
                break;
                case CONF.control.left:
                    left = b
                break;
                case CONF.control.shoot:
                    shoot = b
                break;
            }
        }
        document.addEventListener('keydown', function(e){processKey(e, 'keydown')})
        document.addEventListener('keyup', function(e){processKey(e, 'keyup')})
        return {
            pressed: function() {
                return {
                    up: up,
                    right: right,
                    down: down,
                    left: left,
                    shoot: shoot
                }
            }
        }
    })(CONF)

    /**
     * 通用方法类
     */
    var Utils = {
        xIsOver: function (x, width) {
            return x <= CONF.canvasPadding || x >= canvas.width - CONF.canvasPadding - width
        },
        yIsOver: function (y, height) {
            return y <= CONF.canvasPadding || y >= canvas.height - CONF.canvasPadding - height
        },
        collision: function(opt) {
            if (opt.objs) {
                for(var i = 0; i < opt.objs.length; i++) {
                    
                }
            }
        }
    }

    /**
     * 主线程
     */
    var MainThread = {
        init:function () {

        }
    }
    /**
     * 运行
     */
    var run = function () {
        var enemies = [], gap = CONF.enemySize + CONF.enemyGap,
        plane = new Plane({ // 飞机
            x: canvas.width - CONF.planeSize.width >> 1,
            y: canvas.height - CONF.canvasPadding - CONF.planeSize.height,
            width: CONF.planeSize.width,
            height: CONF.planeSize.height,
            speed: CONF.planeSpeed,
            bullet: {
                constructor: PlaneBullet,
                opt: {
                    setX: function(plane) {
                        return plane.x + plane.width / 2
                    },
                    setY: function(plane) {
                        return plane.y
                    },
                    width: 5,
                    height: CONF.bulletSize,
                    speed: CONF.bulletSpeed
                }
            }
        })
        for (var i = 0; i < CONF.level; i++) { // 敌人
            for (var j = 0, levelGap = gap * i; j < CONF.numPerLine; j++) {
                enemies.push(new Enemy({
                    x: CONF.canvasPadding + gap * j,
                    y: CONF.canvasPadding + levelGap,
                    width: CONF.enemySize,
                    height: CONF.enemySize,
                    speed: CONF.enemySpeed,
                    enemyDirection: CONF.enemyDirection
                }))
            }
        }
         // 渲染
        (function draw () {
            // 执行并清空任务 帧任务队列
            FrameQueue.forEach(function(cb) {
                cb()
            })
            FrameQueue.length = 0
            // 清空画布
            context.clearRect(CONF.canvasPadding, CONF.canvasPadding, canvas.width - CONF.canvasPadding, canvas.height - CONF.canvasPadding)
            // 碰撞检测
            Utils.collision({
                objs: [plane.bullets, enemies],
                cb: function(ar) {
                    for(var i = 0; i < ar.length; i++)
                        ar[i][0].status = -1
                        ar[i][1].status = 1
                }
            })
            for (var i = enemies.length; i--;) {
                if (enemies[i].status === -1) {
                    enemies.splice(i, 1)
                } else {
                    if (enemies[i].status === 1) {
                        if (enemies[i].delay === 3) {
                            enemies[i].status = -1
                        } else {
                            enemies[i].delay = (enemies[i].delay || 0) + 1
                        }
                    }
                    enemies[i].draw()
                }
            }
            for (var i = plane.bullets.length; i--;) {
                if (plane.bullets[i].status === -1) {
                    plane.bullets.splice(i, 1)
                } else {
                    plane.bullets[i].draw()
                }
            }
            var pressed = Control.pressed(), offsetX = 0, offsetY = 0
            for (var key in pressed) {
                if (pressed[key]) {
                    switch(key) {
                        case 'up':
                            offsetY = -plane.speed
                        break;
                        case 'right':
                            offsetX = plane.speed
                        break;
                        case 'down':
                            offsetY = plane.speed
                        break;
                        case 'left':
                            offsetX = -plane.speed
                        break;
                        case 'shoot':
                            plane.shoot()
                        break;
                    }
                }
            }
            if (!(offsetX && Utils.xIsOver(plane.x + offsetX, plane.width) || 
                  offsetY && Utils.yIsOver(plane.y + offsetY, plane.height))) {
                plane.move(offsetX, offsetY)
            }
            plane.draw()
            ;(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
                window.setTimeout(f, 1000 / 60)
            })(draw)
        })()
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