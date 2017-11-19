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

        /** 目标元素 */
        $target: null,

        /** 实例 */
        threeDxfInstance: null,

        /** THREE.Scene */
        scene: null,

        /** THREE.Camera */
        camera: null,

        /** THREE.Renderer */
        renderer: null,

        /** THREE.Vector2 */
        _mouse: null,

        /** THREE.Raycaster */
        _raycaster: null,
        
        _intersected: null,

        /** 缓存 */
        locationCache: null
    };

    /**
     * @description 缓存
     */
    AreaMap.locationCache = {
        set: function ( id, data ) {
            AreaMap.locationCache[ id ] = data;
            return AreaMap.locationCache[ id ];
        },
        get: function ( id ) {
            return AreaMap.locationCache[ id ];
        },
        remove: function ( id ) {
            delete AreaMap.locationCache[ id ];
        }
    };

    /**
     * 声明属性
     * @private
     */
    AreaMap._declare = function () {

        /** 目标元素 */
        this.$target = $( Config.targetSelector );

        this._mouse = new THREE.Vector2();

        this._raycaster = new THREE.Raycaster();

    };

    /**
     * 初始化
     * @param options {Object?}
     * @param initedCallback {Function?}
     * @return {AreaMap}
     */
    AreaMap.init = function ( options, initedCallback ) {

        var
            _this = this
        ;

        // 与 LocationTag 产生关联
        LocationTag.prototype.AreaMap = AreaMap;


        Config.init( options, function() {

            AreaMap._declare();

            AreaMap._createView();

            AreaMap._bindEvent();

            AreaMap._animate();

            // _this.camera.lookAt( new THREE.Vector3(330000,-330000,0) );
            // _this.camera.lookAt( new THREE.Vector3(0,0,0) );

            // AreaMap.camera.position.x = 306084.0229452408;
            // AreaMap.camera.position.y = -332812.88479561365;

            AreaMap.camera.position.x = 337084.0229452408;
            AreaMap.camera.position.y = -336812.88479561365;

            AreaMap.camera.left = -18932.797341393023;
            AreaMap.camera.right = 18932.797341393023;
            AreaMap.camera.top = 26417.856755432134;
            AreaMap.camera.bottom = -26417.856755432134;
            AreaMap.camera.updateProjectionMatrix( );

            initedCallback && initedCallback();
        } );

        return this;
    };
    
    /**
     * @description 构造界面
     */
    AreaMap._createView = function () {
        var
            data = Config.getDxfObj(),
            $target = this.$target,
            width = $target.width(),
            height = $target.height(),
            font = Config.getFont(),
            threeDxfInstance,
            light
        ;
        threeDxfInstance = new window.ThreeDxf.Viewer(data, $target.get( 0 ), width, height, font);

        this.threeDxfInstance = threeDxfInstance;

        this.scene = threeDxfInstance.threeScene;
        this.camera = threeDxfInstance.camera;
        this.renderer = threeDxfInstance.renderer;
        // this.controls = threeDxfInstance.controls;



        light = new THREE.DirectionalLight( 0xffffff );

        light.position.set( 0, 1, 1 ).normalize();

        this.scene.add(light);
    };

    /**
     * @description 事件绑定
     * @private
     */
    AreaMap._bindEvent =  function () {
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
            AreaMap._mouse.x = ( (event.pageX - offsetX) / width  ) * 2 - 1;
            AreaMap._mouse.y = -( (event.pageY - offsetY) / height  ) * 2 + 1;
        } ).on( "click", function () {
            if ( AreaMap._intersected && AreaMap._intersected.material.color.getHex() === 0xff746f ) {
                $( document ).trigger( "clickedPersion", AreaMap._intersected._pkuData );
            }
        } );
    };


    /**
     * @description 刷新
     */
    AreaMap.update = function () {
        this.threeDxfInstance.render();
    };

    /**
     * @description 动画
     * @private
     */
    AreaMap._animate = function () {

        window.requestAnimationFrame( AreaMap._animate );

        AreaMap._interact();
        AreaMap.update();
    };

    /**
     * @description 交互
     * @private
     */
    AreaMap._interact = function () {
        var
            _raycaster,
            intersects,
            object
        ;

        _raycaster = AreaMap._raycaster;

        _raycaster.setFromCamera( AreaMap._mouse, AreaMap.camera );

        intersects = _raycaster.intersectObjects(  AreaMap.scene.children );

        // 交叉点有对象，则更改其状体
        if ( intersects.length > 0 ) {

            object = intersects[ 0 ].object;

            // 如果不是 同一个
            if ( AreaMap._intersected !== object ) {
                // 还原上一个的颜色
                if ( AreaMap._intersected ) {
                    AreaMap._intersected.material.color.setHex( AreaMap._intersected.originColor );
                }
                // 如果是贴图对象的则变色
                if ( object.material.map instanceof THREE.Texture ) {

                    object.originColor = object.material.color.getHex();
                    object.material.color.setHex( 0xff746f );

                    AreaMap._intersected = object;
                }
            }
        }
        // 交叉点没有对象，则将上个对象恢复原始状态
        else {
            if ( AreaMap._intersected ) {
                AreaMap._intersected.material.color.setHex( AreaMap._intersected.originColor );
                AreaMap._intersected = null;
            }
        }
    };



    /**
     * @description 设置定位标签
     * @param data {{ id: String, x: Number, y: Number, cmd: Number}}
     */
    AreaMap.setLocationTag = function ( data ) {

        switch ( data.cmd ) {
            // 离开
            case 0: {
                this.destroyLocationTag( data );
                break;
            }
            // 创建（第一次出现）
            case 1: {
                this.createLocationTag( data );
                break;
            }
            // 更新（移动）
            case 2: {
                this.updateLocationTag( data );
                break;
            }
        }

    };


    /**
     * @description 创建 定位标签
     * @param opts {{ id: String, x: Number, y: Number}}
     */
    AreaMap.createLocationTag = function ( opts ) {
        var
            locationTag
        ;

        if ( this.locationCache.get( opts.id ) ) {
            this.updateLocationTag( opts );
            return;
        }
        locationTag = new LocationTag( this.scene, opts );

        locationTag.create();

        locationTag.update( opts );

        AreaMap.locationCache.set( opts.id, locationTag );

    };

    /**
     * @description 更新 定位标签
     * @param opts {{ id: String, x: Number, y: Number}}
     */
    AreaMap.updateLocationTag = function ( opts ) {
        var
            locationTag = this.locationCache.get( opts.id )
        ;
        if ( ! locationTag ) {
            this.createLocationTag( opts );
            return;
        }
        locationTag.update( opts );
    };



    /**
     * @description 销毁
     * @param opts {{ id: String, x: Number, y: Number}}
     */
    AreaMap.destroyLocationTag = function ( opts ) {
        var
            locationTag = this.locationCache.get( opts.id )
        ;
        if ( ! locationTag ) {
            console.warn( "【" + opts.id + "】不存在！" );
            return;
        }

        locationTag.destroy();

        this.locationCache.remove( opts.id );
    };


    window.AreaMap = AreaMap;


    return AreaMap;
} );