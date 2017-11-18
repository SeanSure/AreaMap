/**
 * @fileoverview 位置标签
 * @author 吴钦飞
 * @link https://github.com/forwardNow/AreaMap
 */
define( [ "./config" ], function ( Config ) {

    /**
     * 位置标记
     * @param opts {{ id: String, x: Number, y: Number}}
     * @constructor
     */
    function LocationTag ( opts ) {
        this.opts = opts;
        this._init();
    }

    /**
     * 初始化
     *      创建并移动
     * @private
     */
    LocationTag.prototype._init = function () {
        this._fmtOpts( this.opts );
        this.create();
        this.move()
    };

    /**
     * 格式化opts
     * @example
     *      {
     *          id: "id_1"
     *          x: 22500,
     *          y: 3000,
     *          cmd: 1
     *      }
     *      格式化为
     *      {
     *          id: "id_1",
     *          position: {
     *              x: 22500,
     *              y: 3000
     *          },
     *          text: "吴钦飞"
     *      }
     * @private
     */
    LocationTag.prototype._fmtOpts = function () {
        var
            originOpts = this.opts,
            fmtOpts = {}
        ;
        fmtOpts.id = originOpts.id;
        fmtOpts.position = {
            x: originOpts.x,
            y: originOpts.y
        };
        fmtOpts.text = Config.getNameById(originOpts.id );
        this.opts = fmtOpts;
        this.originOpts = originOpts;
    };

    /**
     * 创建，定位锚
     * @private
     */
    LocationTag.prototype.create = function () {
        var
            THREE = window.THREE,
            scene = LocationTag.prototype.AreaMap.scene,
            text = this.opts.text,

            color,

            circleGeometry,
            circleMaterial,
            circleMesh,

            textGeometry,
            textMaterial,
            textMesh

        ;

        color = this._getColor();

        var texture = new THREE.TextureLoader().load( Config.imageDirUrl + "policeman_128x256.png" );
        circleGeometry = new THREE.PlaneGeometry( 1000 , 2000 );
        circleMaterial = new THREE.MeshBasicMaterial( { color: "#ffffff"/*, transparent: true, opacity: 0.9 */} );
        circleMaterial.map = texture;
        circleMesh = new THREE.Mesh( circleGeometry, circleMaterial );

        textGeometry = new THREE.TextGeometry( text, { font: Config.getFont(), height: 0, size: Config.textSize } );
        textMaterial = new THREE.MeshBasicMaterial( { color: color, transparent: true, opacity: 0.8 } );
        textMesh = new THREE.Mesh( textGeometry, textMaterial );

        this.textMesh = textMesh;
        this.circleMesh = circleMesh;

        this.circleMesh._pkuData = this.opts;

        scene.add( textMesh );
        scene.add( circleMesh );
    };

    /**
     * 获取颜色
     * @return {String} 颜色值，如 "#f1f1f1"
     * @private
     */
    LocationTag.prototype._getColor = function () {
        var
            colorList = Config.colorList
        ;

        if ( typeof colorList.currentIndex !== "number" ) {
            colorList.currentIndex = 0;
        }

        colorList.currentIndex++;

        if ( colorList.currentIndex >= colorList.length ) {
            colorList.currentIndex = 0;
        }

        return colorList[ colorList.currentIndex ];
    };



    /**
     * 移动
     * @param pos {({x: Number, y: Number}|{textPositionX: Number, textPositionY: Number, trianglePositionX: Number, trianglePositionY: Number, circlePositionX: Number, circlePositionY: Number})?}
     */
    LocationTag.prototype.move = function ( pos ) {
        var
            circlePosition,
            // littleCirclePosition,
            textPosition
        ;
        pos = pos || this.opts.position;

        if ( ! pos.hasOwnProperty( "textPositionX" ) ) {
            pos = this._calcLocatorPos( pos );
        }

        textPosition = this.textMesh.position;
        textPosition.x = pos.textPositionX;
        textPosition.y = pos.textPositionY;
        textPosition.z = 0;


        circlePosition = this.circleMesh.position;
        circlePosition.x = pos.circlePositionX;
        circlePosition.y = pos.circlePositionY;
        circlePosition.z = 0;

        LocationTag.prototype.AreaMap.update();
    };


    /**
     * 根据文本计算元素的尺寸
     * @param text {String?}
     * @return {{planeWidth: number, planeHeight: number, textWidth: number, textHeight: number}}
     * @private
     */
    LocationTag.prototype._calcSize = function ( text ) {
        var
            textLength,

            textWidth,
            textHeight,
            planeWidth,
            planeHeight
        ;

        text = text || this.opts.text;

        if ( $.isNumeric( text ) ) {
            textLength = ( text + "" ).length / 1.6;
        } else {
            textLength = text.length;
        }

        textWidth = textLength * Config.textSize;
        textHeight = Config.textSize;

        planeWidth = textWidth * 1.6;
        planeHeight = textHeight * 1.6;


        return {
            planeWidth: planeWidth,
            planeHeight: planeHeight,

            textWidth: textWidth,
            textHeight: textHeight
        };
    };


    /**
     * 根据(x,y)坐标计算实际的坐标
     * @param pos {({x: Number, y: Number})?}
     * @return {{textPositionX: Number, textPositionY: Number, trianglePositionX: Number, trianglePositionY: Number, circlePositionX: Number, circlePositionY: Number}}
     * @private
     */
    LocationTag.prototype._calcLocatorPos = function ( pos ) {
        var
            xRate = Config.xRate,
            yRate = Config.yRate,

            size = this._calcSize(),

            textWidth = size.textWidth,
            textHeight = size.textHeight,

            circlePositionX,
            circlePositionY,
            textPositionX,
            textPositionY
        ;


        circlePositionX = pos.x * xRate;
        circlePositionY = pos.y * yRate + Config.textSize * 3.4;


        textPositionX = pos.x * xRate - textWidth / 2 * 1.3;
        textPositionY = pos.y * yRate - textHeight / 2;

        return {

            circlePositionX: circlePositionX,
            circlePositionY: circlePositionY,

            textPositionX: textPositionX,
            textPositionY: textPositionY
        };
    };

    /**
     * 销毁
     */
    LocationTag.prototype.destroy = function () {
        var
            meshNameList = [ "textMesh", "planeMesh", "circleMesh", "triangleMesh" ],
            mesh, meshName, i, len
        ;
        // 从缓存中删除
        LocationTag.prototype.AreaMap.locationTagSet[ this.opts.id ] = undefined;

        // 在场景中删除对应的物体
        for ( i = 0, len = meshNameList.length; i < len; i++ ) {
            meshName = meshNameList[ i ];
            mesh = this[ meshName ];
            if ( ! mesh ) {
                continue;
            }
            LocationTag.prototype.AreaMap.scene.remove( mesh );
            this[ meshName ] = null;
        }

    };

    return LocationTag;
} );