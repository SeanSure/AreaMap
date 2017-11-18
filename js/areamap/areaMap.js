/**
 * @fileoverview 区域地图，用于显示位置坐标
 *
 *      AreaMap.init()：初始化
 *      AreaMap.diplay()：用three.js显示解析后的DXF文件
 *      AreaMap.setLocationTag( { id: String, x: Number, y: Number, cmd: Number} )：标志坐标
 *
 *      当人离开（cmd=0）或第一次出现（cmd=1）时，会请求 id到name 的映射表
 *
 * -------------------------- 就是显示人的位置的一个东西 -------------------------
 *
 *   1. 使用Three.js显示dxf文件（cad图）的内容
 *
 *       1）请求 dxf文件（cad图），并解析成JS对象 jsonData
 *       2）Three.js 将 jsonData 渲染成 2D图
 *
 *   2. 将服务器发送过来的人的坐标(posData)显示在 2D图 上
 *
 *       1）posData 的格式
 *
 *           {
 *               // 人的ID
 *               id: Number,
 *               // 坐标类型：0 - 人离开了；1 - 人第一次出现；2 - 人移动了。
 *               cmd: Number,
 *               // 坐标
 *               x: Number,
 *               y: Number,
 *           }
 *
 *       2）根据 posData ，在 2D图 上显示人的位置标签
 *
 *   3. 其他
 *
 *       1）ID到人名的映射表
 *
 *           人离开以及第一次出现时，都会去请求
 *
 *       2）待续
 *
 * @link https://github.com/forwardNow/AreaMap
 * @author 吴钦飞
 */
define( [ "jquery", "./locationTag", "./config", "threedxf" ], function ( $, LocationTag, Config ) {
    "use strict";
    var
        AreaMap,
        THREE = window[ "THREE" ]
    ;
    /**
     * @description 场景地图
     */
    AreaMap = {
        // 目标元素
        $target: null,
        // 实例
        threeDxfInstance: null,
        // new THREE.Scene() 实例
        scene: null,
        // 格式化后参数
        opts: null,
        // 原始参数
        originOpts: null
    };

    /**
     * 声明属性
     * @private
     */
    AreaMap._declare = function () {
        // 目标元素
        this.$target = $( Config.targetSelector );
    };

    /**
     * 初始化
     * @param options {Object?}
     * @param initedCallback {Function?}
     * @return {AreaMap}
     */
    AreaMap.init = function ( options, initedCallback ) {


        // 与 LocationTag 产生关联
        LocationTag.prototype.AreaMap = AreaMap;




        Config.init( options, function() {

            AreaMap._declare();

            AreaMap.display();

            var light = new window.THREE.DirectionalLight( 0xffffff );
            light.position.set( 0, 1, 1 ).normalize();
            AreaMap.scene.add(light);

            AreaMap._interaction();

            AreaMap.animate();

            initedCallback && initedCallback();
        } );

        return this;
    };

    AreaMap._interaction =  function () {
        AreaMap.raycaster = new THREE.Raycaster();
        AreaMap.mouse = new THREE.Vector2();
        AreaMap.intersected = null;

        var
            $target = this.$target,
            offset = $target.offset(),
            offsetX = offset.left,
            offsetY = offset.top,
            width = $target.width(),
            height = $target.height()
        ;

        $( document ).on( "mousemove", function ( event ) {
            event.preventDefault();
            AreaMap.mouse.x = ( (event.pageX - offsetX) / width  ) * 2 - 1;
            AreaMap.mouse.y = -( (event.pageY - offsetY) / height  ) * 2 + 1;
        } ).on( "click", function () {
            if ( AreaMap.intersected && AreaMap.intersected.material.color.getHex() === 0xff746f ) {
                // console.info( AreaMap.intersected._pkuData );
                $( document ).trigger( "clickedPersion", AreaMap.intersected._pkuData );
            }
        } );
    };


    /**
     * 展示
     */
    AreaMap.display = function () {
        var
            data = Config.getDxfObj(),
            $target = this.$target,
            width = $target.width(),
            height = $target.height(),
            font = Config.getFont(),
            threeDxfInstance
        ;
        threeDxfInstance = new window.ThreeDxf.Viewer(data, $target.get( 0 ), width, height, font);

        this.threeDxfInstance = threeDxfInstance;

        this.scene = threeDxfInstance.threeScene;
        this.camera = threeDxfInstance.camera;
        this.renderer = threeDxfInstance.renderer;
    };

    /**
     * 刷新
     */
    AreaMap.update = function () {
        this.threeDxfInstance.render();
    };

    AreaMap.animate = function () {

        window.requestAnimationFrame( AreaMap.animate );

        AreaMap._interact();
        AreaMap.update();
    };

    /**
     * @description 交互
     * @private
     */
    AreaMap._interact = function () {
        var
            raycaster,
            intersects,
            object
        ;

        raycaster = AreaMap.raycaster;

        raycaster.setFromCamera( AreaMap.mouse, AreaMap.camera );

        intersects = raycaster.intersectObjects(  AreaMap.scene.children );

        // 交叉点有对象，则更改其状体
        if ( intersects.length > 0 ) {

            object = intersects[ 0 ].object;

            // 如果不是 同一个
            if ( AreaMap.intersected !== object ) {
                // 还原上一个的颜色
                if ( AreaMap.intersected ) {
                    AreaMap.intersected.material.color.setHex( AreaMap.intersected.originColor );
                }
                // 如果是贴图对象的则变色
                if ( object.material.map instanceof THREE.Texture ) {

                    object.originColor = object.material.color.getHex();
                    object.material.color.setHex( 0xff746f );

                    AreaMap.intersected = object;
                }
            }
        }
        // 交叉点没有对象，则将上个对象恢复原始状态
        else {
            if ( AreaMap.intersected ) {
                AreaMap.intersected.material.color.setHex( AreaMap.intersected.originColor );
                AreaMap.intersected = null;
            }
        }
    };


    /**
     * @description 设置定位标签
     * @param data {{ id: String, x: Number, y: Number, cmd: Number}}
     * @public
     */
    AreaMap.setLocationTag = function ( data ) {
        var
            locationTag
        ;
        // 获取（没有，则创建）
        locationTag = this.getLocationTag( data );
        // 移动
        locationTag.move( data );
    };


    /**
     * 保存所有的实例，以id为key
     */
    AreaMap.locationTagSet = {

    };

    /**
     * 获取一个 LocationTag 实例
     *      如果已经创建，则从集合中获取
     *      如果未创建，则创建
     * @param opts {{ id: String, x: Number, y: Number, cmd: Number}}
     * @return {LocationTag}
     */
    AreaMap.getLocationTag = function ( opts ) {
        var
            id = opts.id,
            locationTag,
            cmd = opts.cmd
        ;

        // 从集合中找
        locationTag = this.locationTagSet[ id ];

        // 根据 cmd 进行相应操作， 当 cmd = 0 时，销毁该元素
        if ( cmd === 0 && locationTag ) {
            locationTag.destroy();
            locationTag = null;
        }

        // 当 cmd = 0 || cmd = 1 时（有人离开或出现时），异步Ajax请求映射表
        if ( cmd === 0 || cmd === 1 ) {
            Config.updateIdToNameMapping();
        }

        if ( locationTag ) {
            return locationTag;
        }

        return this.createLocationTag( opts );
    };

    /**
     * 创建实例
     * @param opts {{ id: String, x: Number, y: Number}}
     * @return {LocationTag}
     */
    AreaMap.createLocationTag = function ( opts ) {
        var
            locationTag = new LocationTag( opts )
        ;
        // 存入集合
        AreaMap.locationTagSet[ opts.id ] = locationTag;
        return locationTag;
    };


    return AreaMap;
} );