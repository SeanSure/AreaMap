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
            options
        ;

        options = $( "#areaMap" ).data( "options" );

        // 初始化
        AreaMap.init( options, function () {

            // 设置位置标签
            AreaMap.setLocationTag( {
                cmd: 1,
                id: "56780",
                x: 330000/10,
                y: -330000/10
            } );
            //
            // var
            //     step = 10,
            //     count = 0
            // ;
            // window.setInterval( function () {
            //     AreaMap.setLocationTag( {
            //         cmd: 1,
            //         id: "56789",
            //         x: 330000/10 + step * count,
            //         y: -330000/10 + step * count
            //     } );
            //     count++;
            // }, 60 );

            // 设置位置标签
            AreaMap.setLocationTag( {
                cmd: 1,
                id: "56782",
                x: 337749.473228921/10,
                y: -332075.02148763154/10
            } );

            // 设置位置标签
            AreaMap.setLocationTag( {
                cmd: 1,
                id: "56786",
                x: 341778.1105424956/10,
                y: -336339.09238477936/10
            } );


        } );


        // 点击人后 触发事件“clickedPersion”
        $( document ).on( "clickedPersion", function ( event, data ) {
            console.info( data );
            alert( data.id );
        } )
    } );

} );