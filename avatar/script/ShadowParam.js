/**
 * 影子的參數物件
 */
export class ShadowParam {
    castShadow = false;// 是否開啟陰影
    mapSizeWidth = 0; // 陰影解析度
    mapSizeHeight = 0; // 陰影解析度
    radius = 0; // 陰影的柔和度
    bias = 0; // 陰影的偏差
    cameraTop = 0;// 視錐的上邊界
    cameraBottom = 0;// 視錐的下邊界
    cameraLeft = 0;// 視錐的左邊界
    cameraRight = 0;// 視錐的右邊界
    cameraNear = 0;// 視錐的近裁剪面，即攝影機能夠“看到”的最近距離
    cameraFar = 0;// 視錐的遠裁剪面，即攝影機能夠“看到”的最遠距離
}