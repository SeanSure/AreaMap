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
                id: "56789",
                x: 42067/10,
                y: -455732/10
            } );

            var
                step = 10,
                count = 0
            ;
            window.setInterval( function () {
                AreaMap.setLocationTag( {
                    cmd: 1,
                    id: "56789",
                    x: 42067/10 + step * count,
                    y: -455732/10 + step * count
                } );
                count++;
            }, 60 );

            // 设置位置标签
            AreaMap.setLocationTag( {
                cmd: 1,
                id: "id_1",
                x: 45885.24267402282/10,
                y: -458450.18993214157/10
            } );

            // 设置位置标签
            AreaMap.setLocationTag( {
                cmd: 1,
                id: "id_2",
                x: 39017.73793295676/10,
                y: -458691.5069131042/10
            } );


        } );


        // 点击人后 触发事件“clickedPersion”
        $( document ).on( "clickedPersion", function ( event, data ) {
            console.info( data );
            alert( data.id );
        } )
    } );

} );