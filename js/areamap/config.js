/**
 * @fileoverview 配置
 *
 * @author 吴钦飞
 * @link https://github.com/forwardNow/AreaMap
 */
define( [ "jquery", "threedxf" ], function ( $ ) {
    "use strict";
    var
        Config,
        THREE = window.THREE
    ;

    Config = {

        targetSelector: null,

        /** dxf文件 - URL */
        dxfUrl: null,
        /** dxf文件 - 解析dxf文件后生成的JS对象 */ //
        _dxfObj: null,

        /** 字体文件 - URL */
        fontUrl: null,
        /** 字体文件 - 字体文件对象 */
        _font: null,


        /** 人员信息列表 - URL */
        personInfoListUrl: null,
        /** 人员信息列表 - 集合 */
        _personInfoListDic: {
            // "56789": { "id": "56789", "name": "吴钦飞", "type": "ordinary_man" },
        },

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
        /** 人 - 质地集合 */
        _personTextureSet: {},

        /** 字体大小 */
        textSize: 400,
        /** 实际的X坐标 与 请求的X坐标 比 */
        xRate: 10,
        /** 实际的Y坐标 与 请求的Y坐标 比 */
        yRate: 10,

        /** 颜色列表 */
        _colorList: [
            "#7eb8f2",
            "#98689a",
            "#0099cb",
            "#ff6764",
            "#ff9a66",
            "#cd9967",
            "#666666",
            "#99ce66",
            "#cc3431",
            "#013565",
            "#993331",
            "#653567",
            "#0067cc",
            "#cc032f",
            "#346633",
            "#993331",
            "#013300",
            "#323499",
            "#003499",
            "#029b63",
            "#fe9b00"
        ]
    };

    /**
     * @description 初始化
     * @param options {Object}
     * @param callback {Function}
     * @public
     */
    Config.init = function ( options, callback ) {

        $.extend( this, options );

        this._prepareData( callback );

        this._initTextureSet();

        return this;
    };


    /**
     * @description 初始化人质地集合
     * @private
     */
    Config._initTextureSet = function () {
        var
            humanType,
            pictureName,
            pictureUrl,
            personPictureSet = this.personPictureSet,
            humanTextureSet = this._personTextureSet,
            personPictureDirectory = this.personPictureDirectory
        ;

        for ( humanType in personPictureSet ) {
            if ( ! personPictureSet.hasOwnProperty( humanType ) ) {
                continue;
            }
            pictureName = personPictureSet[ humanType ];
            pictureUrl = personPictureDirectory + pictureName;
            humanTextureSet[ humanType ] = new THREE.TextureLoader().load( pictureUrl );
        }

    };

    /**
     * 准备数据（字体文件和DXF文件）
     * @param callback {Function?}
     * @private
     */
    Config._prepareData = function ( callback ) {
        var
            _this = this
        ;

        console.info( "准备数据..." );

        this.getPersonInfoList( function () {
            console.info( "人员信息列表请求完毕！" );
            _this.getPersonInfoList._isOk = true;
            refresh();
        } );

        this.getDxfObj( function () {
            console.info( "DXF文件请求完毕！" );
            _this.getDxfObj._isOk = true;
            refresh();
        } );
        this.getFont( function () {
            console.info( "字体文件请求完毕！" );
            _this.getFont._isOk = true;
            refresh();
        } );

        function refresh() {
            if ( _this.getPersonInfoList._isOk !== true ) {
                return;
            }
            if ( _this.getDxfObj._isOk !== true ) {
                return;
            }
            if ( _this.getFont._isOk !== true ) {
                return;
            }
            console.info( "数据准备完毕！" );
            callback();
        }

    };

    /**
     * 获取 dxf文件，并解析生成JS对象
     * @param callback {Function?}
     * @return {undefined|Object}
     * @public
     */
    Config.getDxfObj = function ( callback ) {
        var
            _this = this
        ;
        if ( this._dxfObj ) {
            return this._dxfObj;
        }
        $.ajax( {
            async: true,
            url: this.dxfUrl,
            method: "GET",
            dataType: "text"
        } ).done( function ( dxfText ) {
            var
                dxfParser = new DxfParser(),
                _dxfObj
            ;
            _dxfObj = dxfParser.parseSync( dxfText );
            _this._dxfObj = _dxfObj;
            callback && callback( _dxfObj );
        } ).fail( function () {
            console.error( "获取 dxf文件 失败。" );
        } );
    };
    /**
     * @description 获取字体对象
     * @param callback {Function?}
     * @return {undefined|THREE.Font}
     * @public
     */
    Config.getFont = function ( callback ) {
        var
            _this = this
        ;
        if ( this._font ) {
            return this._font;
        }

        $.ajax( {
            async: true,
            url: this.fontUrl,
            method: "GET",
            dataType: "json"
        } ).done( function ( data ) {
            _this._font = ( new THREE.FontLoader() ).parse( data );
            callback && callback();
        } ).fail( function () {
            console.error( "获取 字体文件 失败。" );
        } );
    };

    /**
     * @description 获取人员信息列表
     * @param callback {Function?}
     * @param isSync {Boolean?} 是否同步
     * @public
     */
    Config.getPersonInfoList = function ( callback, isSync ) {
        var
            _this = this
        ;
        $.ajax( {
            async: !isSync,
            url: this.personInfoListUrl,
            method: "GET",
            cache: false,
            dataType: "json"
        } ).done( function ( responseData ) {
            if ( responseData && responseData.success === true ) {
                _this._personInfoListDic = responseData.data;
                callback && callback();
            }
            else {
                throw "获取人员信息列表 失败！";
            }
        } ).fail( function () {
            console.error( "获取人员信息列表 失败！" );
        } );
    };


    /**
     * @description 根据id获取人员名称
     * @param id {String}
     * @return {String}
     * @public
     */
    Config.getNameById = function ( id ) {
        var
            name = this.getPersonInfoById( id ).name
        ;
        if ( name !== undefined ) {
            return name;
        }
        console.info( "未获取到【" + id + "】对应的名称，同步请求人员信息列表.." );

        this.getPersonInfoList( null, true );
        
        name = this.getPersonInfoById( id ).name;

        if ( name === undefined ) {
            name = id;
        }
        return name;
    };

    /**
     * @description 根据id获取人的材质
     * @param id {String}
     * @return {THREE.Texture}
     * @public
     */
    Config.getPersonTextureById = function ( id ) {
        var
            personInfo = this.getPersonInfoById( id ),
            type = personInfo.type
        ;
        if ( this._personTextureSet.hasOwnProperty( type ) ) {
            return this._personTextureSet[ type ];
        }
        return this._personTextureSet[ "ordinary_man" ];
    };

    /**
     * @description 根据id获取人员信息
     * @param id {String}
     * @return { {id:String, name: String, type: String} }
     * @public
     */
    Config.getPersonInfoById = function ( id ) {
        return this._personInfoListDic[ id ] || {};
    };

    /**
     * @description 获取颜色
     * @return {String}
     */
    Config.getColor = function () {
        var
            _colorList = Config._colorList
        ;

        if ( _colorList.index === undefined ) {
            _colorList.index = 0;
        }

        _colorList.index++;

        if ( _colorList.index >= _colorList.length ) {
            _colorList.index = 0;
        }

        return _colorList[ _colorList.index ];
    };

    return Config;
} );