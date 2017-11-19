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

        // id到name的映射
        idToNameMappingUrl: null,
        _idToNameMapping: null,

        /** 字体大小 */
        textSize: 400,
        /** 实际的X坐标 与 请求的X坐标 比 */
        xRate: 10,
        /** 实际的Y坐标 与 请求的Y坐标 比 */
        yRate: 10,

        /** 图片URL */
        imageDirUrl: "",

        /** 颜色列表 */
        colorList: [
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

        return this;
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

        this.updateIdToNameMapping( function () {
            console.info( "映射文件请求完毕！" );
            _this.updateIdToNameMapping._isOk = true;
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
            if ( _this.updateIdToNameMapping._isOk !== true ) {
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
     * @private
     * @param callback {Function?}
     * @return {undefined|Object}
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
     * @description 异步更新 id到名称的映射
     * @param callback {Function?}
     * @param isSync {Boolean?} 是否同步
     * @public
     */
    Config.updateIdToNameMapping = function ( callback, isSync ) {
        var
            _this = this
        ;
        $.ajax( {
            async: !isSync,
            url: this.idToNameMappingUrl,
            method: "GET",
            cache: false,
            dataType: "json"
        } ).done( function ( responseData ) {
            if ( responseData && responseData.success === true ) {
                _this._idToNameMapping = responseData.data;
                callback && callback();
            }
            else {
                throw "获取 ID到名称的映射表 失败！";
            }
        } ).fail( function () {
            console.error( "获取 ID到名称的映射表 失败！" );
        } );
    };


    /**
     * @description 根据id获取名称
     * @param id {String}
     * @return {String}
     */
    Config.getNameById = function ( id ) {
        var
            name = this._idToNameMapping[ id ]
        ;
        if ( name !== undefined ) {
            return name;
        }
        console.info( "未获取到【" + id + "】对应的名称，尝试同步请求映射表.." );

        this.updateIdToNameMapping( null, true );
        
        name = this._idToNameMapping[ id ];

        if ( name === undefined ) {
            name = id;
        }
        return name;
    };


    /**
     * @description 获取颜色
     * @return {String}
     */
    Config.getColor = function () {
        var
            colorList = Config.colorList
        ;

        if ( colorList.index === undefined ) {
            colorList.index = 0;
        }

        colorList.index++;

        if ( colorList.index >= colorList.length ) {
            colorList.index = 0;
        }

        return colorList[ colorList.index ];
    };

    return Config;
} );