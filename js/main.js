// 模块及其依赖配置
require.config( {
    paths: {
        "jquery": "jquery/2.2.4/jquery",
        "threewapper": "three/threewapper",
        "dxfparserwapper": "dxfParser/dxfparserwapper",
        "OrbitControls": "three/OrbitControls",
        "threedxf": "threedxf/0.2.1.x/three-dxf"
    },
    shim : {
        "OrbitControls": [ "threewapper", "jquery" ],
        "threedxf": [ "OrbitControls", "dxfparserwapper" ]
    },
    waitSeconds: 150
} );

/**
 * @fileoverview
 *      入口文件
 * @link https://github.com/forwardNow/AreaMap
 * @author 吴钦飞
 */
define( [ "jquery", "./areamap/areaMap" ], function ( $, AreaMap) {
    "use strict";

    $( document ).ready( function () {

        var
            $areaMap = $( "#areaMap" ),
            options,
            currentPersonId = "56780"
        ;

        options = $areaMap.data( "options" );

        // 初始化
        AreaMap.init( options, function () {

            // 设置位置标签
            AreaMap.setLocationTag( { cmd: 1, id: "56780", x: 336274/10, y: -331342/10 } );
            AreaMap.setLocationTag( { cmd: 1, id: "56782", x: 340274/10, y: -331342/10 } );
            AreaMap.setLocationTag( { cmd: 1, id: "56786", x: 344274/10, y: -331342/10 } );
            AreaMap.setLocationTag( { cmd: 1, id: "56781", x: 336274/10, y: -335342/10 } );
            AreaMap.setLocationTag( { cmd: 1, id: "56783", x: 340274/10, y: -335342/10 } );
            AreaMap.setLocationTag( { cmd: 1, id: "56787", x: 344274/10, y: -335342/10 } );

            $areaMap.on( "clickedCanvas", function ( event, pos ) {
                AreaMap.setLocationTag( { cmd: 2, id: currentPersonId, x: pos.x / 10, y: pos.y / 10 } );
            } ) ;

        } );

        // 点击人后 触发事件“clickedPersion”
        $areaMap.on( "clickedPersion", function ( event, data ) {
            // console.info( data );
            // alert( data.id );
            currentPersonId = data.id;
        } );





    } );

} );