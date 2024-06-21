/**
 * 光源設定
 * @type {{HEMISPHERE: {SKY_COLOR: number, POSITION: {X: number, Y: number, Z: number}, GROUND_COLOR: number, INTENSITY: number}, DIRECTIONAL: {POSITION: {X: number, Y: number, Z: number}, COLOR: number, INTENSITY: number}}}
 */
export const LIGHT_SETTING = {
    HEMISPHERE: {
        SKY_COLOR: 0xffffff,
        GROUND_COLOR: 0x8d8d8d,
        INTENSITY: 6,
        POSITION: {X: 0, Y: 20, Z: 0}
    },
    DIRECTIONAL: {
        COLOR: 0xffffff,
        INTENSITY: 2.5,
        POSITION: {X: 10, Y: 20, Z: 5}
    }
}