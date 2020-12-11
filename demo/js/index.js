/**
 * mtfstgmkaer.js：业务逻辑
 */
var Index = (function (canvas, CONF) {
    /**
     * 业务初始化
     */
    var context = canvas.getContext('2d'), // 绘图上下文
        bgAudio = new Audio(), // 背景音乐
        defaultConf = JSON.parse(JSON.stringify(CONF)), // 默认配置
        /** 从框架导入：开始 */
        mtf = mtfSTGMaker(context),
        MovableObject = mtf.Proto.MovableObject, // 引入 可移动对象原型
        ShootingObject = mtf.Proto.ShootingObject, // 引入 可射击对象原型
        Utils = mtf.Utils, // 引入 工具包
        Loader = mtf.Loader, // 引入 加载类
        Control = mtf.Control, // 引入 控制类
        Storage = mtf.Storage, // 引入 记忆实例：用于保存读取进度
        Shop = mtf.Shop, // 引入 商店类
        Draw = mtf.Draw // 引入 绘制类
        /** 从框架导入：结束 */

    /** 业务原型：开始 */
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
        Plane.iconSrcs = [CONF.planeIcon, CONF.enemyBoomIcon]
        Plane.shootAudioSrc = CONF.planeShootAudio
        ShootingObject.call(this, opt)
    }
    Utils.inherit(Plane, ShootingObject)
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
        if (Utils.yIsOver(this.y - this.speed - this.height, this.height, CONF.canvasPadding)) {
            this.status = -1
        } else {
            this.move(0, -this.speed)
        }
    }
    Utils.inherit(PlaneBullet, MovableObject)
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
        this.move(Enemy.enemyDirection === 'right' ? this.speed : -this.speed, 0)
        if (!Enemy.enemyDirectionLock) {
            if (Utils.xIsOver(this.x, this.width, CONF.canvasPadding)) {
                Enemy.enemyDirectionLock = true
                // 帧任务队列：下一帧更新敌人移动方向
                FrameQueue.push(function() {
                    Enemy.enemyDirectionLock = false
                    Enemy.enemyDirection = Enemy.enemyDirection === 'right' ? 'left' : 'right'
                })
            }
        }
    }
    Utils.inherit(Enemy, MovableObject)
    /** 业务原型：结束 */

     /**
     * 业务帧任务队列：每一帧时执行队列中的任务，并清空队列
     */
    var FrameQueue = []
    
    /**
     * 业务配置初始化
     */
    var init = function () {
        Enemy.enemyDirection = CONF.enemyDirection // 静态属性：敌人移动方向
        /** 背景音乐 */
        if (bgAudio.src === '') {
            bgAudio.src = CONF.bgAudio
            bgAudio.loop = true // 背景音乐循环播放
            bgAudio.play()
        }
    }
    /**
     * 业务运行
     */
    var run = function () {
        /** 初始化配置 */
        init();
        var we = [], // 我方成员列表
            enemies = [] // 敌人列表
        /** 创建角色：我方 */
        for(var i = 0; i < CONF.planeNum; i++) {
            /** 飞机 */
            var plane = new Plane({
                x: (canvas.width - CONF.planeSize.width) / (CONF.planeNum + 1) * (i + 1),
                y: canvas.height - CONF.canvasPadding - CONF.planeSize.height,
                width: CONF.planeSize.width,
                height: CONF.planeSize.height,
                speed: CONF.planeSpeed,
                bullet: []
            })
            /** 飞机子弹 */
            var planeBulletObj = {
                constructor: PlaneBullet,
                opt: {
                    setX: function(plane, index, total) {
                        return plane.x + plane.width / (total + 1) * (index + 1)
                    },
                    setY: function(plane) {
                        return plane.y
                    },
                    width: 5,
                    height: CONF.bulletSize,
                    speed: CONF.bulletSpeed
                }
            }
            for(var j = 0; j < CONF.planeBulletNum; j++) {
                plane.bullet.push(planeBulletObj)
            }
            we.push(plane)
        }
        /** 创建角色：敌人 */
        var gap = CONF.enemySize + CONF.enemyGap // 敌人行高（敌人高度 + 敌人间距）
        for (var i = 0; i < CONF.level; i++) {
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
        // 控制器对象
        var control = Control({
            control: CONF.control,
            padding: CONF.canvasPadding
        })
        // 飞机射击：冷却时间参数装饰
        var planeShoot = Utils.throttle(function() {
            we.forEach(function(plane){
                plane.shoot()
            })
        }, CONF.bulletCoolownTime, false).bind(plane)
        // 绘制
        Draw(function() {
            // 执行并清空任务 帧任务队列
            FrameQueue.forEach(function(cb) {
                cb()
            })
            FrameQueue.length = 0
            // 清空画布
            context.clearRect(CONF.canvasPadding, CONF.canvasPadding, canvas.width - CONF.canvasPadding, canvas.height - CONF.canvasPadding)
            // 回调函数
            if (CONF.cb.draw(we, enemies) === false) return false
            // 碰撞检测：子弹和敌人
            we.forEach(function(plane){
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
                for (var i = plane.bullets.length; i--;) {
                    if (plane.bullets[i].status === -1) {
                        plane.bullets.splice(i, 1)
                    } else {
                        plane.bullets[i].draw()
                    }
                }
            })
            // 碰撞检测：飞机和敌人
            Utils.collision({
                camps: [we, enemies],
                cb: function(a) {
                    for(var i = 0; i < a.length; i++) {
                        a[i][0].status = -1
                        a[i][1].status = 1
                        CONF.cb.collision(a[i][0], a[i][1])
                    }
                }
            })
            // 主动控制：监听键盘和触屏，计算X和Y偏移量
            var pressed = control.pressed(), offsetX = 0, offsetY = 0
            if (CONF.control.autoShoot) pressed['shoot'] = true
            for (var key in pressed) {
                if (pressed[key]) {
                    switch(key) {
                        case 'up':
                            offsetY = -plane.speed
                        break;
                        case 'right':
                            offsetX =  plane.speed
                        break;
                        case 'down':
                            offsetY =  plane.speed
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
            control.draw() // 触屏绘制虚拟按键
            // 绘制和回收：我方
            for (var i = we.length; i--;) {
                if (we[i].status === -1) {
                    we.splice(i, 1)
                } else {
                    if (!(offsetX && Utils.xIsOver(we[i].x + offsetX, we[i].width, CONF.canvasPadding) || 
                          offsetY && Utils.yIsOver(we[i].y + offsetY, we[i].height, CONF.canvasPadding))) {
                          we[i].move(offsetX, offsetY)
                    }
                    we[i].draw()
                }
            }
            // 绘制和回收：敌人
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
        })
    }

    return {
        run: run, // 运行
        preload: function(cb) { // 预加载
            Loader.load(CONF, cb)
        },
        reload: function() { // 重载配置（重置）
            Object.assign(CONF, defaultConf, {cb: CONF.cb});
        },
        shop: function() { // 商店
            return Shop({
                conf: CONF,
                autoSave: CONF.shop.autoSave,
                items: CONF.shop.items,
            })
        },
        pause: function() { // 暂停
            var isPause = Utils.pause()
            CONF.cb.pause(isPause)
        },
        silence: function() { // 静音
            var isSilence = Utils.silence()
            isSilence && bgAudio.src ? bgAudio.pause() : bgAudio.play()
            CONF.cb.silence(isSilence)
        },
        Storage: Storage // 记忆实例：用于保存读取进度
    }
})