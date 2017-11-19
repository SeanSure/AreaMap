/**
 * @fileoverview 位置标签
 * @author 吴钦飞
 * @link https://github.com/forwardNow/AreaMap
 */
define( [ "./config" ], function ( Config ) {

    /**
     * 位置标记
     * @param scene {THREE.Scene}
     * @param opts {{ id: String, x: Number, y: Number}}
     * @constructor
     */
    function LocationTag ( scene, opts ) {
        this.scene = scene;
        this.options = opts;
        this._declare();
    }

    LocationTag.prototype._declare = function () {
        /**
         * @type {THREE.Mesh}
         */
        this.textMesh = null;
        /**
         * @type {THREE.Mesh}
         */
        this.planeMesh = null;

        /**
         * @description 显示的文本
         * @type {String}
         */
        this.text = null;

        /**
         * @description x 坐标
         * @type {number}
         */
        this.x = 0;

        /**
         * @description y 坐标
         * @type {number}
         */
        this.y = 0;

    };

    /**
     * @description 创建，定位锚
     */
    LocationTag.prototype.create = function ( ) {
        var
            THREE = window.THREE,
            text,
            color,
            scene,

            planeGeometry,
            planeMaterial,
            planeMesh,

            textGeometry,
            textMaterial,
            textMesh

        ;

        scene = this.scene;

        color = Config.getColor();
        text = Config.getNameById( this.options.id );


        var texture = new THREE.TextureLoader().load( Config.imageDirUrl + "policeman_128x256.png" );

        planeGeometry = new THREE.PlaneGeometry( 1000 , 2000 );
        planeMaterial = new THREE.MeshBasicMaterial( { color: "#ffffff"} );
        planeMaterial.map = texture;
        planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );

        textGeometry = new THREE.TextGeometry( text, { font: Config.getFont(), height: 0, size: Config.textSize } );
        textMaterial = new THREE.MeshBasicMaterial( { color: color } );
        textMesh = new THREE.Mesh( textGeometry, textMaterial );

        textGeometry.translate( -( text.length * 300 ), -( 1000 + Config.textSize + 100 ), 0 );

        this.text = text;
        this.textMesh = textMesh;
        this.planeMesh = planeMesh;

        this.planeMesh._pkuData = this.options;

        scene.add( textMesh );
        scene.add( planeMesh );
    };


    /**
     * @description 更新
     * @param opts {{ id: String, x: Number, y: Number}}
     */
    LocationTag.prototype.update = function ( opts ) {
        var
            text = Config.getNameById( opts.id )
        ;
        if ( this.x !== opts.x || this.y !== opts.y ) {
            this.move( opts );
        }
        if ( this.text !== text ) {
            this.setText();
        }

    };

    /**
     * @description 移动
     */
    LocationTag.prototype.move = function ( pos ) {
        var
            x = pos.x,
            y = pos.y
        ;

        this.planeMesh.position.set( x * Config.xRate, y  * Config.yRate, 0 );
        this.textMesh.position.set( x * Config.xRate, y * Config.yRate, 0 );

        this.x = x;
        this.y = y;
    };

    /**
     * @description 设置文本
     */
    LocationTag.prototype.setText = function ( text ) {
        this.textMesh.material.text = text;
        this.text = text;
    };


    /**
     * @description 销毁
     */
    LocationTag.prototype.destroy = function () {
        this.scene.remove( this.planeMesh );
        this.scene.remove( this.textMesh );
        this.planeMesh = null;
        this.textMesh = null;
    };

    return LocationTag;
} );