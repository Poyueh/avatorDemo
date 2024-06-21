/**
 * 影子參數設定常數
 * @type {{MAP_SIZE_HEIGHT: number, CAMERA_RIGHT: number, CAMERA_NEAR: number, RADIUS: number, CAMERA_FAR: number, MAP_SIZE_WIDTH: number, CAMERA_TOP: number, BIAS: number, CAMERA_BOTTOM: number, CAST_SHADOW: boolean, CAMERA_LEFT: number}}
 */
export const SHADOW_SETTING = {
    CAST_SHADOW: true,// 是否開啟陰影
    MAP_SIZE_WIDTH: 2048, // 陰影解析度
    MAP_SIZE_HEIGHT: 2048, // 陰影解析度
    RADIUS: 3, // 陰影的柔和度
    BIAS: -0.001, // 陰影的偏差
    CAMERA_TOP: 2,// 視錐的上邊界
    CAMERA_BOTTOM: -2,// 視錐的下邊界
    CAMERA_LEFT: -2,// 視錐的左邊界
    CAMERA_RIGHT: 2,// 視錐的右邊界
    CAMERA_NEAR: 10,// 視錐的近裁剪面，即攝影機能夠“看到”的最近距離
    CAMERA_FAR: 40,// 視錐的遠裁剪面，即攝影機能夠“看到”的最遠距離
}