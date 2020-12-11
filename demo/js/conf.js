var CONF = {
    status: 'start', // 游戏开始默认为开始中
    level: 6, // 游戏默认等级
    score: 0, // 游戏默认分数
    gold: 0, // 游戏默认金币
    totalLevel: 6, // 总共2关
    numPerLine: 4, // 游戏默认每行多少个怪兽
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
    planeSpeed: 3, // 默认飞机每一步移动的距离
    planeSize: {
        width: 60,
        height: 100
    }, // 默认飞机的尺寸,
    planeIcon: './img/plane.png',// 飞机的图像
    planeNum: 1,// 飞机数量
    planeBulletNum: 1, // 默认同时射出子弹数量（机枪数量）
    planeShootAudio: 'audio/m4a1.mp3', // 飞机射击音效
    bgAudio: 'audio/bg.mp3', // 背景音乐
    control: {// 自定义按键
        up: 'ArrowUp',
        right: 'ArrowRight',
        down: 'ArrowDown',
        left: 'ArrowLeft',
        shoot: 'Space',
        autoShoot: false, // 自动射击（移动端自动打开）
    },
    shop: {// 商店
        autoSave: true, // 自动保存商店设置（刷新页面依然有效）
        items: [
            {
                keyStr: 'control.autoShoot', // 对应的配置键名
                name: '自动射击', // 商品名称
                value: [true, false], // 对应的配置键值
                display: ['开', '关'], // 键值在商店的展示名称
                gold: 0 // 切换所需金币
            },
            {
                keyStr: 'bulletSpeed',
                name: '子弹速度',
                value: [5, 10, 15, 20, 25],
                isUpgrade: true, // 只允许升级，不允许任意选择
                gold: 1 // 升级所需金币
            },
            {
                keyStr: 'bulletCoolownTime',
                name: '装弹速度',
                value: [100, 90, 80, 70, 60],
                isUpgrade: true,
                gold: 1
            },
            {
                keyStr: 'planeBulletNum',
                name: '机枪数量',
                value: [1, 2, 3, 4, 5],
                isUpgrade: true,
                gold: 1
            },
            {
                keyStr: 'planeSpeed',
                name: '飞机速度',
                value: [3, 4, 5, 6, 7],
                isUpgrade: true,
                gold: 1
            },
            {
                keyStr: 'planeSize',
                name: '飞机尺寸',
                value: [{width: 60, height: 100}, {width: 48, height: 80}, {width: 30, height: 50}],
                display: ['大', '中', '小'],
                gold: 1
            },
            {
                keyStr: 'planeNum',
                name: '飞机数量',
                value: [1, 2, 3, 4, 5],
                isUpgrade: true,
                gold: 1
            }
        ]
    }
}