# AreaMap
 
## 1. 用途

将DXF文件的内容（区域结构）显示在网页上，在区域上标记人员位置（位置标签）。

## 2. 功能

### 2.1 已完成
 1. 解析DXF文件，并在网页上以2D的形式显示
 2. 创建位置标签，并可为其设置图片和文本
 3. 位置标签的类型（民警、嫌疑人等）可配置
 4. 移动位置标签时，以匀速的方式移动，而不是直接显示在目标坐标点
 
 
### 2.2 待完成（TODO）
 1. 优化

## 3. 使用


### 3.1 引入脚本
参考 index.html
```
<meta name="renderer" content="webkit">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<script data-main="./js/main" src="js/requirejs/2.1.22/require.js"></script>

<div
     id="areaMap"
     style="width: 726px;height: 846px;"
     data-options='{
        "targetSelector": "#areaMap",
        "dxfUrl": "./data/center4.dxf",
        "fontUrl": "./fonts/MicrosoftYaHei_Regular.json",
        "personInfoListUrl": "./data/personInfoListData.json",
        "personPictureDirectory": "./images/128x256/"
     }'  >

</div>
```
### 3.2 参数

参考：config.js

```
/** 调试模式，控制台输出一些调试信息 */
debug: true,

/** 目标元素CSS选择器 */
targetSelector: null,

/** dxf文件 - URL */
dxfUrl: null,

/** 字体文件 - URL */
fontUrl: null,


/** 人员信息列表 - URL */
personInfoListUrl: null,

/** 人 - 网格对象 - 宽度 */
personMeshWidth: 1000,

/** 人 - 网格对象 - 高度 */
personMeshHeight: 2000,

/** 人 - 网格对象 - 高度 */
personMeshColor: "#ffffff",

/** 人 - 图片 - 目录 */
personPictureDirectory: "",

/** 人 - 图片集合（256px * 512px） */
personPictureSet: {
    // 警察 - 男
    "police_man": "police_man.png",
    // 警察 - 女
    "police_woman": "police_woman.png",
    // 嫌疑人 - 男
    "suspect_man": "suspect_man.png",
    // 嫌疑人 - 女
    "suspect_woman": "suspect_woman.png",
    // 一般人 - 男
    "ordinary_man": "ordinary_man.png",
    // 一般人 - 女
    "ordinary_woman": "ordinary_woman.png"
},

/** 字体大小 */
textSize: 400,

/** 实际的X坐标 与 请求的X坐标 比 */
xRate: 10,

/** 实际的Y坐标 与 请求的Y坐标 比 */
yRate: 10,


```


### 3.3 方法

参考：areaMap.js

AreaMap.init( options, callback );
* 作用：初始化
* 参数：
    * options：参数，参考 【3.2 参数】。
    * callback：初始化完毕后的回调。

AreaMap.setLocationTag( position )
* 作用：创建或移动位置标签
* 参数：
    * position：{ id: String, x: Number, y: Number, cmd: Number }

### 3.4 事件

参考：areaMap.js

```
/** @event clickedPersion */
当点击“位置标签”后，会在容器（targetSelector）上触发“clickedPersion”事件。
```

```
$target.on( "clickedPersion", function ( position ) {
    console.info( position.id ); //=> "56789"
} );
```

3.5 其他

3.5.1 人员类型

**1）人员类型设置**
* 指定人员类型，以及对应的图片
* 图片要求：宽高比为1:2；宽度和高度的像素值都为 2的N次幂，如 256px * 512px

```
personPictureDirectory: "./images/128x256/",

personPictureSet: {
    // 警察 - 男
    "police_man": "police_man.png",
    // 警察 - 女
    "police_woman": "police_woman.png",
    // 嫌疑人 - 男
    "suspect_man": "suspect_man.png",
    // 嫌疑人 - 女
    "suspect_woman": "suspect_woman.png",
    // 一般人 - 男
    "ordinary_man": "ordinary_man.png",
    // 一般人 - 女
    "ordinary_woman": "ordinary_woman.png"
}
```
**2）人员信息列表**
* 请求服务器获取
* 请求时机
    * 初始化时
    * 创建或删除位置标签后，会异步请求
    * 根据ID为获取到name时，会同步请求
```
{
  "success": true,
  "data": {
     "56780": { "id": "56780", "name": "警察_男", "type": "police_man" },
     "56781": { "id": "56781", "name": "警察_女", "type": "police_woman" },
     "56782": { "id": "56782", "name": "嫌疑人_男", "type": "suspect_man" },
     "56783": { "id": "56783", "name": "嫌疑人_女", "type": "suspect_woman" },
     "56786": { "id": "56786", "name": "一般人_男", "type": "ordinary_man" },
     "56787": { "id": "56787", "name": "一般人_女", "type": "ordinary_woman" }
  }
}
```
