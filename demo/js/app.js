// 元素
var container = document.getElementById('game');
var canvas = document.getElementById('canvas');
/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} CONF 配置文件 
   * @return {[type]}      [description]
   */
  init: function(CONF) {
    this.data = {
      shopFromStatus: 'start' // 从商店返回的状态
    }
    if ('ontouchstart' in window) {
      CONF.control.autoShoot = true // 触屏设备默认开启自动射击，用户可在商店中关闭
    }
    var Index = this._Index(CONF); // 载入业务逻辑
    delete this.Index;
    this.Storage = Index.Storage; // 记忆实例：用于保存读取进度
    this.run = Index.run; // 运行
    this.reload = Index.reload; // 重载配置（重置）
    this.pause = Index.pause; // 暂停
    this.silence = Index.silence; // 静音
    this.shop = Index.shop; // 商店
    this.shop = this._shop();
    delete this._shop;
    this.bindEvent(); // 绑定事件
    this.initData(); // 初始化数据到 之前进度 或 默认值
    if (CONF.shop.autoSave) this.shop.load(); // 读取配置（刷新页面后）
    Index.preload(this.preload); // 预加载
    this.setStatus(CONF.status); // 初始等级
  },
  preload: function(progress) {
    var preload = document.querySelector('.game-preload')
        preload.innerHTML = progress < 100 ? '资源预加载中<span class="game-loader-dot">···</span> ' + progress + '% 您可以开始游戏' : '预加载完成 开始游戏吧' 
  },
  _Index(CONF) {
    var self = this;
    return Index(canvas, Object.assign(CONF, {
      cb: {
        draw: function(we, enemies) { // 渲染时，传入不同阵营的实例列表
          if (enemies.length === 0) {// 胜利：敌人无人
            if (self.data.level <= CONF.totalLevel) {
              self.updateLevel(self.data.level + 1);
              self.setStatus('success');
            }
            return false;
          } else if (we.length === 0 || enemies[enemies.length - 1].y > canvas.height - CONF.canvasPadding) {// 失败：我方无人 或 有敌人到达底部
            self.setStatus('failed');
            return false; // 终止渲染
          }
        },
        collision: function(a, b) { // 碰撞时，传入相撞的2个阵营的实例，顺序与index.js碰撞检测顺序一致
          if(a.constructor.name === 'PlaneBullet') {
            self.updateScore(self.data.score + 1);
            self.updateGold(self.data.gold + 2);
          }
        },
        pause: function(isPause) { // 暂停状态变化时回调
          var pauseBtn = document.querySelector('.js-pause');
          isPause ? pauseBtn.classList.add('active') : pauseBtn.classList.remove('active')
        },
        silence: function(isSilence) { // 静音状态变化时回调
          var silenceBtn = document.querySelector('.js-silence');
          isSilence ? silenceBtn.classList.add('active') : silenceBtn.classList.remove('active')
        },
      }
    }))
  },
  initData() {
    this.updateLevel(this.Storage.get('level') || CONF.level);// 更新级别
    this.updateScore(this.Storage.get('score') || CONF.score);// 更新分数
    this.updateGold(this.Storage.get('gold') || CONF.gold);// 更新金币
  },
  bindEvent: function() {
    var self = this,
        playBtn = document.querySelector('.js-play'),
        nextBtn = document.querySelector('.js-next'),
        backBtn = document.querySelector('.js-back'),
        resetBtn = document.querySelector('.js-reset'),
        pauseBtn = document.querySelector('.js-pause'),
        silenceBtn = document.querySelector('.js-silence'),
        replayBtns = document.querySelectorAll('.js-replay'),
        shopBtns = document.querySelectorAll('.js-shop');
    // 开始游戏按钮绑定
    playBtn.onclick = nextBtn.onclick = function() {
      self.play();
    };
    // 再玩一次按钮绑定
    replayBtns.forEach(function(replayBtn) {
      replayBtn.onclick = function() {
        self.updateLevel(self.data.level);
        self.updateScore(0);
        self.setStatus('start');
      }
    })
    // 商店按钮绑定
    shopBtns.forEach(function(shopBtn) {
      shopBtn.onclick = function() {
        self.setStatus('shop');
      }
    })
    // 返回按钮绑定
    backBtn.onclick = function() {
      self.setStatus(self.data.shopFromStatus);
    }
    // 重置按钮绑定
    resetBtn.onclick = function() {
      self.reset();
    }
    // 暂停按钮绑定
    pauseBtn.onclick = function() {
      self.pause()
    }
    // 静音按钮绑定
    silenceBtn.onclick = function() {
      self.silence()
    }
    // 回车触发按键
    document.addEventListener('keydown', function(e){
      var selector
      if (['KeyP', 'KeyS'].indexOf(e.code) > -1) {
        selector = '.game-control';
      } else if (self.status !== 'playing' && ['KeyA', 'KeyB', 'KeyR'].indexOf(e.code) > -1) {
        selector = '.game-' + (status === 'start' ? 'intro' : container.getAttribute('data-status'));
      }
      if (selector) {
        document.querySelector(selector + ' .js-' + e.code.slice(-1).toLowerCase()).click();
      }
    })
    // Canvas自适应
    var setCanvasSize = function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.onresize = setCanvasSize;
    setCanvasSize();
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   */
  setStatus: function(status) {
    if (status === 'shop') {
      this.shop.list();
      this.data.shopFromStatus = this.status;
    } else if (status === 'success' || status === 'all-success') {
      this.save();
    }
    this.status = status;
    container.setAttribute('data-status', status);
  },
  play: function() {
    this.setStatus('playing');
    this.run(this.data.level);
  },
  save: function() { // 保存游戏进度：将当前data存入记忆实例
    for (var key in this.data) {
      this.Storage.set(key, this.data[key])
    }
  },
  set: function(selector, value) { // 赋值selector选中的DOM对象
    document.querySelectorAll(selector).forEach(function(o) {
      o.innerText = value;
    })
  },
  updateLevel: function(value) {// 更新DOM：等级
    this.set('.level', this.data.level = value);
  },
  updateScore: function(value) {// 更新DOM：分数
    this.set('.score', this.data.score = value);
  },
  updateGold: function(value) {// 更新DOM：金币
    this.set('.gold', this.data.gold = value);
  },
  $$: function(tag) {// 创建元素
    return document.createElement(tag);
  },
  reset: function() {
    if (confirm('是否重置游戏关卡、金币、商店到默认值？')) {
      this.Storage.clear()
      this.reload();
      this.setStatus('start');
      this.initData();
    }
  },
  _shop: function() {
    var self = this, timer = null, shop = self.shop(),
        shopDom = document.querySelector('.game-shop'),
        goldDom = document.querySelector('.game-shop-gold'),
        backBtn = document.querySelector('.js-back');
    /** 创建DOM、赋值并添加到父节点中
     * @param {String} tagName DOM标签名
     * @param {String} text 文字内容，不解析HTML
     * @param {HtmlElement} parentNode 父节点
     **/ 
    function add(tagName, text, parentNode) {
        var dom = self.$$(tagName);
            dom.innerText = text;
            parentNode.appendChild(dom);
            return dom;
    }
    /**
     * 创建商店物品列表
     */
    function list () {
      var fragment = document.createDocumentFragment(),
          shopList = shop.list();// 获取最新的商店物品列表
          self.updateGold(self.data.gold);
          for (var i = 0; i < shopList.length; i++) {
            var item = shopList[i], optionDom = self.$$('p');
            optionDom.classList.add('game-option');
            optionDom.classList.add(item.isUpgrade ? 'game-option-isupgrade' : 'game-option-default');
            add('i', item.gold ? item.gold + '金币' : '免费', add('span', item.name, optionDom));
            optionDom.setAttribute('itemindex', i);
            var displays = item.display || item.value;
            for (var j = 0; j < displays.length; j++) {
              var dom = add('span', displays[j], optionDom);
              if (item.selIndex === j) dom.classList.add('game-option-sel');
              dom.setAttribute('valueindex', j);
            }
            fragment.appendChild(optionDom);
          }
          clear();
          shopDom.insertBefore(fragment, backBtn);
    }
    /**
     * 清空商店物品列表
     */
    function clear() {
      var options = document.querySelectorAll('.game-option');
      options.forEach(function (option) {
        shopDom.removeChild(option);
      })
    }
    /**
     * 购买商店物品
     * @param {Integer} 商店物品索引
     * @param {Integer} 配置索引
     */
    function buy(itemIndex, valueIndex) {
      shop.buy(itemIndex, valueIndex, function(item) { // 更改配置成功后，回调传入 购买的商品
        self.updateGold(self.data.gold - item.gold); // 减少金币
        self.save(); // 保存配置
      })
    }
    /**
     * 通过事件委托给商店绑定点击事件
     */
    (function bindEvent() {
      shopDom.addEventListener('click', function(e) {
        var e = e || window.Event,
        shopList = shop.list();
        if (e.target.tagName === 'SPAN') {
          var parent = e.target.parentNode,
              itemIndex = parent.getAttribute('itemindex'),
              valueIndex = e.target.getAttribute('valueindex') | 0;
              if (itemIndex) {
                var item = shopList[itemIndex];
                // isUpgrade为True，只允许顺序升级
                if (item.isUpgrade && valueIndex !== item.selIndex + 1) return
                if (item.gold > self.data.gold) { // 金币不够
                  alert('金币不足');
                  goldDom.classList.add('game-gold-lack');
                  if(!timer) timer = setTimeout(function() {
                    goldDom.classList.remove('game-gold-lack');
                    timer = null;
                  }, 3000);
                } else {// 金币作古
                  buy(itemIndex | 0, valueIndex);
                  item.selIndex = valueIndex;
                  list();
                }
              }
        }
      })
    })()
    return {
      list: list,
      load: shop.load
    }
  }
};
// 初始化
GAME.init(CONF);