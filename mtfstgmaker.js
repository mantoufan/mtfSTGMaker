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
        level: 3, // 游戏默认等级
        totalLevel: 6, // 总共6关
        numPerLine: 1, // 游戏默认每行多少个怪兽
        canvasPadding: 30, // 默认画布的内边距
        bulletSize: 10, // 默认子弹长度
        bulletSpeed: 10, // 默认子弹的移动速度
        bulletCoolownTime: 100, // 默认子弹的冷却时间（秒）
        enemySpeed: 2, // 默认敌人移动距离
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
        },
        cb: {
            draw: function() {}, // 渲染时回调
            collision: function() {} // 碰撞时回调
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
        /**
         * 判断实例的X坐标是否越界
         * @param {Integer} x 实例的X坐标
         * @param {Integer} width 实例的宽度
         */
        xIsOver: function (x, width) {
            return x <= CONF.canvasPadding || x >= canvas.width - CONF.canvasPadding - width
        },
        /**
         * 判断实例的Y坐标是否越界
         * @param {Integer} y 实例的Y坐标
         * @param {Integer} height 实例的高度
         */
        yIsOver: function (y, height) {
            return y <= CONF.canvasPadding || y >= canvas.height - CONF.canvasPadding - height
        },
        /**
         * AABB：找出一维投影相交，且阵营不同的实例对
         * @param {Array[[Integer, Boolean, Integer, Integer]...]} points 二维数组[[坐标投影值, 是否开始（1是，0结束）, 实例的阵营ID，实例ID（自定义）]...]
         * @param {Function(Integer, Integer, Integer, Integer)} cb 每检测到投影相交的一对实例的回调函数（①实例的阵营ID，①实例ID，②实例的阵营ID，②实例ID）
         */
        AABB: function (points, cb) {
            var camps = [], campsHash = Object.create(null)
            points.sort((a, b) => a[0] - b[0] || b[1] - b[0]) // 按坐标投影值升序。若坐标投影值相同，开始在前
            for (var i = 0; i < points.length; i++) {
                var v = points[i], isStart = v[1], campId = v[2], pointId = v[3]
                if (isStart) { // 遇开始，实例 放入 待检测集合
                    if (camps[campId]) {
                        campsHash[campId + ',' + pointId] = camps[campId].length // 哈希表记忆索引，降低数组删除复杂度
                        camps[campId].push([campId, pointId])
                    } else {
                        camps[campId] = [[campId, pointId]]
                        campsHash[campId + ',' + pointId] = 0
                    }
                    for (var j = 0; j < camps.length; j++) { // 遍历 待检测集合
                        if (j === campId || camps[j] === void 0) continue // 相同阵营 或 阵营无实例 跳过
                        for (var k = 0; k < camps[j].length; k++) { // 取出 不同阵营 中 实例
                            if (camps[j][k] === void 0) continue // 跳过 已移除 实例
                            var _v = camps[j][k], _campId = _v[0], _pointId = _v[1]
                                cb && cb(campId, pointId, _campId, _pointId)
                        }
                    }
                } else { // 遇结束，实例 从 待检测集合 移除
                    delete camps[campId][campsHash[campId + ',' + pointId]]
                    delete campsHash[campId + ',' + pointId]
                }
            }
        },
        /**
         * 碰撞检测：找出所有碰撞，且阵营不同的实例对
         * @param {Object} opt 选项
         * @param {Array[[]...]} opt.camps 阵营列表 [[我方实例集合], [敌方实例集合]...]
         * @param {Function(Array[[]...])} opt.cb 找到所有碰撞的实例的回调函数([[碰撞的实例对]...])
         */
        collision: function(opt) {
            opt = opt || Object.create(null)
            var res = [], pointsX = []
            if (opt.camps) {
                // 遍历取出实例在X轴的投影，x坐标，标记起止位置，实例的阵营ID，实例ID
                for (var campId = 0; campId < opt.camps.length; campId++) {
                    var points = opt.camps[campId]
                    for(var pointId = 0; pointId < points.length; pointId++) {
                        if (points[pointId].status === 0) {
                            pointsX.push([points[pointId].x, true, campId, pointId], 
                                        [points[pointId].x + points[pointId].width, false, campId, pointId])
                        }
                    }
                }
                // 通过AABB算法粗检测，筛选出X轴投影碰撞的实例。再在Y轴碰撞检测
                this.AABB(pointsX, function (campId, pointId, _campId, _pointId) {
                    var point = opt.camps[campId][pointId], _point = opt.camps[_campId][_pointId]
                    if (!(point.y > _point.y + _point.height || point.y + point.height < _point.y)) {
                        res.push([point, _point])
                    }
                })
            }
            opt.cb && opt.cb(res)
        },
        /**
         * 节流及防抖
         * @param {Function}} fn 函数 
         * @param {Integer} delay 延迟时间（秒） 节流：延迟时间即执行时间间隔 防抖：重复执行将重置延迟时间
         * @param {Boolean} isDebounce 是否开启防抖，默认为节流
         * @return {Function} 返回函数
         */
        throttle: function(fn, delay, isDebounce) {
            var timer = null
            return function() {
                var _this = this, args = arguments
                if (isDebounce && timer) {
                    clearTimeout(timer)
                    timer = null
                }
                if (timer === null) {
                    timer = setTimeout(function() {
                        timer = null
                        fn.apply(_this, args)
                    }, delay)
                }
            }
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
        // 装饰冷却时间参数的飞机射击
        var planeShoot = Utils.throttle(plane.shoot, CONF.bulletCoolownTime, false).bind(plane)
         // 渲染
        ;(function draw () {
            // 执行并清空任务 帧任务队列
            FrameQueue.forEach(function(cb) {
                cb()
            })
            FrameQueue.length = 0
            // 清空画布
            context.clearRect(CONF.canvasPadding, CONF.canvasPadding, canvas.width - CONF.canvasPadding, canvas.height - CONF.canvasPadding)
            // 回调函数
            if (CONF.cb.draw([plane], enemies) === false) return
            // 碰撞检测
            Utils.collision({
                camps: [plane.bullets, enemies],
                cb: function(a) {
                    for(var i = 0; i < a.length; i++) {
                        a[i][0].status = -1
                        a[i][1].status = 1
                        CONF.cb.collision(a[i][0], a[i][1])
                    }
                }
            })
            for (var i = enemies.length; i--;) {
                if (enemies[i].status === -1) {
                    enemies.splice(i, 1)
                } else {
                    if (enemies[i].status === 1) {
                        if (enemies[i].delay === 30) {
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
            if (CONF.control.autoShoot) pressed['shoot'] = true
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
                            planeShoot()
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