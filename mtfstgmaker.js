/*!
 * Javascript Plugin：mtfstgmaker.js 1.0.0
 * https://github.com/mantoufan/mtfSTGMaker
 *
 * Copyright 2020, 吴小宇 Shon Ng
 * https://github.com/mantoufan
 * 
 * Date: 2020-12-10T18:02Z
 */
var mtfSTGMaker = function(context) {
    /**
     * 通用方法实例
     */
    var Utils = {
        /**
         * 函数：子类仅继承父类原型链上的方法，构造函数正确
         * @param {Constructor} subType 
         * @param {Constructor} superType 
         */
        inherit: function (subType, superType) {
            var prototype = Object.create(superType.prototype)
                prototype.constructor = subType
                subType.prototype = prototype
        },
        /**
         * 判断实例的X坐标是否越界
         * @param {Integer} x 实例的X坐标
         * @param {Integer} width 实例的宽度
         * @param {Integer} padding 边距
         */
        xIsOver: function (x, width, padding) {
            width = width || 0
            padding = padding || 0
            return x < padding || x > canvas.width - padding - width
        },
        /**
         * 判断实例的Y坐标是否越界
         * @param {Integer} y 实例的Y坐标
         * @param {Integer} height 实例的高度
         * @param {Integer} padding 边距
         */
        yIsOver: function (y, height, padding) {
            height = height || 0
            padding = padding || 0
            return y <= padding || y >= canvas.height - padding - height
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
                        res.push(campId < _campId ? [point, _point] : [_point, point])
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
        },
        /**
         * 暂停
         */
        pause: function() {
            return isPause = !isPause
        },
        /**
         * 静音
         */
        silence: function() {
            return isSilence = !isSilence
        },
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
            this.constructor.iconSrcs.forEach(function(src, index) {
                var icon = new Image()
                icon.src = src
                icon.onload = function() {
                    _this.constructor.icons[index] = icon
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
    Utils.inherit(ShootingObject, MovableObject)
    ShootingObject.prototype.shoot = function() {
        var self = this
        if (self.bullet) {
            self.bullet.forEach(function(bullet, index, ar) {
                bullet.opt = bullet.opt || Object.create(null)
                if (bullet.opt.setX) {
                    bullet.opt.x = bullet.opt.setX(self, index, ar.length)
                }
                if (bullet.opt.setY) {
                    bullet.opt.y = bullet.opt.setY(self, index, ar.length)
                }
                self.bullets.push(new bullet.constructor(
                    bullet.opt
                ))
            }) 
        }
        if (!isSilence && this.constructor.shootAudioSrc) {
            var audio = new Audio(this.constructor.shootAudioSrc)
            audio.play()
        }
    }
    
    /**
     * 资源加载实例
     * @return {Function} load 预加载资源列表的方法
     */
    var Loader = (function() {
        /**
         * 
         * @param {Array|Object} resList 资源列表（包含资源链接的数组或对象）
         * @param {Function(progress)} cb 每加载完一个资源回调，并传入加载进度1 - 100
         */
        function load(resList, cb) {
            var imgList = [], audioList = []
            for(var i in resList) {
                if (/.(png|gif|jpg|webp)$/.test(resList[i])) {
                    imgList.push(resList[i])
                    
                } else if (/.(mp3|m4a|wav)$/.test(resList[i])) {
                    audioList.push(resList[i])
                }
            }
            var total = imgList.length + audioList.length, loadedNum = 0
            if (imgList.length) {
                for(var i = 0; i < imgList.length; i++) {
                    var img = new Image()
                    img.src = imgList[i]  
                    img.addEventListener('load', function() {
                        cb && cb(++loadedNum / total * 100)
                    })
                }
            }
            if (audioList.length) {
                for(var i = 0; i < audioList.length; i++) {
                    var audio = new Audio()
                    audio.src = audioList[i]
                    audio.load()
                    audio.addEventListener('canplaythrough', function() {
                        cb && cb(++loadedNum / total * 100)
                    })
                }
            }
        }
        return {
            load: load
        }
    })()
    /**
     * 控制类
     * @param {Object} opt 配置对象
     * @param {Object} opt.control 按键设置
     * @param {String} opt.control.up 上键keyCode
     * @param {String} opt.control.right 右键keyCode
     * @param {String} opt.control.down 下键keyCode
     * @param {String} opt.control.left 左键keyCode
     * @param {String} opt.control.shoot 射击键keyCode
     * @param {Integer} opt.padding 内边距
     */
    var Control = function(opt) {
        var up = false, right = false, down = false, left = false, shoot = false,
            prevClientX, prevClientY
        function processKey (e, eventName) {
            var b = eventName === 'keydown'
            switch(e.code) {
                case opt.control.up:
                    up = b
                break;
                case opt.control.right:
                    right = b
                break;
                case opt.control.down:
                    down = b
                break;
                case opt.control.left:
                    left = b
                break;
                case opt.control.shoot:
                    shoot = b
                break;
            }
        }
        function touch(e, eventName) {
            up = false, right = false, down = false, left = false
            if(eventName === 'touchend') return prevClientX = prevClientY = void 0
            var t = e.changedTouches[0]
            if (prevClientX && prevClientY) {
            var dx = t.clientX - prevClientX, dy = t.clientY - prevClientY
                dx > 0 ? right = true : dx < 0 && (left = true)
                dy > 0 ? down = true  : dy < 0 && (up = true)
            }
            prevClientX = t.clientX
            prevClientY = t.clientY
        }
        function arrow (fromX, fromY, toX, toY, color) {
            if (fromY === toY && fromX === toX) return
            var arrowLen = 10, arrowAngle = 45, a2r = Math.PI / 180,
                angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
                topAngle = (angle + arrowAngle) * a2r,
                botAngle = (angle - arrowAngle) * a2r,
                topX = arrowLen * Math.cos(topAngle),
                topY = arrowLen * Math.sin(topAngle),
                botX = arrowLen * Math.cos(botAngle),
                botY = arrowLen * Math.sin(botAngle)
                context.beginPath()
                context.moveTo(fromX, fromY)
                context.lineTo(toX, toY)
                context.lineTo(toX + topX, toY + topY)
                context.moveTo(toX, toY)
                context.lineTo(toX + botX, toY + botY)
                context.strokeStyle = color
                context.stroke()
        } 
        document.addEventListener('keydown', function(e){processKey(e, 'keydown')})
        document.addEventListener('keyup', function(e){processKey(e, 'keyup')})
        document.addEventListener('touchmove', function(e){touch(e, 'touchmove')})
        document.addEventListener('touchend', function(e){touch(e, 'touchend')})
        return {
            draw: function() {
                if (!prevClientX || !prevClientY) return
                var d = 30, offsetX = left ? -d : right ? d : 0, offsetY = up ? -d : down ? d : 0
                if (!(Utils.xIsOver(prevClientX + offsetX, 0, opt.padding) || Utils.yIsOver(prevClientY + offsetY, 0, opt.padding))) {
                    arrow(prevClientX + (offsetX >> 1), prevClientY + (offsetY >> 1), prevClientX + offsetX, prevClientY + offsetY, '#fff')
                }
            },
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
    }
    /**
     * 记忆实例
     */
    var Storage = (function () {
        var uuid = 'mtfSTGMakerStorage'
        function _keyStrValue(map, keyStr, value) {
            return keyStr.split('.').reduce(function(p, key, i, a) {
                if (p[key] === void 0) a.length = 0
                if (i === a.length - 1 && value !== -Infinity) {
                    p[key] = value
                }
                return p[key]
            }, map)
        }
        function setKeyStrValue(map, keyStr, value) {
            return _keyStrValue(map, keyStr, value)
        }
        function getKeyStrValue(map, keyStr) {
            return _keyStrValue(map, keyStr, -Infinity)
        }
        function set(keyStr, val) {
            var mtfSTGMakerStorage = localStorage.getItem(uuid)
            mtfSTGMakerStorage = JSON.parse(mtfSTGMakerStorage) || Object.create(null)
            mtfSTGMakerStorage[keyStr] = val
            return localStorage.setItem(uuid, JSON.stringify(mtfSTGMakerStorage)), val
        }
        function get(keyStr) {
            var mtfSTGMakerStorage = localStorage.getItem(uuid)
            mtfSTGMakerStorage = JSON.parse(mtfSTGMakerStorage) || Object.create(null)
            return keyStr ? mtfSTGMakerStorage[keyStr] : mtfSTGMakerStorage
        }
        function clear() {
            return localStorage.removeItem(uuid)
        }
        return {
            setKeyStrValue: setKeyStrValue,
            getKeyStrValue: getKeyStrValue,
            set: set,
            get: get,
            clear: clear
        }
    })()
    /**
     * 商店类
     * @param {Object} opt 配置对象
     * @param {Boolean} opt.conf 商店对应的配置表（商店要修改配置表中的配置）
     * @param {Boolean} opt.autoSave 自动保存配置
     * @param {Array[item]} opt.items 商品物品列表
     *** @param {Object} item 商店物品
     *** @param {String} item.name 物品名称
     *** @param {String} item.keyStr 物品对应配置的键名，多级用.相连
     *** @param {Array} item.value 物品对应配置的可选键值列表
     *** @param {Array} item.display 物品对应配置的可选键值展示名称列表
     */
    var Shop = function (opt) {
        function list() {
            var items = Array(opt.items.length)
            for(var i = 0; i < opt.items.length; i++) {
                var item = opt.items[i], keyStr = item.keyStr, values = item.value
                item.selIndex = -1
                if (keyStr) {
                    var selValue = Storage.getKeyStrValue(opt.conf, keyStr)
                    for (var j = 0; j < values.length; j++) {
                        if (typeof selValue === 'object' ? 
                            JSON.stringify(values[j]) === JSON.stringify(selValue) :
                            values[j] === selValue
                        ) {
                            item.selIndex = j
                            break
                        }
                    }
                }
                items[i] = item
            }
            return items
        }
        function buy(itemIndex, valueIndex, cb) {
            var items    = opt.items,
                item     = items[itemIndex],
                value    = item.value[valueIndex],
                keyStr   = item.keyStr,
                autoSave = opt.autoSave
                Storage.setKeyStrValue(opt.conf, keyStr, value)
                if(autoSave) Storage.set(keyStr, value)
                cb && cb(item)
                console.log(opt.conf)
        }
        function load() {
            var mtfSTGMakerStorage = Storage.get()
            for (var keyStr in mtfSTGMakerStorage) {
                Storage.setKeyStrValue(opt.conf, keyStr, mtfSTGMakerStorage[keyStr])
            }
        }
        return {
            list: list,
            buy: buy,
            load: load
        }
    }
    /**
     * 绘制类
     * @param {Object} cb 回调函数
     */
    var Draw = function (cb) {
        if (!isPause && cb) {
            if(cb() === false) return
        }
        ;(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (f) {
            window.setTimeout(f, 1000 / 60)
        })(Draw.bind(this, cb))
    }

    var isPause = false, // 是否暂停
        isSilence = false // 是否静音
        
    return {
        Proto: {
            MovableObject: MovableObject,
            ShootingObject: ShootingObject
        },
        Utils: Utils,
        Storage: Storage,
        Loader: Loader,
        Control: Control,
        Shop: Shop,
        Draw: Draw
    }
}