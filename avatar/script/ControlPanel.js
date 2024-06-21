import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
import {TEXTURE_LIST} from "./TEXTURE_LIST";
import {MODEL_LIST} from "./MODEL_LIST";
import {SKIN_COLOR} from "./SKIN_COLOR";
import {TEXTURE_TYPE} from "./TEXTURE_TYPE";
import {MODEL_TYPE} from "./MODEL_TYPE";
import {LIGHT_SETTING} from "./LIGHT_SETTING";
import {ShadowParam} from "./ShadowParam";
import {SHADOW_SETTING} from "./SHADOW_SETTING";

/**
 * dat.gui (開發輔助工具 three.js 裡面就有 lib 也能單獨去找這 lib 去方便開發)
 */
export class ControlPanel {
    /**
     * controlPanel
     * @param avatarData {AvatarData} 紙娃娃資料
     * @param avatarExecutor {AvatarExecutor} 紙娃娃系統執行者
     */
    constructor(avatarData, avatarExecutor) {
        // dat.gui
        const gui = new GUI();
        const avatar = gui.addFolder('紙娃娃');
        const model = avatar.addFolder('部件');
        const texture = avatar.addFolder('貼圖');
        const skin = avatar.addFolder('膚色');

        const backgroundColor = gui.addFolder('背景底色');
        let modelList = [];
        let textureList = [];
        let skinList = [];

        const render = gui.addFolder('渲染相關設定');
        const light = render.addFolder('光');
        const hemisphereLight = light.addFolder('半球光');
        const directionalLight = light.addFolder('平行光');
        const shadow = render.addFolder('影');

        // avatar.close();
        // model.close();
        // texture.close();
        // skin.close();
        backgroundColor.close();
        render.close();
        light.close();
        hemisphereLight.close();
        directionalLight.close();
        shadow.close();

        // 部件
        Object.values(MODEL_LIST).forEach((model) => {
            if (model === MODEL_LIST.MAIN_MODEL || !model) return;
            modelList.push(model)
        })
        const listA = {model: avatarData.body_up_A};
        model.add(listA, "model").options(modelList)
            .listen()
            .onChange(async (value) => {
                console.log(value)
                await avatarExecutor.changeModel("body_up_A", value);// 更換模型
            });

        // 貼圖
        Object.values(TEXTURE_LIST).forEach((texture) => {
            if (texture === TEXTURE_LIST.SKIN) return;
            if (!texture) {
                textureList.push("noFace");
                return;
            }
            textureList.push(texture)
        })
        const listB = {texture: avatarData.eyes};
        texture.add(listB, "texture").options(textureList)
            .listen()
            .onChange(async (value) => {
                if (value === "noFace") {
                    await avatarExecutor.removeTexture(TEXTURE_TYPE.FACE);// 移除面部特徵
                    return;
                }
                const type = value.split("_")[0];
                await avatarExecutor.changeFace(type, value);// 更換臉部貼圖（眼睛、嘴吧、面部特徵）
            });

        // 膚色
        Object.values(SKIN_COLOR).forEach((color) => {
            skinList.push(color)
        })

        const characterList = ["A", "B", "C", "D", "E"];
        const listC = {type: characterList[skinList.findIndex((e) => e === avatarData.skin)]};
        skin.add(listC, "type").options(characterList)
            .listen()
            .onChange(async (value) => {
                const idx = characterList.findIndex((e) => e === value);
                await avatarExecutor.changeSkin(skinList[idx]);
            });

        // 底色
        const bgColor = {color: 0xf7fbe9};
        avatarExecutor.setSceneBackgroundColor(bgColor.color);
        backgroundColor.addColor(bgColor, "color")
            .listen()
            .onChange((value) => {
                avatarExecutor.setSceneBackgroundColor(value);// 更換底色
            });

        // 半球光
        const hemisphere = LIGHT_SETTING.HEMISPHERE;
        let hemisphereLightParam = {
            sky_color: hemisphere.SKY_COLOR,
            ground_color: hemisphere.GROUND_COLOR,
            intensity: hemisphere.INTENSITY
        };
        avatarExecutor['_renderStage'].setHemisphereLight(hemisphereLightParam.sky_color, hemisphereLightParam.ground_color, hemisphereLightParam.intensity);
        hemisphereLight.addColor(hemisphereLightParam, "sky_color")
            .listen()
            .onChange((value) => {
                hemisphereLightParam.sky_color = value;
                avatarExecutor['_renderStage'].setHemisphereLight(hemisphereLightParam.sky_color, hemisphereLightParam.ground_color, hemisphereLightParam.intensity);
            });
        hemisphereLight.addColor(hemisphereLightParam, "ground_color")
            .listen()
            .onChange((value) => {
                hemisphereLightParam.ground_color = value;
                avatarExecutor['_renderStage'].setHemisphereLight(hemisphereLightParam.sky_color, hemisphereLightParam.ground_color, hemisphereLightParam.intensity);
            });
        hemisphereLight.add(hemisphereLightParam, "intensity")
            .listen()
            .onChange((value) => {
                avatarExecutor['_renderStage'].setHemisphereLight(hemisphereLightParam.sky_color, hemisphereLightParam.ground_color, hemisphereLightParam.intensity);
            })

        // 半球光位置
        const hemispherePos = {x: hemisphere.POSITION.X, y: hemisphere.POSITION.Y, z: hemisphere.POSITION.Z}
        Object.keys(hemispherePos).forEach((key, idx) => {
            hemisphereLight.add(hemispherePos, key)
                .listen()
                .onChange((value) => {
                    hemispherePos[key] = value
                    avatarExecutor["_renderStage"].setHemisphereLightPos(hemispherePos.x, hemispherePos.y, hemispherePos.z);
                })

        });

        // 平行光
        const directional = LIGHT_SETTING.DIRECTIONAL;
        const directionalLightParam = {
            color: directional.COLOR,
            intensity: directional.INTENSITY
        };
        avatarExecutor["_renderStage"].setDirectionalLight(directionalLightParam.color, directionalLightParam.intensity);
        directionalLight.addColor(directionalLightParam, "color")
            .listen()
            .onChange((value) => {
                avatarExecutor["_renderStage"].setDirectionalLight(directionalLightParam.color, directionalLightParam.intensity);
            });
        directionalLight.add(directionalLightParam, "intensity")
            .listen()
            .onChange((value) => {
                avatarExecutor["_renderStage"].setDirectionalLight(directionalLightParam.color, directionalLightParam.intensity);
            })
        // 平行光位置
        const directionalPos = {x: directional.POSITION.X, y: directional.POSITION.Y, z: directional.POSITION.Z}
        Object.keys(directionalPos).forEach((key, idx) => {
            directionalLight.add(directionalPos, key)
                .listen()
                .onChange((value) => {
                    directionalPos[key] = value
                    avatarExecutor["_renderStage"].setDirectionalLightPos(directionalPos.x, directionalPos.y, directionalPos.z);
                })

        });

        // 影子
        const shadowParam = new ShadowParam();
        const shadowParamList = [];
        Object.values(SHADOW_SETTING).forEach((param) => shadowParamList.push(param));
        Object.keys(shadowParam).forEach((key, idx) => {
            shadowParam[key] = shadowParamList[idx];
            shadow.add(shadowParam, key)
                .listen()
                .onChange((value) => {
                    shadowParam[key] = value
                    avatarExecutor['_renderStage']['setShadow'](shadowParam);// 調整影子參數
                    console.log(shadowParam)
                })

        });
    }
}