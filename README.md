# mtfSTGMaker
MTF射击游戏生成器，封装角色、装备、碰撞检测、资源预加载、键盘和触屏操控等底层实现，帮助您快速开发射击游戏
## 快速上手
1. 创建画布，引入`js`
```html
<canvas id="canvas"></canvas>
<script src="mtfstgmaker.js" ></script>
```
2. 创建对象，传入画布上下文
```javascript
var mtf = mtfSTGMaker(canvas.getContext('2d'))
```
3. 现在您可以通过`mtf`使用生成器
## 使用
看看`mtf`都提供什么？
### Proto 原型
- `MovableObject` 可移动对象
    - 静态属性
        - `iconSrcs` 原型图标路径列表（索引与`status`对应）
    - 静态方法
        - `load()` 相同原型的实例被创建时，加载`iconSrcs`中图标，仅1次
        - `beforeDraw()` 相同原型的实例在被绘制前，调用并传入实例本身
    - 实例属性
        - `x` 横坐标
        - `y` 纵坐标
        - `width` 宽度
        - `height` 高度
        - `speed` 速度
        - `status` 状态（>=0时，与`iconSrcs`索引对应）
    - 实例方法
        - `move(offsetX, offsetY)` 移动（水平偏移量，垂直偏移量）
        - `draw()` 原型图标已加载，根据`status`绘制图标。反之画矩形
- `ShootingObject` 可射击对象
    - 继承`MovableObject` 可移动对象 所有属性和方法
    - 静态属性
        - `shootAudioSrc` 射击音效路径
    - 实例属性
        - `bullet` 子弹类型列表
        - `bullets` 射出子弹实例列表
    - 实例方法
        - `shoot()` 射击，从`bullet`取出子弹放入`bullets`，触发音效
### Loader 预加载实例
- `load(resList, cb)` 
    - 加载资源列表`resList`中图片和音频路径
    - 每加载完一个资源，将加载进度`progress`(0 ~ 100)传入回调函数`cb`
### Control 操作类
- `constructor(opt)`
    - `opt.control` 按键设置
        - `opt.control.up` 上键`keyCode`
        - `opt.control.right` 右键`keyCode`
        - `opt.control.down` 下键`keyCode`
        - `opt.control.left` 左键`keyCode`
        - `opt.control.shoot` 射击键`keyCode`
    - `opt.padding` 内边距（默认`0`）

- `pressed()` 监听触屏和键盘。返回当前按键情况，如下
```javascript
// 当前上键，右键，射击键被按下
{up: true, right: true, down: false, left: true, shoot: true}
```
- `draw()` 在触屏界面，绘制虚拟键盘，指示移动方向
### Storage 记忆实例
- `setKeyStrValue(map, keyStr, value)` 更改`map`中的key名为`keyStr`的键值
- `getKeyStrValue(map, keyStr)` 获取`map`中的key名为`keyStr`的键值
- `set(key, val)` 设置键为`key`的值为`val`
- `get(key)` 获取键为`key`的值
- `clear()` 清空记忆实例

### Shop 商店类
- `constructor(opt)`
    - `opt.conf` 商店对应配置表
    - `opt.autoSave` 是否自动保存配置`true / false`
    - `opt.items` 商品列表
        - `item` 商品
            - `item.name` 商品名称
            - `item.keyStr` 商品对应配置的键名
            - `item.value` 商品对应配置可选键值列表
            - `item.display` 商品对应配置的可选键值展示名称列表
- `list()` 根据配置表，获取商品列表
    - `item.selIndex` 配置表中，商品对应配置的键值，在`item.value`的`索引`
- `buy(itemIndex, valueIndex, cb)` 
    - 购买(商品索引，对应配置可选键值索引，回调函数)
    - 回调函数，传入被购买的商品`item`
- `load()` 选项`opt.autoSave`为`ture`，读取保存的配置

### Draw 绘制类
- `constructor(cb)`
    - `cb` 回调函数，每一帧（约16.67毫秒执行一次），调用
        - `return false` 停止绘制

### Utils 工具包
- `inherit(subType, superType)` 子类`subType`组合继承父类`superType`
- `xIsOver(x, width, padding)` 判断实例是否水平越界，返回`true/false`
    - `x` 实例坐标
    - `width` 实例宽度，默认0
    - `padding` 内边距，默认0
- `yIsOver(y, height, padding)` 判断实例是否垂直越界，返回`true/false`
    - `y` 实例坐标
    - `height` 实例高度，默认0
    - `padding` 内边距，默认0
- `AABB(points, cb)` AABB粗检测：找出投影相交，且阵营不同的实例对
    - `points` 二维数组[[坐标投影值, 是否开始（1是，0结束）, 实例的阵营ID，实例ID（自定义）]...]
    - `cb` 每检测到投影相交的一对实例的回调函数（①实例的阵营ID，①实例ID，②实例的阵营ID，②实例ID）
- `collision(opt)` 碰撞检测：找出所有碰撞，且阵营不同的实例对
    - `opt.camps` 阵营列表：阵营列表 [[我方实例集合], [敌方实例集合]...]
    - `opt.cb` 找到所有碰撞的实例时回调函数([[碰撞的实例对]...])
- `throttle(fn, delay, isDebounce)` 节流和防抖，返回函数
    - `fn` 要节流或防抖的函数
    - `delay` 延迟时间（秒）
        - 节流：延迟时间即执行时间间隔
        - 防抖：重复执行将重置延迟时间
    - `isDebounce` 是否开启防抖，默认为节流。`true/false`
- `pause()` 暂停渲染，返回当前暂停状态`true/false`
- `silence` 静音，返回当前静音状态`true/false`

## 示例
```javascript
var context = canvas.getContext('2d'), // 绘图上下文
    /** 引入：开始 */
    mtf = mtfSTGMaker(context),
    MovableObject = mtf.Proto.MovableObject, // 可移动对象原型
    ShootingObject = mtf.Proto.ShootingObject, // 可射击对象原型
    Utils = mtf.Utils, // 引入 工具包
    Loader = mtf.Loader, // 引入 加载类
    Control = mtf.Control, // 引入 控制类
    Storage = mtf.Storage, // 引入 记忆实例：用于保存读取进度
    Shop = mtf.Shop, // 引入 商店类
    Draw = mtf.Draw // 引入 渲染类
    /** 引入：结束 */
```
1. 拓展原型：通过`MovableObject`和`ShootingObject`创建新原型
```javascript
/** 飞机原型，拓展自 可射击对象。添加图标路径、射击音效 */
function Plane(opt) {
    opt = opt || Object.create(null)
    Plane.iconSrcs = ['planeIcon.png', 'boomIcon.png']// 图标 
    Plane.shootAudioSrc = 'shootAudio.mp3'// 射击音效
    ShootingObject.call(this, opt) // 飞机继承射击原型实例的属性
}
Utils.inherit(Plane, ShootingObject) // 调用工具包的组合继承方法
/** 飞机子弹原型，拓展自 可移动对象 */
function PlaneBullet(opt) {
    MovableObject.call(this, opt)
}
```
2. 设置默认行为（可选），每一帧绘制前，所有该原型的实例会调用
```javascript
// 所有的飞机子弹每一帧向上飞一格，越界后，状态为-1（等待回收）
PlaneBullet.beforeDraw = function() {
    if (Utils.yIsOver(this.y - this.speed - this.height, this.height)) {
        this.status = -1
    } else {
        this.move(0, -this.speed)
    }
}
```
3. 创建角色：实例化新原型
```javascript
/** 创建飞机：初始位置(0, 0)，宽100，高60，速度30，弹仓为空 */
var plane = new Plane({
    x: 300
    y: 300,
    width: 100,
    height: 60,
    speed: 30,
    bullet: []
})
/** 创建飞机子弹 */
 var planeBulletObj = {
    constructor: PlaneBullet, // 子弹原型指定为 PlaneBullet
    opt: {
        setX: function(plane, index, total) { // 子弹相对飞机位置
            return plane.x + plane.width / (total + 1) * (index + 1)
        },
        setY: function(plane) {// 子弹相对飞机位置
            return plane.y
        },
        width: 5,// 子弹宽度
        height: 5, // 子弹高度
        speed: 10 // 子弹速度
    }
}
/** 将飞机子弹装入 飞机 */
plane.bullet.push(planeBulletObj)
/** 您还可以 创建 飞机导弹等不同类型子弹，将 子弹 装入飞机 */
```
4. 渲染
```javascript
// 监听键盘和触屏
var control = Control()
// 渲染
Draw(function() {
    // 按下空格键：射击
    var pressed = control.pressed()
    if (pressed['shoot']) {
        plane.shoot()
    }
    // 绘制 飞机
    plane.draw()
    // 绘制 子弹
    for (var i = plane.bullets.length; i--;) {
        if (plane.bullets[i].status === -1) {
            plane.bullets.splice(i, 1) // 回收状态 -1 的子弹
        } else {
            plane.bullets[i].draw()
        }
    }
})
```
5. 这样我们就可以在画布上：展示一个飞机，按下空格，飞机会射出子弹
## 完整示例
[示例游戏]()
![示例游戏图片]()