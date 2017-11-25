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
 * @fileoverview 入口文件
 * @link https://github.com/forwardNow/AreaMap/tree/Qingshan
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

        /**
         * @description 将服务器返回的数据转换成需要的数据
         * @example
         *      将 “data/personInfoListData_2.json” 转换成 “data/personInfoListData.json”
         * @param personInfoDic
         */
        options.handlePersonInfoResponse = function ( personInfoDic ) {
            var
                tagId,
                personInfo,
                fmtPersonInfo,
                type,
                objtype,
                peopleSex,
                fmtPersonInfoDic = {}
            ;
            for ( tagId in personInfoDic ) {
                if ( ! personInfoDic.hasOwnProperty( tagId ) ) {
                    continue;
                }
                personInfo = personInfoDic[ tagId ];

                objtype = personInfo.objtype;
                peopleSex = personInfo.peopleSex;

                // 1010：办案民警，1020：办案协警
                // 2010：嫌疑人
                // 2020：律师，2030：监护人，9000：其他人员
                if ( objtype.indexOf( "1010" ) !== -1 ) {
                    type = "police_";
                }
                else if ( objtype.indexOf( "1020" ) !== -1 ) {
                    type = "police_";
                }
                else if ( objtype.indexOf( "2010" ) !== -1 ) {
                    type = "suspect_";
                }
                else if ( objtype.indexOf( "2020" ) !== -1 ) {
                    type = "ordinary_";
                }
                else if ( objtype.indexOf( "2030" ) !== -1 ) {
                    type = "ordinary_";
                }
                else if ( objtype.indexOf( "9000" ) !== -1 ) {
                    type = "ordinary_";
                }
                else {
                    type = "ordinary_";
                }

                if ( peopleSex === "2" || peopleSex === 2 ) {
                    type += "woman";
                } else {
                    type += "man";
                }

                fmtPersonInfo = {
                    id: tagId,
                    name: personInfo.peopleName || tagId,
                    type: type
                };

                fmtPersonInfoDic[ tagId ] = fmtPersonInfo;
            }

            return fmtPersonInfoDic;
        };

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