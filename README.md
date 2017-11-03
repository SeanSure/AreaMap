# AreaMap

解析DXF，通过three.js显示2D图；将传过来坐标显示在2D图上。

## 1. 用途

在网页中，显示区域内 人的移动轨迹：

 * 区域以CAD图展示，导出的文件为 dxf文件
 * 请求 dxf文件，并解析为 three.js 可识别的 JS对象
 * 通过 three.js 将区域以 2D图 的形式展现在网页上
 * 通过 WebSocket 不断获取人的坐标，在2D图上将坐标标记出来，看起来就是移动的标记

## 2. 功能

### 2.1 已完成
 1. 显示所有人的位置标签，并不断更新坐标
 2. 预定义一组颜色，按顺序给每个 位置标签 设置颜色
 3. 开启以及停止WebSocket，即开始及暂停更新位置标签
 4. 当人第一次出现或离开时，向服务器请求 ID到人名的映射表
 
### 2.2 待完成（TODO）
 1. 通过按钮控制 缩放 功能
 2. 聚焦某个人的轨迹，也就是说 某个人一直在镜头的中心
 3. 给指定的人的位置标签设置颜色
 4. 提供 3D场景
 5. 当某人进入指定区域时，该区域高亮

## 3. 使用

参考：index.html

### 3.1 引入脚本和样式文件
```
<link rel="stylesheet" href="css/style.css">
<script data-main="./js/main" src="js/requirejs/2.1.22/require.js"></script>
```
### 3.2 设置参数

```
<!--
    data-font-url【中文字体】
        three.js用到的中文字体（微软雅黑粗体）json文件的URL

    data-dxf-file-url【CAD图】
        获取dxf文件的URL

    data-id-to-name-mapping-url【映射表】
        获取id到name的映射表。
        接收到的数据格式（JsonResult.java）
            {
                "success": Boolean,
                "data": {
                    "56789": "张三",
                    "56799": "李四",
                    ...
                }
            }

    data-websocket-url【数据源】
        指定 WebSocket 的 URL。
        服务器端不断推送（坐标）数据，客户端（浏览器）解析并在2D图上显示坐标位置。
        接收到的数据格式：
            {
               // 人的ID
               id: Number,
               // 坐标类型：0 - 人离开了；1 - 人第一次出现；2 - 人移动了。
               cmd: Number,
               // 坐标
               x: Number,
               y: Number,
            }
-->
<div class="pku-area-map"
     id="areaMap"
     style="display: none;"

     data-font-url="./fonts/MicrosoftYaHei_Bold.json"
     data-dxf-file-url="./data/zhian-0719-21_LAYER_1.dxf"
     data-id-to-name-mapping-url="./data/idToNameMapping.json"
     data-websocket-url="ws://192.168.1.241:8080/LocalSense/localsense">
```

