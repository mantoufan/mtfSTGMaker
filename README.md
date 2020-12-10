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
        - `load` 相同原型的实例被创建时，加载`iconSrcs`中图标，仅1次
        - `beforeDraw` 相同原型的实例在被绘制前，调用并传入实例本身
    - 实例属性
        - `x` 横坐标
        - `y` 纵坐标
        - `width` 宽度
        - `height` 高度
        - `speed` 速度
        - `status` 状态（>=0时，与`iconSrcs`索引对应）
    - 实例方法
        - `move(offsetX, offsetY)` 移动（水平偏移量，垂直偏移量）
        - `draw` 原型图标已加载，根据`status`等实例属性绘制。反之画矩形
- `ShootingObject` 可射击对象
    - 继承`MovableObject` 可移动对象 所有属性和方法
    - 静态属性
        - `shootAudioSrc` 射击音效路径
    - 实例属性
        - `bullet` 子弹类型列表
        - `bullets` 射出子弹实例列表
    - 实例方法
        - `shoot` 射击，从`bullet`取出子弹放入`bullets`，触发音效