/**
 * @fileoverview 区域地图，用于显示位置坐标
 *
 * @link https://github.com/forwardNow/AreaMap/tree/Qingshan
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
        LocationTagCache: null
    };

    /**
     * @description 缓存
     */
    AreaMap.LocationTagCache = {
        /**
         * @description 保存 LocationTag
         * @type { {id: LocationTag} }
         */
        cache: {
        },
        
        /**
         * @description 将 locationTag 添加到缓存
         * @param id {String}
         * @param locationTag {LocationTag}
         * @return {LocationTag}
         */
        set: function ( id, locationTag ) {
            this.cache[ id ] = locationTag;
            return this.cache[ id ];
        },
        /**
         * @description 根据指定ID获取 locationTag
         * @param id {String}
         * @return {LocationTag}
         */
        get: function ( id ) {
            return this.cache[ id ];
        },
        /**
         * @description 从缓存中删除指定ID的locationTag
         * @param id {String}
         */
        remove: function ( id ) {
            delete this.cache[ id ];
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

            _this._declare();

            /*
                _this.camera.position.x = 337084.0229452408;
                _this.camera.position.y = -336812.88479561365;
                _this.camera.left = -18932.797341393023;
                _this.camera.right = 18932.797341393023;
                _this.camera.top = 26417.856755432134;
                _this.camera.bottom = -26417.856755432134;
                _this.camera.updateProjectionMatrix();
            */
            _this._createView( {
                left: -18932, right: 18932, top: 26417, bottom: -26417,
                center: { x: 337084, y: -336812 }
            } );

            _this._bindEvent();

            _this._animate();



            initedCallback && initedCallback();
        } );

        return this;
    };
    
    /**
     * @description 构造界面
     * @param viewPort { {left: Number, right: Number, top: Number, bottom: Number, center: {x: Number, y: Number}}? } 视口
     */
    AreaMap._createView = function ( viewPort ) {
        var
            data = Config.getDxfObj(),
            $target = this.$target,
            width = $target.width(),
            height = $target.height(),
            font = Config.getFont(),
            threeDxfInstance,
            light
        ;

        threeDxfInstance = new window.ThreeDxf.Viewer(data, $target.get( 0 ), width, height, font, viewPort);

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
                /** @event clickedPersion */
                $target.trigger( "clickedPersion", AreaMap._intersected._pkuData );
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

        AreaMap._updateAllLocationTag();

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
            case 0:
            case 4: {
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
     * @param pos {{ id: String, x: Number, y: Number}}
     */
    AreaMap.createLocationTag = function ( pos ) {
        var
            locationTag
        ;

        if ( this.LocationTagCache.get( pos.id ) ) {
            this.updateLocationTag( pos );
            return;
        }
        locationTag = new LocationTag( this.scene, pos );

        locationTag.create();

        locationTag.update( pos );

        this.LocationTagCache.set( pos.id, locationTag );

        Config.getPersonInfoList();
    };

    /**
     * @description 更新 定位标签
     *
     *      在 当前坐标 和 目标坐标 之间，添加足够多的坐标 以形成“补间动画”。
     *      此方法只是将位置坐标压入位置队列，具体移动在 _animate() 中完成。
     *
     * @param pos {{ id: String, x: Number, y: Number}}
     */
    AreaMap.updateLocationTag = function ( pos ) {
        var
            locationTag = this.LocationTagCache.get( pos.id ),
            startPos, endPos

        ;
        if ( ! locationTag ) {
            this.createLocationTag( pos );
            return;
        }

        // locationTag.update( pos );

        startPos = {
            id: pos.id,
            x: locationTag.x,
            y: locationTag.y,
            cmd: 2
        };

        endPos = pos;
        endPos.cmd = 2;

        this._addTween( startPos, endPos );
    };

    /**
     * @description 在两个坐标点之间 添加 “补间动画”
     * @param startPos {{ id: String, x: Number, y: Number}} 开始坐标
     * @param endPos {{ id: String, x: Number, y: Number}} 结束坐标
     * @private
     */
    AreaMap._addTween = function ( startPos, endPos ) {
        var
            id = startPos.id,
            posList = [],
            start_x = startPos.x,
            start_y = startPos.y,
            end_x = endPos.x,
            end_y = endPos.y,
            delta_x = end_x - start_x,
            delta_y = end_y - start_y,
            i = 0, len = 11
        ;
        for ( ; i < len; i++ ) {
            posList.push( {
                id: id,
                cmd: 2,
                x: start_x + delta_x / 10 * i,
                y: start_y + delta_y / 10 * i
            } )
        }
        this._QueueCache.setQueue( id, posList );

    };

    /**
     * @description 队列缓存
     * @private
     */
    AreaMap._QueueCache = {
        /**
         * @description 保存位置坐标
         */
        queueCache: {
            // id: [ pos1, pos2 ]
        },
        /**
         * @description 弹出开头的坐标，
         * @param id {String}
         */
        shiftQueue: function ( id ) {
            var
                queue = this.getQueue( id )
            ;
            if ( queue ) {
                return queue.shift();
            }
        },
        /**
         * @description 弹出每一个队列的头一个坐标
         * @return {Array}
         */
        shiftEachQueue: function () {
            var
                id,
                queueCache = this.queueCache,
                pos,
                list = []
            ;
            for ( id in queueCache ) {
                if ( ! queueCache.hasOwnProperty( id ) ) {
                    continue;
                }
                pos = this.shiftQueue( id );
                if ( pos ) {
                    list.push( pos );
                }
            }
            return list;
        },
        /**
         * @description 添加位置列表
         * @param id {String}
         * @param posList {Array}
         */
        setQueue: function ( id, posList ) {
            this.queueCache[ id ] = posList;
        },
        /**
         * @description 获取队列
         */
        getQueue: function ( id ) {
            return this.queueCache[ id ];
        }
    };

    /**
     * @description 更新所有定位标签
     * @private
     */
    AreaMap._updateAllLocationTag = function () {
        var
            posList,
            locationTag,
            i, len,
            pos
        ;
        posList = this._QueueCache.shiftEachQueue();

        for ( i = 0, len = posList.length; i < len; i++ ) {
            pos = posList[ i ];
            if ( pos ) {
                locationTag = this.LocationTagCache.get( pos.id );
                pos.cmd = 2;
                // Config.log( "(" + pos.x * 10 + ", " + pos.y * 10 + ")" );
                locationTag.update( pos );
            }
        }
    };


    /**
     * @description 销毁
     * @param pos {{ id: String, x: Number, y: Number }}
     */
    AreaMap.destroyLocationTag = function ( pos ) {
        var
            locationTag = this.LocationTagCache.get( pos.id )
        ;
        if ( ! locationTag ) {
            console.warn( "【" + pos.id + "】不存在！" );
            return;
        }

        locationTag.destroy();

        this.LocationTagCache.remove( pos.id );

        Config.getPersonInfoList();
    };


    window.AreaMap = AreaMap;


    return AreaMap;
} );